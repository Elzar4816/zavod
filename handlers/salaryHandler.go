package handlers

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"strconv"
	"zavod/models"
	"zavod/utils"
)

// GetSalaries Получение зарплат за конкретный месяц и год
func GetSalaries(c *gin.Context, db *gorm.DB) {
	yearStr := c.Query("year")
	monthStr := c.Query("month")

	year, err1 := strconv.Atoi(yearStr)
	month, err2 := strconv.Atoi(monthStr)

	if err1 != nil || err2 != nil {
		utils.BadRequest(c, "Неверные параметры года или месяца")
		return
	}

	var salaries []models.Salary
	if err := db.Preload("Employee").
		Where("year = ? AND month = ?", year, month).
		Find(&salaries).Error; err != nil {
		utils.InternalError(c, "Ошибка при получении зарплат")
		return
	}

	c.JSON(http.StatusOK, salaries)
}

type MonthRequest struct {
	Year  int `json:"year" binding:"required"`
	Month int `json:"month" binding:"required"`
}

// GenerateSalaries Генерация зарплат
func GenerateSalaries(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req MonthRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			utils.BadRequest(c, "Неверный формат запроса")
			return
		}

		var dummy int
		result := db.
			Model(&models.Salary{}).
			Select("1").
			Where("year = ? AND month = ?", req.Year, req.Month).
			Limit(1).
			Find(&dummy)

		if result.Error != nil {
			utils.InternalError(c, "Ошибка при проверке наличия зарплат")
			return
		}
		exists := result.RowsAffected > 0

		// Генерация
		sql := `CALL generate_salaries_for_month(?, ?)`
		if err := db.Exec(sql, req.Year, req.Month).Error; err != nil {
			utils.InternalError(c, "Ошибка при генерации зарплат")
			return
		}

		if exists {
			c.JSON(http.StatusOK, gin.H{"message": "Зарплаты были пересчитаны"})
		} else {
			c.JSON(http.StatusOK, gin.H{"message": "Зарплаты рассчитаны впервые"})
		}
	}
}

// IssueSalaries Выдача зарплат
func IssueSalaries(c *gin.Context, db *gorm.DB) {
	var req MonthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Неверный формат запроса")
		return
	}

	sql := `CALL issue_salaries_for_month(?, ?)`
	if err := db.Exec(sql, req.Year, req.Month).Error; err != nil {
		utils.InternalError(c, "Ошибка при выдаче зарплат")
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Зарплата успешно выдана"})
}

// UpdateSalaryTotalHandler Обновление суммы зарплаты вручную
func UpdateSalaryTotalHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			EmployeeID  int     `json:"employee_id" binding:"required"`
			Year        int     `json:"year" binding:"required"`
			Month       int     `json:"month" binding:"required"`
			TotalSalary float64 `json:"total_salary" binding:"required"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			utils.BadRequest(c, "Неверные данные")
			return
		}

		if err := db.Exec("CALL update_salary_total(?, ?, ?, ?)",
			req.EmployeeID, req.Year, req.Month, req.TotalSalary).Error; err != nil {
			utils.InternalError(c, "Ошибка при обновлении зарплаты")
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Обновлено"})
	}
}
