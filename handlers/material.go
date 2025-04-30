package handlers

import (
	"zavod/models"
	"zavod/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
)

const rawCode = "ERR_RAW"

// CreateRawMaterial — создание сырья
func CreateRawMaterial(c *gin.Context, db *gorm.DB) {
	var rawMaterial models.RawMaterial

	if err := c.ShouldBindJSON(&rawMaterial); err != nil {
		utils.RespondError(c, http.StatusBadRequest, rawCode+"_INVALID_DATA", "Некорректные данные")
		return
	}

	if rawMaterial.Name == "" {
		utils.RespondError(c, http.StatusBadRequest, rawCode+"_EMPTY_NAME", "Название не может быть пустым")
		return
	}

	if !utils.SaveEntity(c, db, &rawMaterial, rawCode) {
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": rawMaterial.ID, "message": "Сырье добавлено"})
}

// UpdateRawMaterial — обновление сырья
func UpdateRawMaterial(c *gin.Context, db *gorm.DB) {
	var rawMaterial models.RawMaterial
	if !utils.FindByID(c, db, &rawMaterial, "id", rawCode) {
		return
	}

	var input struct {
		Name        string  `json:"name"`
		Quantity    float64 `json:"quantity"`
		TotalAmount float64 `json:"total_amount"`
		UnitID      uint    `json:"unit_id"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.RespondError(c, http.StatusBadRequest, rawCode+"_INVALID_UPDATE", "Некорректные данные")
		return
	}

	rawMaterial.Name = input.Name
	rawMaterial.Quantity = input.Quantity
	rawMaterial.TotalAmount = input.TotalAmount
	rawMaterial.UnitID = input.UnitID

	if !utils.SaveEntity(c, db, &rawMaterial, rawCode) {
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":           rawMaterial.ID,
		"name":         rawMaterial.Name,
		"quantity":     rawMaterial.Quantity,
		"total_amount": rawMaterial.TotalAmount,
		"unit_id":      rawMaterial.UnitID,
		"message":      "Сырье обновлено",
	})
}

// DeleteRawMaterial — удаление сырья
func DeleteRawMaterial(c *gin.Context, db *gorm.DB) {
	var rawMaterial models.RawMaterial
	if !utils.FindByID(c, db, &rawMaterial, "id", rawCode) {
		return
	}

	if !utils.DeleteEntity(c, db, &rawMaterial, rawCode) {
		return
	}

	c.JSON(http.StatusOK, gin.H{"id": rawMaterial.ID, "message": "Сырье удалено"})
}
