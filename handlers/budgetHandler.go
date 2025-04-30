package handlers

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"zavod/models"
	"zavod/utils"
)

const budgetCode = "ERR_BUDGET"

// GetBudget - получение текущего бюджета
func GetBudget(c *gin.Context, db *gorm.DB) {
	var budgets []models.Budget
	if err := db.Find(&budgets).Error; err != nil {
		utils.InternalError(c, "Ошибка при получении бюджета")
		return
	}
	c.JSON(http.StatusOK, budgets)
}

// CreateBudget Создание бюджета
func CreateBudget(c *gin.Context, db *gorm.DB) {
	var input models.Budget

	// Проверяем, существует ли уже бюджет
	var existing models.Budget
	if err := db.First(&existing).Error; err == nil {
		utils.Conflict(c, "Бюджет уже существует")
		return
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		utils.BadRequest(c, "Неверные входные данные")
		return
	}

	if !utils.SaveEntity(c, db, &input, budgetCode) {
		return
	}

	c.JSON(http.StatusOK, input)
}

// UpdateBudget Обновление бюджета
func UpdateBudget(c *gin.Context, db *gorm.DB) {
	var budget models.Budget
	if !utils.FindByID(c, db, &budget, "id", budgetCode) {
		return
	}

	var input struct {
		TotalAmount      float64 `json:"total_amount"`
		MarkupPercentage float64 `json:"markup_percentage"`
		BonusPercentage  float64 `json:"bonus_percentage"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		utils.BadRequest(c, "Неверные входные данные")
		return
	}

	if input.TotalAmount < 0 || input.MarkupPercentage < 0 || input.BonusPercentage < 0 {
		utils.BadRequest(c, "Числа не могут быть отрицательными")
		return
	}

	// Если ничего не изменилось
	if budget.TotalAmount == input.TotalAmount &&
		budget.MarkupPercentage == input.MarkupPercentage &&
		budget.BonusPercentage == input.BonusPercentage {
		c.JSON(http.StatusOK, budget)
		return
	}

	budget.TotalAmount = input.TotalAmount
	budget.MarkupPercentage = input.MarkupPercentage
	budget.BonusPercentage = input.BonusPercentage

	if !utils.SaveEntity(c, db, &budget, budgetCode) {
		return
	}

	c.JSON(http.StatusOK, budget)
}

// CheckBudgetExists Проверка наличия бюджета в базе данных
func CheckBudgetExists(c *gin.Context, db *gorm.DB) {
	var budget models.Budget
	if err := db.First(&budget).Error; err != nil {
		utils.NotFound(c, "Бюджет не найден")
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Бюджет найден"})
}
