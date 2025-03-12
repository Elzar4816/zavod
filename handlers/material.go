package handlers

import (
	"log"
	"net/http"
	"strconv"
	"zavod/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// 📌 Функции для отображения данных отдельных таблиц

func ListUnits(c *gin.Context, db *gorm.DB) {
	var units []models.Unit
	db.Find(&units)

	c.HTML(http.StatusOK, "units.html", gin.H{
		"units": units,
	})
}

func ListRawMaterials(c *gin.Context, db *gorm.DB) {
	var rawMaterials []models.RawMaterial
	var units []models.Unit

	// Загружаем сырье и доступные единицы измерения
	db.Preload("Unit").Find(&rawMaterials)
	db.Find(&units)

	// Передаем данные в шаблон
	c.HTML(http.StatusOK, "raw_materials.html", gin.H{
		"rawMaterials": rawMaterials,
		"units":        units,
	})
}

func ListFinishedGoods(c *gin.Context, db *gorm.DB) {
	var finishedGoods []models.FinishedGood
	var units []models.Unit

	// Загружаем все готовые товары вместе с их единицами измерения
	db.Preload("Unit").Find(&finishedGoods)

	// Загружаем все доступные единицы измерения для выпадающего списка
	db.Find(&units)

	// Передаем данные в шаблон
	c.HTML(http.StatusOK, "finished_goods.html", gin.H{
		"finishedGoods": finishedGoods,
		"units":         units,
	})
}

func ListIngredients(c *gin.Context, db *gorm.DB) {
	var ingredients []models.Ingredient
	var finishedGoods []models.FinishedGood
	var rawMaterials []models.RawMaterial

	// Загружаем ингредиенты вместе с привязанными продуктами и сырьем
	db.Preload("Product").Preload("RawMaterial").Find(&ingredients)

	// Загружаем все готовые продукты для выпадающего списка
	db.Find(&finishedGoods)

	// Загружаем все сырьевые материалы для выпадающего списка
	db.Find(&rawMaterials)

	// Передаем данные в шаблон
	c.HTML(http.StatusOK, "ingredients.html", gin.H{
		"ingredients":   ingredients,
		"finishedGoods": finishedGoods,
		"rawMaterials":  rawMaterials,
	})
}

// 🏗 CRUD для Units
func CreateUnit(c *gin.Context, db *gorm.DB) {
	var unit models.Unit
	// Чтение данных из JSON (не из формы)
	if err := c.ShouldBindJSON(&unit); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректные данные"})
		return
	}

	if unit.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Название не может быть пустым"})
		return
	}

	if err := db.Create(&unit).Error; err != nil {
		log.Println("Ошибка при сохранении в БД:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при сохранении"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": unit.ID, "name": unit.Name})
}

func DeleteUnit(c *gin.Context, db *gorm.DB) {
	id := c.Param("id")
	var unit models.Unit
	if err := db.First(&unit, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Единица измерения не найдена"})
		return
	}

	if err := db.Delete(&unit).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при удалении"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Запись успешно удалена"})
}

func UpdateUnit(c *gin.Context, db *gorm.DB) {
	id := c.Param("id")
	var unit models.Unit
	if err := db.First(&unit, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Единица измерения не найдена"})
		return
	}

	// Чтение новых данных из JSON
	var updatedData struct {
		Name string `json:"name"`
	}
	if err := c.ShouldBindJSON(&updatedData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректные данные"})
		return
	}

	if updatedData.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Имя не может быть пустым"})
		return
	}

	unit.Name = updatedData.Name // Обновляем имя

	// Сохраняем изменения
	if err := db.Save(&unit).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при обновлении"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"id": unit.ID, "name": unit.Name})
}

// 🏗 CRUD для Raw Materials
func CreateRawMaterial(c *gin.Context, db *gorm.DB) {
	var rawMaterial models.RawMaterial

	// Получаем данные из тела запроса
	if err := c.ShouldBindJSON(&rawMaterial); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректные данные"})
		return
	}

	// Сохраняем в БД
	if err := db.Create(&rawMaterial).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при сохранении сырья"})
		return
	}

	// Отправляем ответ с информацией о новом сырье
	c.JSON(http.StatusOK, gin.H{"message": "Сырье добавлено", "id": rawMaterial.ID})
}

func DeleteRawMaterial(c *gin.Context, db *gorm.DB) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID не указан"})
		return
	}

	// Ищем сырье по ID
	var rawMaterial models.RawMaterial
	if err := db.First(&rawMaterial, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Сырье не найдено"})
		return
	}

	// Удаляем сырье из базы
	if err := db.Delete(&rawMaterial).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при удалении сырья"})
		return
	}

	// Отправляем успешный ответ с ID удаленного сырья
	c.JSON(http.StatusOK, gin.H{
		"id":      rawMaterial.ID,
		"message": "Сырье удалено",
	})
}

func UpdateRawMaterial(c *gin.Context, db *gorm.DB) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID не указан"})
		return
	}

	// Ищем сырье по ID
	var rawMaterial models.RawMaterial
	if err := db.First(&rawMaterial, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Сырье не найдено"})
		return
	}

	// Получаем данные из тела запроса
	var input struct {
		Name        string  `json:"name"`
		Quantity    float64 `json:"quantity"`
		TotalAmount float64 `json:"total_amount"`
		UnitID      uint    `json:"unit_id"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректные данные"})
		return
	}

	// Обновляем данные
	rawMaterial.Name = input.Name
	rawMaterial.Quantity = input.Quantity
	rawMaterial.TotalAmount = input.TotalAmount
	rawMaterial.UnitID = input.UnitID

	// Сохраняем изменения
	if err := db.Save(&rawMaterial).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при обновлении сырья"})
		return
	}

	// Отправляем успешный ответ с объектом сырья
	c.JSON(http.StatusOK, gin.H{
		"id":           rawMaterial.ID,
		"name":         rawMaterial.Name,
		"quantity":     rawMaterial.Quantity,
		"total_amount": rawMaterial.TotalAmount,
		"unit_id":      rawMaterial.UnitID,
		"message":      "Сырье обновлено",
	})
}

// 🏗 CRUD для Finished Goods
func CreateFinishedGood(c *gin.Context, db *gorm.DB) {
	var finishedGood models.FinishedGood

	// Получаем данные в формате JSON
	if err := c.BindJSON(&finishedGood); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input data"})
		return
	}

	// Сохраняем в базу
	db.Create(&finishedGood)

	// Возвращаем успешный ответ с id
	c.JSON(http.StatusOK, finishedGood)
}

func DeleteFinishedGood(c *gin.Context, db *gorm.DB) {
	id := c.Param("id")

	// Ищем и удаляем
	if err := db.Delete(&models.FinishedGood{}, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Finished good not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Готовая продукция удалена"})
}

func UpdateFinishedGood(c *gin.Context, db *gorm.DB) {
	var finishedGood models.FinishedGood
	id := c.Param("id")

	// Ищем запись
	if err := db.First(&finishedGood, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Finished good not found"})
		return
	}

	// Получаем данные в формате JSON
	if err := c.BindJSON(&finishedGood); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input data"})
		return
	}

	// Сохраняем изменения
	db.Save(&finishedGood)

	c.JSON(http.StatusOK, finishedGood)
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

// Обновление ингредиента с проверкой на дублирование
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

	// Получаем данные из JSON тела запроса
	var requestData struct {
		ProductID     int     `json:"product_id"`
		RawMaterialID int     `json:"raw_material_id"`
		Quantity      float64 `json:"quantity"`
	}

	if err := c.ShouldBindJSON(&requestData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректные входные данные"})
		return
	}

	// Проверяем, не создаем ли мы дубликат
	var existingIngredient models.Ingredient
	if err := db.Where("product_id = ? AND raw_material_id = ? AND id != ?", requestData.ProductID, requestData.RawMaterialID, id).First(&existingIngredient).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Данное сырье уже добавлено к указанному продукту"})
		return
	}

	// Обновляем данные
	ingredient.ProductID = uint(requestData.ProductID)
	ingredient.RawMaterialID = uint(requestData.RawMaterialID)
	ingredient.Quantity = requestData.Quantity

	// Сохраняем изменения
	if err := db.Save(&ingredient).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось обновить ингредиент"})
		return
	}

	// Возвращаем успешный ответ
	c.JSON(http.StatusOK, gin.H{"message": "Ингредиент обновлен"})
}
