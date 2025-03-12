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
	)
	return db
}
