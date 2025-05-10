package middlewares

import (
	"github.com/casbin/casbin/v2"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
)

func CasbinMiddleware(e *casbin.Enforcer) gin.HandlerFunc {
	return func(c *gin.Context) {
		roleRaw, exists := c.Get("userRole")
		if !exists {
			c.AbortWithStatus(http.StatusForbidden)
			return
		}
		role := roleRaw.(string)

		obj := c.Request.URL.Path
		act := c.Request.Method

		ok, err := e.Enforce(role, obj, act)
		if err != nil {
			log.Println("Casbin error:", err)
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		if !ok {
			c.AbortWithStatus(http.StatusForbidden)
			return
		}
		c.Next()
	}
}
