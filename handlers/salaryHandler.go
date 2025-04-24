package handlers

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"strconv"
	"zavod/models"
)

// Получение зарплат за конкретный месяц и год
func GetSalaries(c *gin.Context, db *gorm.DB) {
	yearStr := c.Query("year")
	monthStr := c.Query("month")

	year, err1 := strconv.Atoi(yearStr)
	month, err2 := strconv.Atoi(monthStr)

	if err1 != nil || err2 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверные параметры года или месяца"})
		return
	}

	var salaries []models.Salary

	if err := db.Preload("Employee").
		Where("year = ? AND month = ?", year, month).
		Find(&salaries).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении данных"})
		return
	}

	c.JSON(http.StatusOK, salaries)
}

type MonthRequest struct {
	Year  int `json:"year"`
	Month int `json:"month"`
}

// Генерация зарплат (вызов процедуры generate_salaries_for_month)
type GenerateSalariesRequest struct {
	Year  int `json:"year"`
	Month int `json:"month"`
}

func GenerateSalaries(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req GenerateSalariesRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат запроса"})
			return
		}

		// Вызов процедуры, если записей нет
		sql := `CALL generate_salaries_for_month(?, ?)`
		if err := db.Exec(sql, req.Year, req.Month).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Зарплаты рассчитаны"})
	}
}

type IssueSalariesRequest struct {
	Year  int `json:"year"`
	Month int `json:"month"`
}

func IssueSalaries(c *gin.Context, db *gorm.DB) {
	var req IssueSalariesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат запроса"})
		return
	}

	sql := `CALL issue_salaries_for_month(?, ?)`
	if err := db.Exec(sql, req.Year, req.Month).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Зарплата успешно выдана"})
}
func ShowSalaryDistributionPage() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.HTML(http.StatusOK, "salary_distribution.html", gin.H{})
	}
}
func UpdateSalaryTotalHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			EmployeeID  int     `json:"employee_id"`
			Year        int     `json:"year"`
			Month       int     `json:"month"`
			TotalSalary float64 `json:"total_salary"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(400, gin.H{"error": "Неверные данные"})
			return
		}

		if err := db.Exec("CALL update_salary_total(?, ?, ?, ?)",
			req.EmployeeID, req.Year, req.Month, req.TotalSalary).Error; err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		c.JSON(200, gin.H{"message": "Обновлено"})
	}
}
