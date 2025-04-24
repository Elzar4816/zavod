package handlers

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"log"
	"net/http"
	"zavod/models"
)

// ListUnits 📌 Функции для отображения данных отдельных таблиц
func ListUnits(c *gin.Context, db *gorm.DB) {
	var units []models.Unit
	if err := db.Find(&units).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении данных"})
		return
	}

	c.JSON(http.StatusOK, units) // Возвращаем данные в формате JSON
}

// 🏗 CRUD для Units
func CreateUnit(c *gin.Context, db *gorm.DB) {
	var unit models.Unit
	// Чтение данных из JSON (не из формы)
	if err := c.ShouldBindJSON(&unit); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректные данные"})
		return
	}

	if unit.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Название не может быть пустым"})
		return
	}

	if err := db.Create(&unit).Error; err != nil {
		log.Println("Ошибка при сохранении в БД:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при сохранении"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": unit.ID, "name": unit.Name})
}

func DeleteUnit(c *gin.Context, db *gorm.DB) {
	id := c.Param("id")
	var unit models.Unit
	if err := db.First(&unit, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Единица измерения не найдена"})
		return
	}

	if err := db.Delete(&unit).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при удалении"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Запись успешно удалена"})
}

func UpdateUnit(c *gin.Context, db *gorm.DB) {
	id := c.Param("id")
	var unit models.Unit
	if err := db.First(&unit, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Единица измерения не найдена"})
		return
	}

	// Чтение новых данных из JSON
	var updatedData struct {
		Name string `json:"name"`
	}
	if err := c.ShouldBindJSON(&updatedData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректные данные"})
		return
	}

	if updatedData.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Имя не может быть пустым"})
		return
	}

	unit.Name = updatedData.Name // Обновляем имя

	// Сохраняем изменения
	if err := db.Save(&unit).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при обновлении"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"id": unit.ID, "name": unit.Name})
}
