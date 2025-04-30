// Package models models/permission.go
package models

type Permission struct {
	ID   uint   `gorm:"primaryKey" json:"id"`
	Code string `gorm:"unique;not null" json:"code"` // например "unit_read", "unit_edit"
	Name string `gorm:"not null" json:"name"`        // Человеческое название
}

func (Permission) TableName() string {
	return "permissions"
}

// EmployeePermission Связка между сотрудниками и правами
type EmployeePermission struct {
	EmployeeID   uint `gorm:"primaryKey"`
	PermissionID uint `gorm:"primaryKey"`
}

func (EmployeePermission) TableName() string {
	return "employee_permissions"
}
