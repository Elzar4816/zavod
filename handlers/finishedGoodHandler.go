package handlers

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"zavod/models"
)

// 🏗 CRUD для Finished Goods
func CreateFinishedGood(c *gin.Context, db *gorm.DB) {
	var finishedGood models.FinishedGood

	// Получаем данные в формате JSON
	if err := c.BindJSON(&finishedGood); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input data"})
		return
	}

	// Сохраняем в базу
	db.Create(&finishedGood)

	// Возвращаем успешный ответ с id
	c.JSON(http.StatusOK, finishedGood)
}

func DeleteFinishedGood(c *gin.Context, db *gorm.DB) {
	id := c.Param("id")

	// Ищем и удаляем
	if err := db.Delete(&models.FinishedGood{}, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Finished good not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Готовая продукция удалена"})
}

func UpdateFinishedGood(c *gin.Context, db *gorm.DB) {
	var finishedGood models.FinishedGood
	id := c.Param("id")

	// Ищем запись
	if err := db.First(&finishedGood, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Finished good not found"})
		return
	}

	// Получаем данные в формате JSON
	if err := c.BindJSON(&finishedGood); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input data"})
		return
	}

	// Сохраняем изменения
	db.Save(&finishedGood)

	c.JSON(http.StatusOK, finishedGood)
}
