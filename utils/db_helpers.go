package utils

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"strconv"
)

// Получение записи по ID с кастомным кодом
func FindByID(c *gin.Context, db *gorm.DB, out any, idParam string, code string) bool {
	id := c.Param(idParam)
	if id == "" {
		RespondError(c, 400, code+"_ID_MISSING", "ID не указан")
		return false
	}
	if err := db.First(out, id).Error; err != nil {
		RespondError(c, 404, code+"_NOT_FOUND", "Запись не найдена")
		return false
	}
	return true
}

// Сохранение записи с кодом
func SaveEntity(c *gin.Context, db *gorm.DB, entity any, code string) bool {
	if err := db.Save(entity).Error; err != nil {
		RespondError(c, 500, code+"_SAVE_FAILED", "Ошибка при сохранении")
		return false
	}
	return true
}

// Удаление записи с кодом
func DeleteEntity(c *gin.Context, db *gorm.DB, entity any, code string) bool {
	if err := db.Delete(entity).Error; err != nil {
		RespondError(c, 500, code+"_DELETE_FAILED", "Ошибка при удалении")
		return false
	}
	return true
}

// Получение int-параметра с кодом
func GetIntParam(c *gin.Context, param string, code string) (int, bool) {
	str := c.Param(param)
	id, err := strconv.Atoi(str)
	if err != nil {
		RespondError(c, 400, code+"_BAD_ID", "Некорректный ID")
		return 0, false
	}
	return id, true
}
