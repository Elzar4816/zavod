package handlers

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"strconv"
	"time"
	"zavod/reports"
	"zavod/utils"
)

func SalesReportHandler(c *gin.Context, db *gorm.DB) {
	fromStr := c.Query("from")
	toStr := c.Query("to")
	format := c.DefaultQuery("format", "xlsx")

	from, _ := time.Parse("2006-01-02", fromStr)
	to, _ := time.Parse("2006-01-02", toStr)

	data, filename, err := reports.GenerateSalesReport(db, from, to, format)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.Header("Content-Disposition", "attachment; filename="+filename)
	c.Data(200, "application/octet-stream", data)
}
func SalaryReportHandler(c *gin.Context, db *gorm.DB) {
	yearStr := c.Query("year")
	monthStr := c.Query("month")
	format := c.DefaultQuery("format", "xlsx")

	year, err1 := strconv.Atoi(yearStr)
	month, err2 := strconv.Atoi(monthStr)
	if err1 != nil || err2 != nil {
		c.JSON(400, gin.H{"error": "Некорректные year или month"})
		return
	}

	data, filename, err := reports.GenerateSalaryReport(db, year, month, format)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.Header("Content-Disposition", "attachment; filename="+filename)
	c.Data(200, "application/octet-stream", data)
}
func CreditPaymentsReportHandler(c *gin.Context, db *gorm.DB) {
	creditIDStr := c.Query("credit_id")
	format := c.DefaultQuery("format", "xlsx")

	creditID, err := strconv.Atoi(creditIDStr)
	if err != nil || creditID <= 0 {
		c.JSON(400, gin.H{"error": "Неверный ID кредита"})
		return
	}

	data, filename, err := reports.GenerateCreditPaymentsReport(db, uint(creditID), format)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.Header("Content-Disposition", "attachment; filename="+filename)
	c.Data(200, "application/octet-stream", data)
}
func GenerateProductionReportHandler(c *gin.Context, db *gorm.DB) {
	fromStr := c.Query("from")
	toStr := c.Query("to")
	format := c.DefaultQuery("format", "xlsx")

	from, err1 := time.Parse("2006-01-02", fromStr)
	to, err2 := time.Parse("2006-01-02", toStr)
	if err1 != nil || err2 != nil {
		utils.BadRequest(c, "Некорректные даты")
		return
	}

	data, filename, err := reports.GenerateProductionReport(db, from, to, format)
	if err != nil {
		utils.InternalError(c, "Ошибка генерации отчета")
		return
	}

	c.Header("Content-Disposition", "attachment; filename="+filename)
	c.Data(http.StatusOK, "application/octet-stream", data)
}
func PurchaseReportHandler(c *gin.Context, db *gorm.DB) {
	fromStr := c.Query("from")
	toStr := c.Query("to")
	format := c.DefaultQuery("format", "xlsx")

	from, err1 := time.Parse("2006-01-02", fromStr)
	to, err2 := time.Parse("2006-01-02", toStr)
	if err1 != nil || err2 != nil {
		utils.BadRequest(c, "Некорректные даты")
		return
	}

	data, filename, err := reports.GeneratePurchaseReport(db, from, to, format)
	if err != nil {
		utils.InternalError(c, "Ошибка генерации отчета по закупкам")
		return
	}

	c.Header("Content-Disposition", "attachment; filename="+filename)
	c.Data(http.StatusOK, "application/octet-stream", data)
}
