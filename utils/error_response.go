package utils

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

type ErrorResponse struct {
	Error ErrorBody `json:"error"`
}

type ErrorBody struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

// Быстрые хелперы
func RespondError(c *gin.Context, status int, code string, message string) {
	c.JSON(status, ErrorResponse{
		Error: ErrorBody{
			Code:    code,
			Message: message,
		},
	})
}

// Частые случаи
func NotFound(c *gin.Context, message string) {
	RespondError(c, http.StatusNotFound, "ERR_NOT_FOUND", message)
}

func BadRequest(c *gin.Context, message string) {
	RespondError(c, http.StatusBadRequest, "ERR_BAD_REQUEST", message)
}

func InternalError(c *gin.Context, message string) {
	RespondError(c, http.StatusInternalServerError, "ERR_INTERNAL", message)
}

func Conflict(c *gin.Context, message string) {
	RespondError(c, http.StatusConflict, "ERR_CONFLICT", message)
}
