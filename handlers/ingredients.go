package handlers

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"zavod/models"
	"zavod/utils"
)

const ingCode = "ERR_INGREDIENT"

// CreateIngredient  CRUD для Ingredients
func CreateIngredient(c *gin.Context, db *gorm.DB) {
	var input models.Ingredient

	if err := c.ShouldBindJSON(&input); err != nil {
		utils.BadRequest(c, "Введены неправильные данные")
		return
	}

	var existing models.Ingredient
	if err := db.Where("product_id = ? AND raw_material_id = ?", input.ProductID, input.RawMaterialID).
		First(&existing).Error; err == nil {
		utils.Conflict(c, "Данное сырье уже добавлено к указанному продукту")
		return
	}

	ingredient := models.Ingredient{
		ProductID:     input.ProductID,
		RawMaterialID: input.RawMaterialID,
		Quantity:      input.Quantity,
	}

	if !utils.SaveEntity(c, db, &ingredient, ingCode) {
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Ингредиент успешно добавлен"})
}

func DeleteIngredient(c *gin.Context, db *gorm.DB) {
	var ingredient models.Ingredient
	if !utils.FindByID(c, db, &ingredient, "id", ingCode) {
		return
	}

	if !utils.DeleteEntity(c, db, &ingredient, ingCode) {
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Ингредиент успешно удален"})
}

func UpdateIngredient(c *gin.Context, db *gorm.DB) {
	var ingredient models.Ingredient
	if !utils.FindByID(c, db, &ingredient, "id", ingCode) {
		return
	}

	var data struct {
		Quantity float64 `json:"quantity"`
	}
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.BadRequest(c, "Некорректные входные данные")
		return
	}

	ingredient.Quantity = data.Quantity

	if !utils.SaveEntity(c, db, &ingredient, ingCode) {
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Ингредиент обновлен"})
}

func GetRawMaterials(c *gin.Context, db *gorm.DB) {
	var rawMaterials []models.RawMaterial
	if err := db.Preload("Unit").Find(&rawMaterials).Error; err != nil {
		utils.InternalError(c, "Не удалось загрузить сырье")
		return
	}
	c.JSON(http.StatusOK, rawMaterials)
}

func GetIngredients(c *gin.Context, db *gorm.DB) {
	var ingredients []models.Ingredient
	var finishedGoods []models.FinishedGood
	var rawMaterials []models.RawMaterial

	if err := db.Preload("Product").Preload("RawMaterial").Find(&ingredients).Error; err != nil {
		utils.InternalError(c, "Не удалось загрузить ингредиенты")
		return
	}

	if err := db.Find(&finishedGoods).Error; err != nil {
		utils.InternalError(c, "Не удалось загрузить продукты")
		return
	}

	if err := db.Find(&rawMaterials).Error; err != nil {
		utils.InternalError(c, "Не удалось загрузить сырье")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"ingredients":   ingredients,
		"finishedGoods": finishedGoods,
		"rawMaterials":  rawMaterials,
	})
}
