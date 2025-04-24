package models

type Salary struct {
	ID                 uint     `json:"id" gorm:"primaryKey"`
	EmployeeID         uint     `json:"employee_id" gorm:"not null;index"`
	Employee           Employee `json:"employee" gorm:"foreignKey:EmployeeID;constraint:OnDelete:CASCADE"`
	Year               int      `json:"year" gorm:"not null"`
	Month              int      `json:"month" gorm:"not null"`
	PurchaseCount      int      `json:"purchase_count" gorm:"default:0"`
	ProductionCount    int      `json:"production_count" gorm:"default:0"`
	SaleCount          int      `json:"sale_count" gorm:"default:0"`
	TotalParticipation int      `json:"total_participation" gorm:"not null"`
	Bonus              float64  `json:"bonus" gorm:"not null"`
	TotalSalary        float64  `json:"total_salary" gorm:"not null"`
	Status             bool     `json:"status" gorm:"default:false"` // <-- теперь bool
}

func (Salary) TableName() string {
	return "salaries"
}
