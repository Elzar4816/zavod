package main

import (
	"log"
	"zavod/db"
	"zavod/handlers"

	"github.com/gin-gonic/gin"
)

func main() {
	// Инициализация базы данных
	gormDB := db.ConnectDB()

	// Инициализация Gin
	r := gin.Default()
	r.Static("/css", "./css")
	r.Static("/images", "./images")
	gin.SetMode(gin.DebugMode)

	// Подключаем HTML-шаблоны
	r.LoadHTMLGlob("templates/*")

	// Главная страница (выбор таблицы)
	r.GET("/", func(c *gin.Context) {
		c.HTML(200, "index.html", nil)
	})

	// Страница единиц измерения
	r.GET("/units", func(c *gin.Context) { handlers.ListUnits(c, gormDB) })

	// Страница сырья
	r.GET("/raw-materials", func(c *gin.Context) { handlers.ListRawMaterials(c, gormDB) })

	// Страница продукции
	r.GET("/finished-good", func(c *gin.Context) { handlers.ListFinishedGoods(c, gormDB) })

	// Страница ингридиентов
	r.GET("/ingredient", func(c *gin.Context) { handlers.ListIngredients(c, gormDB) })

	// Страница бюджета
	r.GET("/budget", func(c *gin.Context) { handlers.ListBudget(c, gormDB) })

	// Маршруты для единиц измерения (Unit)
	r.POST("/unit/create", func(c *gin.Context) { handlers.CreateUnit(c, gormDB) })
	r.DELETE("/unit/delete/:id", func(c *gin.Context) { handlers.DeleteUnit(c, gormDB) })
	r.PUT("/unit/update/:id", func(c *gin.Context) { handlers.UpdateUnit(c, gormDB) })

	// Маршруты для сырья (Raw Material)
	r.POST("/raw-material/create", func(c *gin.Context) { handlers.CreateRawMaterial(c, gormDB) })
	r.DELETE("/raw-material/delete/:id", func(c *gin.Context) { handlers.DeleteRawMaterial(c, gormDB) })
	r.PUT("/raw-material/update/:id", func(c *gin.Context) { handlers.UpdateRawMaterial(c, gormDB) })

	// Маршруты для готовой продукции (Finished Goods)
	r.POST("/finished-good/create", func(c *gin.Context) { handlers.CreateFinishedGood(c, gormDB) })
	r.DELETE("/finished-good/delete/:id", func(c *gin.Context) { handlers.DeleteFinishedGood(c, gormDB) })
	r.PUT("/finished-good/update/:id", func(c *gin.Context) { handlers.UpdateFinishedGood(c, gormDB) })

	// Маршруты для ингредиентов (Ingredient)
	r.POST("/ingredient/create", func(c *gin.Context) { handlers.CreateIngredient(c, gormDB) })
	r.DELETE("/ingredient/delete/:id", func(c *gin.Context) { handlers.DeleteIngredient(c, gormDB) })
	r.PUT("/ingredient/update/:id", func(c *gin.Context) { handlers.UpdateIngredient(c, gormDB) })

	// Маршруты для бюджета (Budget)
	r.POST("/budget/create", func(c *gin.Context) { handlers.CreateBudget(c, gormDB) })
	r.DELETE("/budget/delete/:id", func(c *gin.Context) { handlers.DeleteBudget(c, gormDB) })
	r.PUT("/budget/update/:id", func(c *gin.Context) { handlers.UpdateBudget(c, gormDB) })

	// Страница позиций
	r.GET("/position", func(c *gin.Context) { handlers.ListPositions(c, gormDB) })

	// Маршруты для позиций (Position)
	r.POST("/position/create", func(c *gin.Context) { handlers.CreatePosition(c, gormDB) })
	r.DELETE("/position/delete/:id", func(c *gin.Context) { handlers.DeletePosition(c, gormDB) })
	r.PUT("/position/update/:id", func(c *gin.Context) { handlers.UpdatePosition(c, gormDB) })

	// Страница сотрудников
	r.GET("/employee", func(c *gin.Context) { handlers.ListEmployees(c, gormDB) })
	// Маршруты для сотрудников (Employee)
	r.POST("/employee/create", func(c *gin.Context) { handlers.CreateEmployee(c, gormDB) })
	r.POST("/employee/delete", func(c *gin.Context) { handlers.DeleteEmployee(c, gormDB) })
	r.POST("/employee/update", func(c *gin.Context) { handlers.UpdateEmployee(c, gormDB) })

	// Страница закупки сырья
	r.GET("/raw_material_purchases", func(c *gin.Context) { handlers.ListRawMaterialPurchases(c, gormDB) })
	// Маршруты для закупки сырья (material purchases)
	r.POST("/purchases/create", func(c *gin.Context) { handlers.CreateRawMaterialPurchase(c, gormDB) })
	r.DELETE("/purchases/delete/:id", func(c *gin.Context) { handlers.DeleteRawMaterialPurchase(c, gormDB) })
	r.PUT("/purchases/update", func(c *gin.Context) { handlers.UpdateRawMaterial(c, gormDB) })

	// Запускаем сервер
	log.Println("Server started on http://localhost:8080")
	r.Run(":8080")
}
