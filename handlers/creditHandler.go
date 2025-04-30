package handlers

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"time"
	"zavod/models"
	"zavod/utils"
)

const (
	creditCode  = "ERR_CREDIT"
	paymentCode = "ERR_PAYMENT"
)

// CreateCreditHandler — создание нового кредита
func CreateCreditHandler(c *gin.Context, db *gorm.DB) {
	var req struct {
		Amount             float64   `json:"amount" binding:"required"`
		ReceivedDate       time.Time `json:"received_date" binding:"required"`
		TermYears          int       `json:"term_years" binding:"required"`
		AnnualInterestRate float64   `json:"annual_interest_rate" binding:"required"`
		PenaltyPercent     float64   `json:"penalty_percent" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Некорректные данные для создания кредита")
		return
	}

	if err := db.Exec(
		"CALL add_credit(?, ?, ?, ?, ?)",
		req.Amount,
		req.ReceivedDate,
		req.TermYears,
		req.AnnualInterestRate,
		req.PenaltyPercent,
	).Error; err != nil {
		utils.RespondError(c, 500, creditCode+"_ADD_FAILED", "Ошибка при создании кредита")
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Кредит успешно создан"})
}

// MakeCreditPaymentHandler — выплата по кредиту
func MakeCreditPaymentHandler(c *gin.Context, db *gorm.DB) {
	var req struct {
		CreditID    uint      `json:"credit_id" binding:"required"`
		PaymentDate time.Time `json:"payment_date" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Некорректные данные для выплаты по кредиту")
		return
	}

	if err := db.Exec(
		"CALL make_credit_payment(?, ?)",
		req.CreditID,
		req.PaymentDate,
	).Error; err != nil {
		utils.RespondError(c, 500, paymentCode+"_FAILED", "Ошибка при выплате по кредиту")
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Выплата успешно произведена"})
}

// GetAllCreditsHandler — список всех кредитов
func GetAllCreditsHandler(c *gin.Context, db *gorm.DB) {
	var credits []models.Credit
	if err := db.Order("received_date DESC").Find(&credits).Error; err != nil {
		utils.InternalError(c, "Не удалось загрузить список кредитов")
		return
	}
	c.JSON(http.StatusOK, credits)
}

// GetCreditByID — один кредит
func GetCreditByID(c *gin.Context, db *gorm.DB) {
	var credit models.Credit
	if !utils.FindByID(c, db, &credit, "id", creditCode) {
		return
	}
	c.JSON(http.StatusOK, credit)
}

// GetCreditPaymentsHandler — выплаты по кредиту
func GetCreditPaymentsHandler(c *gin.Context, db *gorm.DB) {
	creditID := c.Param("id")
	var payments []models.CreditPayment

	if err := db.Where("credit_id = ?", creditID).
		Order("payment_date ASC").
		Find(&payments).Error; err != nil {
		utils.InternalError(c, "Ошибка при загрузке выплат по кредиту")
		return
	}

	c.JSON(http.StatusOK, payments)
}
