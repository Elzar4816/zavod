package handlers

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"zavod/models"
)

const log = "Некорректные данные"
const log2 = "Сотрудник не найден"

// CreateEmployee - создание сотрудника
func CreateEmployee(c *gin.Context, db *gorm.DB) {
	var employee models.Employee
	// Считываем данные из формы
	if err := c.ShouldBindJSON(&employee); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": log})
		return
	}

	// Сохраняем сотрудника в базу
	if err := db.Create(&employee).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось создать сотрудника"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Сотрудник успешно создан", "employee": employee})
}

// ListEmployees - получение списка всех сотрудников и рендеринг в шаблон
func ListEmployees(c *gin.Context, db *gorm.DB) {
	var employees []models.Employee
	if err := db.Preload("Position").Find(&employees).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось получить список сотрудников"})
		return
	}

	// Рендерим шаблон с переданным списком сотрудников
	c.HTML(http.StatusOK, "employee.html", gin.H{
		"employees": employees,
	})
}

// GetEmployee - получение сотрудника по ID
func GetEmployee(c *gin.Context, db *gorm.DB) {
	id := c.Param("id")
	var employee models.Employee
	if err := db.Preload("Position").First(&employee, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": log2})
		return
	}

	c.JSON(http.StatusOK, employee)
}

// UpdateEmployee - обновление данных сотрудника
func UpdateEmployee(c *gin.Context, db *gorm.DB) {
	id := c.Param("id")
	var employee models.Employee
	if err := db.First(&employee, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": log2})
		return
	}

	// Считываем новые данные из формы
	if err := c.ShouldBindJSON(&employee); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": log})
		return
	}

	// Обновляем сотрудника
	if err := db.Save(&employee).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось обновить сотрудника"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Сотрудник обновлен", "employee": employee})
}

// DeleteEmployee - удаление сотрудника
func DeleteEmployee(c *gin.Context, db *gorm.DB) {
	id := c.Param("id")
	if err := db.Delete(&models.Employee{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось удалить сотрудника"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Сотрудник удален"})
}

// CreatePosition - создание новой позиции
func CreatePosition(c *gin.Context, db *gorm.DB) {
	var position models.Position
	// Считываем данные из формы
	if err := c.ShouldBind(&position); err != nil {
		c.HTML(http.StatusBadRequest, "position.html", gin.H{"error": log})
		return
	}

	// Сохраняем позицию в базу
	if err := db.Create(&position).Error; err != nil {
		c.HTML(http.StatusInternalServerError, "position.html", gin.H{"error": "Не удалось создать позицию"})
		return
	}

	// Редирект на страницу списка позиций
	c.Redirect(http.StatusSeeOther, "/position")
}

// ListPositions - получение списка всех позиций и рендеринг в шаблон
func ListPositions(c *gin.Context, db *gorm.DB) {
	var positions []models.Position
	if err := db.Find(&positions).Error; err != nil {
		c.HTML(http.StatusInternalServerError, "position.html", gin.H{"error": "Не удалось получить список позиций"})
		return
	}

	// Рендерим шаблон с переданным списком позиций
	c.HTML(http.StatusOK, "position.html", gin.H{
		"positions": positions,
	})
}

// UpdatePosition - обновление позиции
func UpdatePosition(c *gin.Context, db *gorm.DB) {
	id := c.Param("id")
	var position models.Position
	if err := db.First(&position, id).Error; err != nil {
		c.HTML(http.StatusNotFound, "position.html", gin.H{"error": "Позиция не найдена"})
		return
	}

	// Считываем новые данные из формы
	if err := c.ShouldBind(&position); err != nil {
		c.HTML(http.StatusBadRequest, "position.html", gin.H{"error": log})
		return
	}

	// Обновляем позицию
	if err := db.Save(&position).Error; err != nil {
		c.HTML(http.StatusInternalServerError, "position.html", gin.H{"error": "Не удалось обновить позицию"})
		return
	}

	// Редирект на страницу списка позиций
	c.Redirect(http.StatusSeeOther, "/position")
}

// DeletePosition - удаление позиции
func DeletePosition(c *gin.Context, db *gorm.DB) {
	id := c.Param("id")
	if err := db.Delete(&models.Position{}, id).Error; err != nil {
		c.HTML(http.StatusInternalServerError, "position.html", gin.H{"error": "Не удалось удалить позицию"})
		return
	}

	// Редирект на страницу списка позиций
	c.Redirect(http.StatusSeeOther, "/position")
}

// GetPosition - получение позиции по ID
func GetPosition(c *gin.Context, db *gorm.DB) {
	id := c.Param("id")
	var position models.Position
	if err := db.First(&position, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Позиция не найдена"})
		return
	}

	c.JSON(http.StatusOK, position)
}
