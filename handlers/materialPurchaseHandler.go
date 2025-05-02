package handlers

import (
	"errors"
	"net/http"
	"time"
	"zavod/models"
	"zavod/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

const purchaseCode = "ERR_PURCHASE"

func GetPurchases(c *gin.Context, db *gorm.DB) {
	var purchases []models.RawMaterialPurchase
	if err := db.Preload("RawMaterial").
		Preload("Employee").
		Find(&purchases).Error; err != nil {
		utils.InternalError(c, "Не удалось загрузить закупки")
		return
	}
	c.JSON(http.StatusOK, purchases)
}

// CreateRawMaterialPurchase Создание закупки
func CreateRawMaterialPurchase(c *gin.Context, db *gorm.DB) {
	var purchase models.RawMaterialPurchase

	// 🧩 Валидация JSON вне транзакции
	if err := c.ShouldBindJSON(&purchase); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректные входные данные"})
		return
	}

	// 🔒 Транзакция
	err := db.Transaction(func(tx *gorm.DB) error {
		// 1. Проверка бюджета
		var budget models.Budget
		if err := tx.First(&budget).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Бюджет не найден"})
			return err
		}
		if budget.TotalAmount < purchase.TotalAmount {
			c.JSON(http.StatusConflict, gin.H{"error": "Недостаточно средств в бюджете"})
			return errors.New("бюджет превышен")
		}
		budget.TotalAmount -= purchase.TotalAmount
		if err := tx.Save(&budget).Error; err != nil {
			return err
		}

		// 2. Сохраняем закупку
		purchase.PurchaseDate = time.Now()
		if err := tx.Create(&purchase).Error; err != nil {
			return err
		}

		// 3. Обновляем сырье
		var rawMaterial models.RawMaterial
		if err := tx.First(&rawMaterial, purchase.RawMaterialID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Сырьё не найдено"})
			return err
		}
		rawMaterial.Quantity += purchase.Quantity
		rawMaterial.TotalAmount += purchase.TotalAmount
		if err := tx.Save(&rawMaterial).Error; err != nil {
			return err
		}

		return nil
	})

	// ❌ Если была ошибка — она уже обработана выше
	if err != nil {
		return
	}

	// ✅ Всё успешно
	c.JSON(http.StatusOK, gin.H{"message": "Закупка успешно создана", "id": purchase.ID})
}

// DeleteRawMaterialPurchase Удаление закупки сырья
func DeleteRawMaterialPurchase(c *gin.Context, db *gorm.DB) {
	var purchase models.RawMaterialPurchase

	// ✅ Получаем id из URL
	id := c.Param("id")
	if err := db.First(&purchase, id).Error; err != nil {
		utils.NotFound(c, "Закупка не найдена")
		return
	}

	// 1. Вернуть сумму в бюджет
	var budget models.Budget
	if err := db.First(&budget).Error; err == nil {
		budget.TotalAmount += purchase.TotalAmount
		if !utils.SaveEntity(c, db, &budget, "ERR_BUDGET") {
			return
		}
	}

	// 2. Обновить сырьё
	var rawMaterial models.RawMaterial
	if err := db.First(&rawMaterial, purchase.RawMaterialID).Error; err != nil {
		utils.NotFound(c, "Сырьё не найдено")
		return
	}
	rawMaterial.Quantity -= purchase.Quantity
	rawMaterial.TotalAmount -= purchase.TotalAmount
	if !utils.SaveEntity(c, db, &rawMaterial, "ERR_RAW") {
		return
	}

	// 3. Удаление закупки
	if !utils.DeleteEntity(c, db, &purchase, purchaseCode) {
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Закупка удалена"})
}
