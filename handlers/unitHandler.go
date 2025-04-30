package handlers

import (
	"zavod/models"
	"zavod/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
)

const unitCode = "ERR_UNIT"

// ListUnits — список единиц измерения
func ListUnits(c *gin.Context, db *gorm.DB) {
	var units []models.Unit
	if err := db.Find(&units).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, unitCode+"_LIST_FAILED", "Ошибка при получении единиц измерения")
		return
	}
	c.JSON(http.StatusOK, units)
}

// CreateUnit — создание новой единицы
func CreateUnit(c *gin.Context, db *gorm.DB) {
	var unit models.Unit
	if err := c.ShouldBindJSON(&unit); err != nil {
		utils.RespondError(c, http.StatusBadRequest, unitCode+"_INVALID_DATA", "Некорректные данные")
		return
	}

	if unit.Name == "" {
		utils.RespondError(c, http.StatusBadRequest, unitCode+"_EMPTY_NAME", "Название не может быть пустым")
		return
	}

	if !utils.SaveEntity(c, db, &unit, unitCode) {
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": unit.ID, "name": unit.Name})
}

// UpdateUnit — обновление единицы
func UpdateUnit(c *gin.Context, db *gorm.DB) {
	var unit models.Unit
	if !utils.FindByID(c, db, &unit, "id", unitCode) {
		return
	}

	var updatedData struct {
		Name string `json:"name"`
	}
	if err := c.ShouldBindJSON(&updatedData); err != nil {
		utils.RespondError(c, http.StatusBadRequest, unitCode+"_INVALID_UPDATE", "Некорректные данные")
		return
	}

	if updatedData.Name == "" {
		utils.RespondError(c, http.StatusBadRequest, unitCode+"_EMPTY_NAME", "Имя не может быть пустым")
		return
	}

	unit.Name = updatedData.Name

	if !utils.SaveEntity(c, db, &unit, unitCode) {
		return
	}

	c.JSON(http.StatusOK, gin.H{"id": unit.ID, "name": unit.Name})
}

// DeleteUnit — удаление единицы
func DeleteUnit(c *gin.Context, db *gorm.DB) {
	var unit models.Unit
	if !utils.FindByID(c, db, &unit, "id", unitCode) {
		return
	}

	if !utils.DeleteEntity(c, db, &unit, unitCode) {
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Единица измерения успешно удалена"})
}
