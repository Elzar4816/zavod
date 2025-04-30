package handlers

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"zavod/models"
	"zavod/utils"
)

const fgCode = "ERR_FINISHED_GOOD"

// CreateFinishedGood Создание продукта
func CreateFinishedGood(c *gin.Context, db *gorm.DB) {
	var product models.FinishedGood
	if err := c.ShouldBindJSON(&product); err != nil {
		utils.BadRequest(c, "Некорректные данные продукта")
		return
	}

	if product.Name == "" {
		utils.BadRequest(c, "Название не может быть пустым")
		return
	}

	if !utils.SaveEntity(c, db, &product, fgCode) {
		return
	}

	c.JSON(http.StatusOK, product)
}

// UpdateFinishedGood Обновление
func UpdateFinishedGood(c *gin.Context, db *gorm.DB) {
	var product models.FinishedGood
	if !utils.FindByID(c, db, &product, "id", fgCode) {
		return
	}

	if err := c.ShouldBindJSON(&product); err != nil {
		utils.BadRequest(c, "Некорректные данные")
		return
	}

	if !utils.SaveEntity(c, db, &product, fgCode) {
		return
	}

	c.JSON(http.StatusOK, product)
}

// DeleteFinishedGood Удаление
func DeleteFinishedGood(c *gin.Context, db *gorm.DB) {
	var product models.FinishedGood
	if !utils.FindByID(c, db, &product, "id", fgCode) {
		return
	}

	if !utils.DeleteEntity(c, db, &product, fgCode) {
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Продукт удалён"})
}

// GetFinishedGoods Получение всех продуктов
func GetFinishedGoods(c *gin.Context, db *gorm.DB) {
	var goods []models.FinishedGood
	if err := db.Find(&goods).Error; err != nil {
		utils.InternalError(c, "Не удалось загрузить список продуктов")
		return
	}
	c.JSON(http.StatusOK, goods)
}
