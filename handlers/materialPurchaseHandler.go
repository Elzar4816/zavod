package handlers

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"zavod/models"
)

/*
НАДО СРАЗУ РЕДИРЕКТ НА СЫРЬЕ СДЕЛАТЬ ПОСЛЕ ЗАКУПКИ
*/
// ListRawMaterialPurchases - список закупок сырья
func ListRawMaterialPurchases(c *gin.Context, db *gorm.DB) {
	var purchases []models.RawMaterialPurchase
	var rawMaterials []models.RawMaterial
	var employees []models.Employee

	db.Preload("RawMaterial").Preload("Employee").Find(&purchases)
	db.Find(&rawMaterials)
	db.Find(&employees)

	c.HTML(http.StatusOK, "raw_material_purchases.html", gin.H{
		"purchases":    purchases,
		"rawMaterials": rawMaterials,
		"employees":    employees, // Передаем список сотрудников в шаблон
	})
}

// CreateRawMaterialPurchase - создание закупки сырья
func CreateRawMaterialPurchase(c *gin.Context, db *gorm.DB) {
	var purchase models.RawMaterialPurchase

	// Логируем тело запроса
	body, _ := io.ReadAll(c.Request.Body)
	log.Println("Request Body:", string(body))

	// Пробуем распарсить JSON
	if err := json.Unmarshal(body, &purchase); err != nil {
		log.Println("Ошибка парсинга JSON:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректные входные данные"})
		return
	}

	// Логируем распарсенные данные
	log.Println("Parsed purchase:", purchase)

	// Проверяем бюджет
	var budget models.Budget
	if err := db.First(&budget).Error; err != nil {
		log.Println("Ошибка поиска бюджета:", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Бюджет не найден"})
		return
	}

	// Проверяем, хватает ли денег
	if budget.TotalAmount < purchase.TotalAmount {
		log.Println("Недостаточно средств в бюджете:", budget.TotalAmount, "<", purchase.TotalAmount)
		c.JSON(http.StatusConflict, gin.H{"error": "Недостаточно средств в бюджете"})
		return
	}

	// Вычитаем деньги из бюджета
	budget.TotalAmount -= purchase.TotalAmount
	if err := db.Save(&budget).Error; err != nil {
		log.Println("Ошибка обновления бюджета:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка обновления бюджета"})
		return
	}

	// Добавляем дату и создаем закупку
	purchase.PurchaseDate = time.Now()
	if err := db.Create(&purchase).Error; err != nil {
		log.Println("Ошибка создания закупки:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка создания закупки"})
		return
	}

	// Обновляем количество и общую сумму сырья
	var rawMaterial models.RawMaterial
	if err := db.First(&rawMaterial, purchase.RawMaterialID).Error; err != nil {
		log.Println("Ошибка поиска сырья:", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Сырье не найдено"})
		return
	}

	rawMaterial.Quantity += purchase.Quantity
	rawMaterial.TotalAmount += purchase.TotalAmount // Прибавляем общую сумму закупки
	if err := db.Save(&rawMaterial).Error; err != nil {
		log.Println("Ошибка обновления количества и суммы сырья:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка обновления количества и суммы сырья"})
		return
	}

	// Возвращаем корректный JSON
	c.JSON(http.StatusOK, gin.H{"id": purchase.ID, "message": "Закупка успешно создана"})
}

// DeleteRawMaterialPurchase - удаление закупки сырья
func DeleteRawMaterialPurchase(c *gin.Context, db *gorm.DB) {
	id := c.Param("id")
	var purchase models.RawMaterialPurchase

	if err := db.First(&purchase, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Закупка не найдена"})
		return
	}

	// Возвращаем сумму в бюджет
	var budget models.Budget
	if err := db.First(&budget).Error; err == nil {
		budget.TotalAmount += purchase.TotalAmount
		if err := db.Save(&budget).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка обновления бюджета"})
			return
		}
	}

	// Уменьшаем количество и общую сумму сырья
	var rawMaterial models.RawMaterial
	if err := db.First(&rawMaterial, purchase.RawMaterialID).Error; err != nil {
		log.Println("Ошибка поиска сырья при удалении закупки:", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Сырье не найдено"})
		return
	}

	rawMaterial.Quantity -= purchase.Quantity
	rawMaterial.TotalAmount -= purchase.TotalAmount // Вычитаем общую сумму закупки
	if err := db.Save(&rawMaterial).Error; err != nil {
		log.Println("Ошибка обновления количества и суммы сырья при удалении закупки:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка обновления количества и суммы сырья"})
		return
	}

	// Удаляем запись
	if err := db.Delete(&purchase).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка удаления закупки"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Закупка удалена"})
}
