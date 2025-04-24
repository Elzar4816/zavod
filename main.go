package main

import (
	"gorm.io/gorm"
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
	r.Use(gin.Recovery())
	setupRoutesStaticAndTemplates(r)

	// Регистрация маршрутов
	setupRoutes(r, gormDB)

	// Запускаем сервер
	log.Println("Server started on http://localhost:8080")
	r.Run(":8080")
}

// setupRoutesStaticAndTemplates - функция для настройки статики и HTML-шаблонов
func setupRoutesStaticAndTemplates(r *gin.Engine) {
	// Раздача статики (React SPA)
	r.Static("/app", "./frontend/dist")
	//// Подключаем HTML-шаблоны
	//r.LoadHTMLGlob("templates/*")
	//r.LoadHTMLGlob("templates/*.html")
	// Для всех несуществующих маршрутов отдаём index.html (пусть React сам разрулит роутинг)
	r.NoRoute(func(c *gin.Context) {
		c.File("./frontend/dist/index.html")
	})

}

// setupRoutes - функция для регистрации всех маршрутов и хендлеров
func setupRoutes(r *gin.Engine, gormDB *gorm.DB) {
	// --- SSR (шаблоны)
	//r.GET("/", func(c *gin.Context) { c.HTML(http.StatusOK, "index.html", nil) })
	//r.GET("/api/hello", func(c *gin.Context) {
	//	c.JSON(200, gin.H{
	//		"message": "Привет с Go-сервера!",
	//	})
	//})

	//r.GET("/units", func(c *gin.Context) { handlers.ListUnits(c, gormDB) })
	//r.GET("/raw-materials", func(c *gin.Context) { handlers.ListRawMaterials(c, gormDB) })
	//r.GET("/finished-good", func(c *gin.Context) { handlers.ListFinishedGoods(c, gormDB) })
	//r.GET("/ingredient", func(c *gin.Context) { handlers.ListIngredients(c) })
	//r.GET("/budget", func(c *gin.Context) { handlers.ListBudget(c, gormDB) })
	//r.GET("/position", func(c *gin.Context) { handlers.ListPositions(c, gormDB) })
	//r.GET("/employee", func(c *gin.Context) { handlers.ListEmployees(c, gormDB) })
	//r.GET("/raw_material_purchases", func(c *gin.Context) { handlers.ListRawMaterialPurchases(c, gormDB) })
	//r.GET("/productions", func(c *gin.Context) { handlers.ListProductProductions(c, gormDB) })
	//r.GET("/sales", func(c *gin.Context) { handlers.RenderSalesPage(c, gormDB) })
	//r.GET("/salary-distribution", handlers.ShowSalaryDistributionPage())

	// --- JSON API — всё под /api ---
	api := r.Group("/api")
	{
		api.GET("/units", func(c *gin.Context) { handlers.ListUnits(c, gormDB) })
		api.POST("/units/create", func(c *gin.Context) { handlers.CreateUnit(c, gormDB) })
		api.DELETE("/units/delete/:id", func(c *gin.Context) { handlers.DeleteUnit(c, gormDB) })
		api.PUT("/units/update/:id", func(c *gin.Context) { handlers.UpdateUnit(c, gormDB) })

		// Raw Materials (API)
		api.POST("/raw-material/create", func(c *gin.Context) { handlers.CreateRawMaterial(c, gormDB) })
		api.DELETE("/raw-material/delete/:id", func(c *gin.Context) { handlers.DeleteRawMaterial(c, gormDB) })
		api.PUT("/raw-material/update/:id", func(c *gin.Context) { handlers.UpdateRawMaterial(c, gormDB) })
		api.GET("/raw-materials", func(c *gin.Context) { handlers.GetRawMaterials(c, gormDB) })

		// Finished Goods (API)
		api.POST("/finished-good/create", func(c *gin.Context) { handlers.CreateFinishedGood(c, gormDB) })
		api.DELETE("/finished-good/delete/:id", func(c *gin.Context) { handlers.DeleteFinishedGood(c, gormDB) })
		api.PUT("/finished-good/update/:id", func(c *gin.Context) { handlers.UpdateFinishedGood(c, gormDB) })
		api.GET("/finished-goods", func(c *gin.Context) { handlers.GetFinishedGoods(c, gormDB) })

		// Ingredients
		api.GET("/ingredients", func(c *gin.Context) { handlers.GetIngredients(c, gormDB) })
		api.POST("/ingredient/create", func(c *gin.Context) { handlers.CreateIngredient(c, gormDB) })
		api.DELETE("/ingredient/delete/:id", func(c *gin.Context) { handlers.DeleteIngredient(c, gormDB) })
		api.PUT("/ingredient/update/:id", func(c *gin.Context) { handlers.UpdateIngredient(c, gormDB) })

		// Budget
		api.GET("/budgets", func(c *gin.Context) { handlers.GetBudget(c, gormDB) })
		api.POST("/budget/create", func(c *gin.Context) { handlers.CreateBudget(c, gormDB) })
		api.PUT("/budget/update/:id", func(c *gin.Context) { handlers.UpdateBudget(c, gormDB) })
		api.GET("/check-budget", func(c *gin.Context) { handlers.CheckBudgetExists(c, gormDB) })

		// Positions
		api.POST("/position/create", func(c *gin.Context) { handlers.CreatePosition(c, gormDB) })
		api.DELETE("/position/delete/:id", func(c *gin.Context) { handlers.DeletePosition(c, gormDB) })
		api.PUT("/position/update/:id", func(c *gin.Context) { handlers.UpdatePosition(c, gormDB) })

		// Employees
		// Маршрут для получения сотрудников
		api.GET("/employees", func(c *gin.Context) { handlers.GetEmployees(c, gormDB) })

		api.POST("/employee/create", func(c *gin.Context) { handlers.CreateEmployee(c, gormDB) })
		api.POST("/employee/delete", func(c *gin.Context) { handlers.DeleteEmployee(c, gormDB) })
		api.POST("/employee/update", func(c *gin.Context) { handlers.UpdateEmployee(c, gormDB) })

		// Purchases
		api.POST("/purchases/create", func(c *gin.Context) { handlers.CreateRawMaterialPurchase(c, gormDB) })
		api.DELETE("/purchases/delete/:id", func(c *gin.Context) { handlers.DeleteRawMaterialPurchase(c, gormDB) })
		api.GET("/purchases", func(c *gin.Context) { handlers.GetPurchases(c, gormDB) })

		// Productions history
		api.GET("/productions", func(c *gin.Context) { handlers.GetProductionHistory(c, gormDB) })
		api.POST("/productions/create", func(c *gin.Context) { handlers.ProduceNewFinishedGood(c, gormDB) })

		// Sales (issue)
		api.POST("/sale_product", func(c *gin.Context) { handlers.SalesHandler(c, gormDB) })
		api.GET("/sales", func(c *gin.Context) { handlers.SalesHistoryHandler(c, gormDB) })
		// Salaries
		api.GET("/salaries", func(c *gin.Context) { handlers.GetSalaries(c, gormDB) })
		api.POST("/salaries/issue", func(c *gin.Context) { handlers.IssueSalaries(c, gormDB) })
		api.POST("/generate-salaries", func(c *gin.Context) { handlers.GenerateSalaries(gormDB)(c) })
		api.POST("/salaries/update", func(c *gin.Context) { handlers.UpdateSalaryTotalHandler(gormDB)(c) })
	}
}
