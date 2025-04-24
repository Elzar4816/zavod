package handlers

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"time"
	"zavod/models"
)

func ProduceNewFinishedGood(c *gin.Context, db *gorm.DB) {
	type ProduceRequest struct {
		ProductID  uint    `json:"product_id" binding:"required"`
		Quantity   float64 `json:"quantity" binding:"required,gt=0"`
		EmployeeID uint    `json:"employee_id" binding:"required"`
	}

	var req ProduceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := db.Transaction(func(tx *gorm.DB) error {
		// 1. Получить ингредиенты
		ingredients, err := getIngredientsForProduct(tx, req.ProductID)
		if err != nil {
			return err
		}

		// 2. Проверить доступность сырья
		if err := checkIngredientsAvailability(ingredients, req.Quantity); err != nil {
			return err
		}

		// 3. Обновить сырьё и получить стоимость
		totalCost, err := updateRawMaterials(tx, ingredients, req.Quantity)
		if err != nil {
			return err
		}

		// 4. Обновить готовую продукцию с использованием общей стоимости
		if err := updateFinishedGood(tx, req.ProductID, req.Quantity, totalCost); err != nil {
			return err
		}

		// 5. Записать факт производства
		if err := recordProduction(tx, req.ProductID, req.Quantity, req.EmployeeID); err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "production successful"})
}

// Вынесение получения ингредиентов для продукта
func getIngredientsForProduct(tx *gorm.DB, productID uint) ([]models.Ingredient, error) {
	var ingredients []models.Ingredient
	if err := tx.Preload("RawMaterial").
		Where("product_id = ?", productID).
		Find(&ingredients).Error; err != nil {
		return nil, err
	}

	if len(ingredients) == 0 {
		return nil, errors.New("no ingredients found for the product")
	}

	return ingredients, nil
}

// Вынесение проверки доступности ингредиентов
func checkIngredientsAvailability(ingredients []models.Ingredient, quantity float64) error {
	for _, ing := range ingredients {
		requiredQty := ing.Quantity * quantity
		if ing.RawMaterial.Quantity < requiredQty {
			return fmt.Errorf("not enough raw material: %s", ing.RawMaterial.Name)
		}
	}
	return nil
}

// Вынесение обновления количества и стоимости сырья
func updateRawMaterials(tx *gorm.DB, ingredients []models.Ingredient, quantity float64) (float64, error) {
	var totalCost float64

	for _, ing := range ingredients {
		requiredQty := ing.Quantity * quantity
		rawMaterial := ing.RawMaterial

		if rawMaterial.Quantity == 0 {
			return 0, fmt.Errorf("у сырья ID %d нулевая масса — невозможно рассчитать стоимость", rawMaterial.ID)
		}

		unitCost := rawMaterial.TotalAmount / rawMaterial.Quantity
		costToDeduct := unitCost * requiredQty
		totalCost += costToDeduct

		if err := tx.Model(&models.RawMaterial{}).
			Where("id = ?", rawMaterial.ID).
			Updates(map[string]interface{}{
				"quantity":     gorm.Expr("quantity - ?", requiredQty),
				"total_amount": gorm.Expr("total_amount - ?", costToDeduct),
			}).Error; err != nil {
			return 0, err
		}
	}

	return totalCost, nil
}

// Вынесение обновления finished goods
func updateFinishedGood(tx *gorm.DB, productID uint, quantity, totalCost float64) error {
	var product models.FinishedGood
	if err := tx.First(&product, productID).Error; err != nil {
		return err
	}

	if err := tx.Model(&models.FinishedGood{}).
		Where("id = ?", product.ID).
		Updates(map[string]interface{}{
			"quantity":     gorm.Expr("quantity + ?", quantity),
			"total_amount": gorm.Expr("total_amount + ?", totalCost),
		}).Error; err != nil {
		return err
	}

	return nil
}

// Вынесение записи о производстве
func recordProduction(tx *gorm.DB, productID uint, quantity float64, employeeID uint) error {
	production := models.ProductProduction{
		ProductID:      productID,
		Quantity:       quantity,
		ProductionDate: time.Now(),
		EmployeeID:     employeeID,
	}

	if err := tx.Create(&production).Error; err != nil {
		return err
	}

	return nil
}

func ListProductProductions(c *gin.Context, db *gorm.DB) {
	var productions []models.ProductProduction
	var products []models.FinishedGood
	var employees []models.Employee

	db.Preload("Product").Preload("Employee").Order("production_date DESC").Find(&productions)
	db.Find(&products)
	db.Find(&employees)

	c.HTML(http.StatusOK, "produce.html", gin.H{
		"productions": productions,
		"products":    products,
		"employees":   employees,
	})
}

func GetProductionHistory(c *gin.Context, db *gorm.DB) {
	var productions []models.ProductProduction

	err := db.Preload("Product").Preload("Employee").Order("production_date DESC").Find(&productions).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка загрузки истории"})
		return
	}

	c.JSON(http.StatusOK, productions)
}
