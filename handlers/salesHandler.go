package handlers

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"strings"
	"time"
	"zavod/models"
	"zavod/utils"
)

const saleCode = "ERR_SALE"

func SalesHistoryHandler(c *gin.Context, db *gorm.DB) {
	var sales []models.ProductSale

	fromStr := c.Query("from")
	toStr := c.Query("to")

	query := db.Preload("Product").Preload("Employee").Order("sale_date DESC")

	if fromStr != "" && toStr != "" {
		from, err1 := time.Parse("2006-01-02", fromStr)
		to, err2 := time.Parse("2006-01-02", toStr)
		if err1 == nil && err2 == nil {
			query = query.Where("sale_date BETWEEN ? AND ?", from, to)
		}
	}

	if err := query.Find(&sales).Error; err != nil {
		utils.InternalError(c, "Не удалось загрузить историю продаж")
		return
	}

	c.JSON(http.StatusOK, sales)
}

func SalesHandler(c *gin.Context, db *gorm.DB) {
	var req struct {
		ProductID  uint      `json:"product_id" binding:"required"`
		Quantity   float64   `json:"quantity" binding:"required,gt=0"`
		SaleDate   time.Time `json:"sale_date" binding:"required"`
		EmployeeID uint      `json:"employee_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Неверные параметры запроса")
		return
	}

	// вызываем процедуру
	if err := db.Exec("CALL sale_product(?, ?, ?, ?)",
		req.ProductID, req.Quantity, req.SaleDate, req.EmployeeID).Error; err != nil {

		utils.RespondError(c, 400, saleCode+"_PROCEDURE_FAILED", sanitizeDBError(err))
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "Продукт успешно продан"})
}

// Очищает SQL-ошибку, чтобы не светить клиенту SQLSTATE
func sanitizeDBError(err error) string {
	msg := err.Error()
	if idx := strings.Index(msg, "ОШИБКА:"); idx != -1 {
		msg = msg[idx+len("ОШИБКА:"):]
		if end := strings.Index(msg, "("); end != -1 {
			return strings.TrimSpace(msg[:end])
		}
		return strings.TrimSpace(msg)
	}
	return "Неизвестная ошибка при продаже"
}
