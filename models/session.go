// Package models models/session.go
package models

import "time"

type Session struct {
	ID         string `gorm:"primaryKey;type:uuid"`
	EmployeeID uint   `gorm:"not null;index"`
	CreatedAt  time.Time
	ExpiresAt  time.Time
}

func (Session) TableName() string {
	return "sessions"
}
