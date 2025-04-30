package handlers

import (
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

	if err := c.ShouldBindJSON(&purchase); err != nil {
		utils.BadRequest(c, "Некорректные входные данные")
		return
	}

	// 1. Проверяем бюджет
	var budget models.Budget
	if err := db.First(&budget).Error; err != nil {
		utils.NotFound(c, "Бюджет не найден")
		return
	}
	if budget.TotalAmount < purchase.TotalAmount {
		utils.Conflict(c, "Недостаточно средств в бюджете")
		return
	}
	budget.TotalAmount -= purchase.TotalAmount
	if !utils.SaveEntity(c, db, &budget, "ERR_BUDGET") {
		return
	}

	// 2. Закупка
	purchase.PurchaseDate = time.Now()
	if !utils.SaveEntity(c, db, &purchase, purchaseCode) {
		return
	}

	// 3. Обновление сырья
	var rawMaterial models.RawMaterial
	if !utils.FindByID(c, db, &rawMaterial, "raw_material_id", "ERR_RAW") {
		return
	}

	rawMaterial.Quantity += purchase.Quantity
	rawMaterial.TotalAmount += purchase.TotalAmount
	if !utils.SaveEntity(c, db, &rawMaterial, "ERR_RAW") {
		return
	}

	c.JSON(http.StatusOK, gin.H{"id": purchase.ID, "message": "Закупка успешно создана"})
}

// DeleteRawMaterialPurchase Удаление закупки сырья
func DeleteRawMaterialPurchase(c *gin.Context, db *gorm.DB) {
	var purchase models.RawMaterialPurchase
	if !utils.FindByID(c, db, &purchase, "id", purchaseCode) {
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
	if !utils.FindByID(c, db, &rawMaterial, "raw_material_id", "ERR_RAW") {
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
