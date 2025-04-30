// handlers/authHandler.go

package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"net/http"
	"time"
	"zavod/models"
)

const sessionDuration = 24 * time.Hour // Сессия живет 24 часа

func LoginHandler(c *gin.Context, db *gorm.DB) {
	var credentials struct {
		Login    string `json:"login"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&credentials); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат запроса"})
		return
	}

	var employee models.Employee
	if err := db.Where("login = ?", credentials.Login).First(&employee).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверный логин или пароль"})
		return
	}

	// ⚡ Здесь пока без хэширования паролей (потом улучшим)
	if employee.Password != credentials.Password {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверный логин или пароль"})
		return
	}

	// Создаём новую сессию
	sessionID := uuid.New().String()
	expiresAt := time.Now().Add(sessionDuration)

	session := models.Session{
		ID:         sessionID,
		EmployeeID: employee.ID,
		CreatedAt:  time.Now(),
		ExpiresAt:  expiresAt,
	}

	if err := db.Create(&session).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка создания сессии"})
		return
	}

	// Отправляем куку клиенту
	c.SetCookie(
		"session_id",
		sessionID,
		int(sessionDuration.Seconds()),
		"/",
		"",
		false, // если будет HTTPS, поменяем на true
		true,  // HttpOnly
	)

	c.JSON(http.StatusOK, gin.H{"message": "Успешный вход"})
}
func LogoutHandler(c *gin.Context, db *gorm.DB) {
	sessionID, err := c.Cookie("session_id")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Сессия не найдена"})
		return
	}

	if err := db.Delete(&models.Session{}, "id = ?", sessionID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при удалении сессии"})
		return
	}

	// Удаляем куку
	c.SetCookie(
		"session_id",
		"",
		-1,
		"/",
		"",
		false,
		true,
	)

	c.JSON(http.StatusOK, gin.H{"message": "Успешный выход"})
}
func AuthMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		sessionID, err := c.Cookie("session_id")
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Необходима авторизация"})
			c.Abort()
			return
		}

		var session models.Session
		if err := db.First(&session, "id = ?", sessionID).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Сессия недействительна"})
			c.Abort()
			return
		}

		if session.ExpiresAt.Before(time.Now()) {
			db.Delete(&session)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Сессия истекла"})
			c.Abort()
			return
		}

		// При необходимости можно сразу подгрузить employee
		var employee models.Employee
		if err := db.First(&employee, session.EmployeeID).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Сотрудник не найден"})
			c.Abort()
			return
		}

		// Кладем данные в контекст запроса
		c.Set("employee_id", employee.ID)
		c.Set("position", employee.PositionID) // Можно потом загрузить роль
		c.Set("employee", employee)

		c.Next()
	}
}
func CheckSessionHandler(c *gin.Context, db *gorm.DB) {
	sessionID, err := c.Cookie("session_id")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Нет сессии"})
		return
	}

	var session models.Session
	if err := db.First(&session, "id = ?", sessionID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Сессия не найдена"})
		return
	}

	if session.ExpiresAt.Before(time.Now()) {
		db.Delete(&session)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Сессия истекла"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"ok": true})
}
