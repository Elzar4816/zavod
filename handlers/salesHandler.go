package handlers

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"strings"
	"time"
	"zavod/models"
)

func SalesHistoryHandler(c *gin.Context, db *gorm.DB) {
	var sales []models.ProductSale

	// подгружаем ассоциации FinishedGood и Employee
	if err := db.
		Preload("Product").
		Preload("Employee").
		Order("sale_date DESC").
		Find(&sales).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось загрузить историю продаж"})
		return
	}

	c.JSON(http.StatusOK, sales)
}

// helper: вызывает хранимку и возвращает ошибку
func callSaleProductProcedure(db *gorm.DB, productID uint, quantity float64, saleDate time.Time, employeeID uint) error {
	if err := db.Exec("CALL sale_product(?, ?, ?, ?)", productID, quantity, saleDate, employeeID).Error; err != nil {
		return fmt.Errorf("при вызове процедуры: %w", err)
	}
	return nil
}

// helper: выдирает из err.Error() только «ОШИБКА: ...» без SQLSTATE
func sanitizeDBError(err error) string {
	s := err.Error()
	// ищем начало «ОШИБКА:»
	idx := strings.Index(s, "ОШИБКА:")
	if idx != -1 {
		// обрезаем до первой скобки или до конца строки
		tail := s[idx+len("ОШИБКА:"):]
		if end := strings.Index(tail, "("); end != -1 {
			return strings.TrimSpace(tail[:end])
		}
		return strings.TrimSpace(tail)
	}
	return "Неизвестная ошибка при продаже"
}

// уходим от рендера страницы в этом хендлере, он только API
func SalesHandler(c *gin.Context, db *gorm.DB) {
	var req struct {
		ProductID  uint      `json:"product_id" binding:"required"`
		Quantity   float64   `json:"quantity" binding:"required"`
		SaleDate   time.Time `json:"sale_date" binding:"required"`
		EmployeeID uint      `json:"employee_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверные параметры запроса"})
		return
	}

	// серверная валидация: количество > 0
	if req.Quantity <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Количество должно быть больше нуля"})
		return
	}

	// вызываем процедуру
	if err := callSaleProductProcedure(db, req.ProductID, req.Quantity, req.SaleDate, req.EmployeeID); err != nil {
		// очищаем текст ошибки, чтобы не показывать SQLSTATE и служебную часть
		msg := sanitizeDBError(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": msg})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "Продукт успешно продан"})
}
