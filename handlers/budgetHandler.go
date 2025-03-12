package handlers

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"zavod/models"
)

// GetBudget - получение текущего бюджета
func GetBudget(c *gin.Context, db *gorm.DB) {
	var budget models.Budget
	if err := db.First(&budget).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Бюджет не найден"})
		return
	}
	c.JSON(http.StatusOK, budget)
}

// Хендлер для списка бюджетов
func ListBudget(c *gin.Context, db *gorm.DB) {
	var budgets []models.Budget
	db.Find(&budgets)

	c.HTML(http.StatusOK, "budget.html", gin.H{
		"budgets": budgets, // Здесь меняем "budget" на "budgets"
	})
}

// CreateBudget - создание или обновление бюджета
func CreateBudget(c *gin.Context, db *gorm.DB) {
	var budget models.Budget

	// Проверяем, есть ли уже бюджет
	var existingBudget models.Budget
	if err := db.First(&existingBudget).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Бюджет уже существует"})
		return
	}

	// Получаем данные из запроса JSON
	if err := c.BindJSON(&budget); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректные входные данные"})
		return
	}

	// Создаем новый бюджет
	if err := db.Create(&budget).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось создать бюджет"})
		return
	}

	c.JSON(http.StatusOK, budget) // Возвращаем созданный бюджет
}

// UpdateBudget - обновление бюджета
func UpdateBudget(c *gin.Context, db *gorm.DB) {
	var budget models.Budget
	id := c.Param("id")
	if err := db.First(&budget, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Бюджет не найден"})
		return
	}

	// Получаем данные из запроса JSON
	if err := c.BindJSON(&budget); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректные входные данные"})
		return
	}

	// Обновляем данные
	if err := db.Save(&budget).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось обновить бюджет"})
		return
	}

	c.JSON(http.StatusOK, budget) // Возвращаем обновленный бюджет
}

// DeleteBudget - удаление бюджета
func DeleteBudget(c *gin.Context, db *gorm.DB) {
	id := c.Param("id")
	if err := db.Delete(&models.Budget{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось удалить бюджет"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Бюджет удален"}) // Возвращаем сообщение об успешном удалении
}
