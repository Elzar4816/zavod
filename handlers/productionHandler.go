package handlers

import (
	"errors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"time"
	"zavod/models"
	"zavod/utils"
)

var (
	ErrNoIngredients       = errors.New("no ingredients found for product")
	ErrNotEnoughRaw        = errors.New("not enough raw material")
	ErrZeroRawQuantity     = errors.New("zero quantity for raw material")
	ErrProductNotFound     = errors.New("product not found")
	ErrSaveProduction      = errors.New("failed to record production")
	ErrUpdateFinishedGoods = errors.New("failed to update finished goods")
)

func ProduceNewFinishedGood(c *gin.Context, db *gorm.DB) {
	type ProduceRequest struct {
		ProductID  uint    `json:"product_id" binding:"required"`
		Quantity   float64 `json:"quantity" binding:"required,gt=0"`
		EmployeeID uint    `json:"employee_id" binding:"required"`
	}

	var req ProduceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Неверные входные данные")
		return
	}

	err := db.Transaction(func(tx *gorm.DB) error {
		ingredients, err := getIngredientsForProduct(tx, req.ProductID)
		if err != nil {
			return err
		}

		if err := checkIngredientsAvailability(ingredients, req.Quantity); err != nil {
			return err
		}

		totalCost, err := updateRawMaterials(tx, ingredients, req.Quantity)
		if err != nil {
			return err
		}

		if err := updateFinishedGood(tx, req.ProductID, req.Quantity, totalCost); err != nil {
			return ErrUpdateFinishedGoods
		}

		if err := recordProduction(tx, req.ProductID, req.Quantity, req.EmployeeID); err != nil {
			return ErrSaveProduction
		}

		return nil
	})

	if err != nil {
		switch {
		case errors.Is(err, ErrNoIngredients):
			utils.RespondError(c, 400, "ERR_NO_INGREDIENTS", "У продукта нет ингредиентов")
		case errors.Is(err, ErrNotEnoughRaw):
			utils.RespondError(c, 400, "ERR_RAW_SHORTAGE", "Недостаточно сырья для производства")
		case errors.Is(err, ErrZeroRawQuantity):
			utils.RespondError(c, 400, "ERR_RAW_ZERO", "Сырьё с нулевым количеством не может быть использовано")
		case errors.Is(err, ErrProductNotFound):
			utils.RespondError(c, 404, "ERR_PRODUCT_NOT_FOUND", "Продукт не найден")
		case errors.Is(err, ErrSaveProduction):
			utils.InternalError(c, "Ошибка при записи производства")
		case errors.Is(err, ErrUpdateFinishedGoods):
			utils.InternalError(c, "Ошибка при обновлении готовой продукции")
		default:
			utils.InternalError(c, "Неизвестная ошибка при производстве")
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "Производство успешно завершено"})
}

// Получение ингредиентов
func getIngredientsForProduct(tx *gorm.DB, productID uint) ([]models.Ingredient, error) {
	var ingredients []models.Ingredient
	if err := tx.Preload("RawMaterial").
		Where("product_id = ?", productID).
		Find(&ingredients).Error; err != nil {
		return nil, ErrProductNotFound
	}
	if len(ingredients) == 0 {
		return nil, ErrNoIngredients
	}
	return ingredients, nil
}

// Проверка доступности сырья
func checkIngredientsAvailability(ingredients []models.Ingredient, quantity float64) error {
	for _, ing := range ingredients {
		required := ing.Quantity * quantity
		if ing.RawMaterial.Quantity < required {
			return ErrNotEnoughRaw
		}
	}
	return nil
}

// Обновление количества и стоимости сырья
func updateRawMaterials(tx *gorm.DB, ingredients []models.Ingredient, quantity float64) (float64, error) {
	var totalCost float64

	for _, ing := range ingredients {
		required := ing.Quantity * quantity
		raw := ing.RawMaterial

		if raw.Quantity == 0 {
			return 0, ErrZeroRawQuantity
		}

		unitCost := raw.TotalAmount / raw.Quantity
		costToDeduct := unitCost * required

		totalCost += costToDeduct

		if err := tx.Model(&models.RawMaterial{}).
			Where("id = ?", raw.ID).
			Updates(map[string]interface{}{
				"quantity":     gorm.Expr("quantity - ?", required),
				"total_amount": gorm.Expr("total_amount - ?", costToDeduct),
			}).Error; err != nil {
			return 0, err
		}
	}

	return totalCost, nil
}

// Обновление готовой продукции
func updateFinishedGood(tx *gorm.DB, productID uint, quantity, totalCost float64) error {
	var product models.FinishedGood
	if err := tx.First(&product, productID).Error; err != nil {
		return ErrProductNotFound
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

// Запись факта производства
func recordProduction(tx *gorm.DB, productID uint, quantity float64, employeeID uint) error {
	entry := models.ProductProduction{
		ProductID:      productID,
		Quantity:       quantity,
		ProductionDate: time.Now(),
		EmployeeID:     employeeID,
	}
	if err := tx.Create(&entry).Error; err != nil {
		return err
	}
	return nil
}

func GetProductionHistory(c *gin.Context, db *gorm.DB) {
	var productions []models.ProductProduction
	if err := db.Preload("Product").Preload("Employee").
		Order("production_date DESC").Find(&productions).Error; err != nil {
		utils.InternalError(c, "Ошибка загрузки истории")
		return
	}
	c.JSON(http.StatusOK, productions)
}
