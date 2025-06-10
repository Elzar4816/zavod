package db

import (
	"fmt"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"log"
	"os"
	"zavod/models"

	_ "zavod/models"
)

var db *gorm.DB

func ConnectDB() *gorm.DB {
	// Загружаем переменные окружения
	if err := godotenv.Load("configuration.env"); err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	// Формируем строку подключения
	dsn := fmt.Sprintf(
		"user=%s password=%s dbname=%s sslmode=disable client_encoding=UTF8",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
	)

	var err error
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}

	log.Println("Database connected successfully.")

	db.AutoMigrate(
		&models.Unit{},
		&models.RawMaterial{},
		&models.FinishedGood{},
		&models.Ingredient{},
		&models.Employee{},
		&models.Position{},
		&models.RawMaterialPurchase{},
		&models.ProductSale{},
		&models.ProductProduction{},
		&models.Budget{},
		&models.Salary{},
		&models.Credit{},
		&models.CreditPayment{},
		&models.Session{},
	)
	initPositions(db) // ⬅️ Вставь сюда
	seedInitialEmployees(db)
	initUnits(db)
	return db
}
func initPositions(db *gorm.DB) {
	positions := []models.Position{
		{Name: "admin"},
		{Name: "technologist"},
		{Name: "manager"},
		{Name: "accountant"},
	}

	for _, pos := range positions {
		var existing models.Position
		if err := db.Where("name = ?", pos.Name).First(&existing).Error; err != nil {
			if err := db.Create(&pos).Error; err != nil {
				log.Printf("Ошибка при создании позиции %s: %v\n", pos.Name, err)
			} else {
				log.Printf("Добавлена роль: %s\n", pos.Name)
			}
		}
	}
}
func seedInitialEmployees(db *gorm.DB) {
	employees := []models.Employee{
		{FullName: "Админ Пользователь", PositionID: 1, Salary: 0, Address: "офис", Phone: "1111", Login: "admin", Email: "admin@zavod.com", Password: "admin"},
		{FullName: "Технолог Иван", PositionID: 2, Salary: 0, Address: "цех", Phone: "2222", Login: "tech", Email: "tech@zavod.com", Password: "tech"},
		{FullName: "Менеджер Петр", PositionID: 3, Salary: 0, Address: "офис", Phone: "3333", Login: "manage", Email: "manage@zavod.com", Password: "manage"},
		{FullName: "Бухгалтер Сергей", PositionID: 4, Salary: 0, Address: "офис", Phone: "4444", Login: "buch", Email: "buch@zavod.com", Password: "buch"},
	}

	for _, emp := range employees {
		var exists models.Employee
		if err := db.Where("login = ?", emp.Login).First(&exists).Error; err != nil {
			if err := db.Create(&emp).Error; err != nil {
				log.Printf("Ошибка при создании сотрудника %s: %v\n", emp.FullName, err)
			} else {
				log.Printf("Создан сотрудник: %s\n", emp.FullName)
			}
		}
	}
}
func initUnits(db *gorm.DB) {
	units := []models.Unit{
		{Name: "Килограмм"},
		{Name: "Литр"},
		{Name: "Миллиграмм"},
	}

	for _, unit := range units {
		var existing models.Unit
		if err := db.Where("name = ?", unit.Name).First(&existing).Error; err != nil {
			if err := db.Create(&unit).Error; err != nil {
				log.Printf("Ошибка при создании единицы: %s: %v", unit.Name, err)
			} else {
				log.Printf("Добавлена единица измерения: %s", unit.Name)
			}
		}
	}
}
