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
	// Для всех несуществующих маршрутов отдаём index.html (пусть React сам разрулит роутинг)
	r.NoRoute(func(c *gin.Context) {
		c.File("./frontend/dist/index.html")
	})

}

// setupRoutes - функция для регистрации всех маршрутов и хендлеров
func setupRoutes(r *gin.Engine, gormDB *gorm.DB) {

	// --- JSON API — всё под /api ---
	api := r.Group("/api")
	{
		// 👇 Публичные маршруты (без авторизации)
		api.POST("/login", func(c *gin.Context) { handlers.LoginHandler(c, gormDB) })
		api.POST("/logout", func(c *gin.Context) { handlers.LogoutHandler(c, gormDB) })
		api.GET("/session", func(c *gin.Context) { handlers.CheckSessionHandler(c, gormDB) })

		// 👇 Защищённые маршруты
		protected := api.Group("/")
		protected.Use(handlers.AuthMiddleware(gormDB))
		{
			protected.GET("/units", func(c *gin.Context) { handlers.ListUnits(c, gormDB) })
			protected.POST("/units/create", func(c *gin.Context) { handlers.CreateUnit(c, gormDB) })
			protected.DELETE("/units/delete/:id", func(c *gin.Context) { handlers.DeleteUnit(c, gormDB) })
			protected.PUT("/units/update/:id", func(c *gin.Context) { handlers.UpdateUnit(c, gormDB) })

			// Raw Materials (API)
			protected.POST("/raw-material/create", func(c *gin.Context) { handlers.CreateRawMaterial(c, gormDB) })
			protected.DELETE("/raw-material/delete/:id", func(c *gin.Context) { handlers.DeleteRawMaterial(c, gormDB) })
			protected.PUT("/raw-material/update/:id", func(c *gin.Context) { handlers.UpdateRawMaterial(c, gormDB) })
			protected.GET("/raw-materials", func(c *gin.Context) { handlers.GetRawMaterials(c, gormDB) })

			// Finished Goods (API)
			protected.POST("/finished-good/create", func(c *gin.Context) { handlers.CreateFinishedGood(c, gormDB) })
			protected.DELETE("/finished-good/delete/:id", func(c *gin.Context) { handlers.DeleteFinishedGood(c, gormDB) })
			protected.PUT("/finished-good/update/:id", func(c *gin.Context) { handlers.UpdateFinishedGood(c, gormDB) })
			protected.GET("/finished-goods", func(c *gin.Context) { handlers.GetFinishedGoods(c, gormDB) })

			// Ingredients
			protected.GET("/ingredients", func(c *gin.Context) { handlers.GetIngredients(c, gormDB) })
			protected.POST("/ingredient/create", func(c *gin.Context) { handlers.CreateIngredient(c, gormDB) })
			protected.DELETE("/ingredient/delete/:id", func(c *gin.Context) { handlers.DeleteIngredient(c, gormDB) })
			protected.PUT("/ingredient/update/:id", func(c *gin.Context) { handlers.UpdateIngredient(c, gormDB) })

			// Budget
			protected.GET("/budgets", func(c *gin.Context) { handlers.GetBudget(c, gormDB) })
			protected.POST("/budget/create", func(c *gin.Context) { handlers.CreateBudget(c, gormDB) })
			protected.PUT("/budget/update/:id", func(c *gin.Context) { handlers.UpdateBudget(c, gormDB) })
			protected.GET("/check-budget", func(c *gin.Context) { handlers.CheckBudgetExists(c, gormDB) })

			// Positions
			protected.POST("/position/create", func(c *gin.Context) { handlers.CreatePosition(c, gormDB) })
			protected.DELETE("/position/delete/:id", func(c *gin.Context) { handlers.DeletePosition(c, gormDB) })
			protected.PUT("/position/update/:id", func(c *gin.Context) { handlers.UpdatePosition(c, gormDB) })

			// Employees
			// Маршрут для получения сотрудников
			protected.GET("/employees", func(c *gin.Context) { handlers.GetEmployees(c, gormDB) })

			protected.POST("/employee/create", func(c *gin.Context) { handlers.CreateEmployee(c, gormDB) })
			protected.POST("/employee/delete", func(c *gin.Context) { handlers.DeleteEmployee(c, gormDB) })
			protected.POST("/employee/update", func(c *gin.Context) { handlers.UpdateEmployee(c, gormDB) })

			// Purchases
			protected.POST("/purchases/create", func(c *gin.Context) { handlers.CreateRawMaterialPurchase(c, gormDB) })
			protected.DELETE("/purchases/delete/:id", func(c *gin.Context) { handlers.DeleteRawMaterialPurchase(c, gormDB) })
			protected.GET("/purchases", func(c *gin.Context) { handlers.GetPurchases(c, gormDB) })

			// Productions history
			protected.GET("/productions", func(c *gin.Context) { handlers.GetProductionHistory(c, gormDB) })
			protected.POST("/productions/create", func(c *gin.Context) { handlers.ProduceNewFinishedGood(c, gormDB) })

			// Sales (issue)
			protected.POST("/sale_product", func(c *gin.Context) { handlers.SalesHandler(c, gormDB) })
			protected.GET("/sales", func(c *gin.Context) { handlers.SalesHistoryHandler(c, gormDB) })
			// Salaries
			protected.GET("/salaries", func(c *gin.Context) { handlers.GetSalaries(c, gormDB) })
			protected.POST("/salaries/issue", func(c *gin.Context) { handlers.IssueSalaries(c, gormDB) })
			protected.POST("/generate-salaries", func(c *gin.Context) { handlers.GenerateSalaries(gormDB)(c) })
			protected.POST("/salaries/update", func(c *gin.Context) { handlers.UpdateSalaryTotalHandler(gormDB)(c) })

			//credit
			protected.POST("/credits/create", func(c *gin.Context) { handlers.CreateCreditHandler(c, gormDB) })
			protected.POST("/credits/payment", func(c *gin.Context) { handlers.MakeCreditPaymentHandler(c, gormDB) })
			protected.GET("/credits", func(c *gin.Context) { handlers.GetAllCreditsHandler(c, gormDB) })
			protected.GET("/credits/:id/payments", func(c *gin.Context) { handlers.GetCreditPaymentsHandler(c, gormDB) })
			protected.GET("/credits/:id", func(c *gin.Context) { handlers.GetCreditByID(c, gormDB) })

		}

	}
}
