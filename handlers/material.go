package handlers

import (
	"net/http"
	_ "strconv"
	"zavod/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// CreateRawMaterial 🏗 CRUD для Raw Materials
func CreateRawMaterial(c *gin.Context, db *gorm.DB) {
	var rawMaterial models.RawMaterial

	// Получаем данные из тела запроса
	if err := c.ShouldBindJSON(&rawMaterial); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректные данные"})
		return
	}

	// Сохраняем в БД
	if err := db.Create(&rawMaterial).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при сохранении сырья"})
		return
	}

	// Отправляем ответ с информацией о новом сырье
	c.JSON(http.StatusOK, gin.H{"message": "Сырье добавлено", "id": rawMaterial.ID})
}

func DeleteRawMaterial(c *gin.Context, db *gorm.DB) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID не указан"})
		return
	}

	// Ищем сырье по ID
	var rawMaterial models.RawMaterial
	if err := db.First(&rawMaterial, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Сырье не найдено"})
		return
	}

	// Удаляем сырье из базы
	if err := db.Delete(&rawMaterial).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при удалении сырья"})
		return
	}

	// Отправляем успешный ответ с ID удаленного сырья
	c.JSON(http.StatusOK, gin.H{
		"id":      rawMaterial.ID,
		"message": "Сырье удалено",
	})
}

func UpdateRawMaterial(c *gin.Context, db *gorm.DB) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID не указан"})
		return
	}

	// Ищем сырье по ID
	var rawMaterial models.RawMaterial
	if err := db.First(&rawMaterial, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Сырье не найдено"})
		return
	}

	// Получаем данные из тела запроса
	var input struct {
		Name        string  `json:"name"`
		Quantity    float64 `json:"quantity"`
		TotalAmount float64 `json:"total_amount"`
		UnitID      uint    `json:"unit_id"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректные данные"})
		return
	}

	// Обновляем данные
	rawMaterial.Name = input.Name
	rawMaterial.Quantity = input.Quantity
	rawMaterial.TotalAmount = input.TotalAmount
	rawMaterial.UnitID = input.UnitID

	// Сохраняем изменения
	if err := db.Save(&rawMaterial).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при обновлении сырья"})
		return
	}

	// Отправляем успешный ответ с объектом сырья
	c.JSON(http.StatusOK, gin.H{
		"id":           rawMaterial.ID,
		"name":         rawMaterial.Name,
		"quantity":     rawMaterial.Quantity,
		"total_amount": rawMaterial.TotalAmount,
		"unit_id":      rawMaterial.UnitID,
		"message":      "Сырье обновлено",
	})
}
