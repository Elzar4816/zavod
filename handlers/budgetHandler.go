package handlers

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"zavod/models"
)

// GetBudget - получение текущего бюджета
func GetBudget(c *gin.Context, db *gorm.DB) {
	var budgets []models.Budget
	if err := db.Find(&budgets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось получить бюджеты"})
		return
	}
	c.JSON(http.StatusOK, budgets)
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
	var existingBudget models.Budget
	id := c.Param("id")

	if err := db.First(&existingBudget, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Бюджет не найден"})
		return
	}

	var input struct {
		TotalAmount      float64 `json:"total_amount"`
		MarkupPercentage float64 `json:"markup_percentage"`
		BonusPercentage  float64 `json:"bonus_percentage"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректные входные данные"})
		return
	}

	// Проверка на отрицательные значения
	if input.TotalAmount < 0 || input.MarkupPercentage < 0 || input.BonusPercentage < 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Числа не могут быть отрицательными"})
		return
	}

	// Проверяем, были ли изменения
	if existingBudget.TotalAmount == input.TotalAmount &&
		existingBudget.MarkupPercentage == input.MarkupPercentage &&
		existingBudget.BonusPercentage == input.BonusPercentage {
		// Если данные не изменились, возвращаем 200 OK без изменений
		c.JSON(http.StatusOK, existingBudget)
		return
	}

	// Если данные изменились, обновляем запись
	existingBudget.TotalAmount = input.TotalAmount
	existingBudget.MarkupPercentage = input.MarkupPercentage
	existingBudget.BonusPercentage = input.BonusPercentage

	if err := db.Save(&existingBudget).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось обновить бюджет"})
		return
	}

	c.JSON(http.StatusOK, existingBudget)
}

// Проверка наличия бюджета в базе данных
func CheckBudgetExists(c *gin.Context, db *gorm.DB) {
	var budget models.Budget
	// Попробуем найти первый бюджет в базе
	if err := db.First(&budget).Error; err != nil {
		// Если записи нет, возвращаем статус 404
		c.JSON(http.StatusNotFound, gin.H{"message": "Бюджет не найден"})
		return
	}
	// Если бюджет найден, отправляем статус 200
	c.JSON(http.StatusOK, gin.H{"message": "Бюджет найден"})
}
