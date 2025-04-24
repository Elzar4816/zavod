package handlers

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"strconv"
	"zavod/models"
)

func GetIngredients(c *gin.Context, db *gorm.DB) {
	var ingredients []models.Ingredient
	var finishedGoods []models.FinishedGood
	var rawMaterials []models.RawMaterial

	// Загружаем ингредиенты с продуктами и сырьем
	db.Preload("Product").Preload("RawMaterial").Find(&ingredients)

	// Загружаем все готовые продукты и сырьевые материалы для выпадающих списков
	db.Find(&finishedGoods)
	db.Find(&rawMaterials)

	// Отправляем данные в JSON-формате
	c.JSON(http.StatusOK, gin.H{
		"ingredients":   ingredients,
		"finishedGoods": finishedGoods,
		"rawMaterials":  rawMaterials,
	})
}
func ListIngredients(c *gin.Context) {
	// Просто рендерим шаблон, без передачи данных
	c.HTML(http.StatusOK, "ingredients.html", nil)
}

// 🏗 CRUD для Ingredients
func CreateIngredient(c *gin.Context, db *gorm.DB) {
	var input models.Ingredient

	// Читаем JSON-данные из запроса
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Введены неправильные данные"})
		return
	}

	// Проверяем, существует ли уже такая запись
	var existingIngredient models.Ingredient
	if err := db.Where("product_id = ? AND raw_material_id = ?", input.ProductID, input.RawMaterialID).First(&existingIngredient).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Данное сырье уже добавлено к указанному продукту"})
		return
	}

	// Создаем новую запись
	ingredient := models.Ingredient{
		ProductID:     input.ProductID,
		RawMaterialID: input.RawMaterialID,
		Quantity:      input.Quantity,
	}

	// Сохраняем в базе
	db.Create(&ingredient)

	// Отправляем успешный ответ
	c.JSON(http.StatusOK, gin.H{"message": "Ингредиент успешно добавлен"})
}

func DeleteIngredient(c *gin.Context, db *gorm.DB) {
	id := c.Param("id")
	var ingredient models.Ingredient

	// Проверим, существует ли ингредиент с таким id
	if err := db.First(&ingredient, id).Error; err != nil {
		// Если не нашли ингредиент, возвращаем ошибку
		c.JSON(http.StatusNotFound, gin.H{"error": "Ингредиент не найден"})
		return
	}

	// Удаляем ингредиент
	if err := db.Delete(&models.Ingredient{}, id).Error; err != nil {
		// Если возникла ошибка при удалении, возвращаем ошибку
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при удалении ингредиента"})
		return
	}

	// Возвращаем успешный ответ
	c.JSON(http.StatusOK, gin.H{"message": "Ингредиент успешно удален"})
}

// Обновление количества ингредиента
func UpdateIngredient(c *gin.Context, db *gorm.DB) {
	var ingredient models.Ingredient
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректный ID ингредиента"})
		return
	}

	// Проверяем, существует ли ингредиент
	if err := db.First(&ingredient, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ингредиент не найден"})
		return
	}

	// Получаем данные из JSON тела запроса (только количество)
	var requestData struct {
		Quantity float64 `json:"quantity"`
	}

	if err := c.ShouldBindJSON(&requestData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректные входные данные"})
		return
	}

	// Обновляем только количество
	ingredient.Quantity = requestData.Quantity

	// Сохраняем изменения
	if err := db.Save(&ingredient).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось обновить ингредиент"})
		return
	}

	// Возвращаем успешный ответ
	c.JSON(http.StatusOK, gin.H{"message": "Ингредиент обновлен"})
}

// Получение списка продуктов
func GetFinishedGoods(c *gin.Context, db *gorm.DB) {
	var finishedGoods []models.FinishedGood
	if err := db.Find(&finishedGoods).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось загрузить продукты"})
		return
	}
	c.JSON(http.StatusOK, finishedGoods)
}

// Получение списка сырья
func GetRawMaterials(c *gin.Context, db *gorm.DB) {
	var rawMaterials []models.RawMaterial
	if err := db.Find(&rawMaterials).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось загрузить сырье"})
		return
	}
	c.JSON(http.StatusOK, rawMaterials)
}
