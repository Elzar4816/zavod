package models

type Budget struct {
	ID               uint    `json:"id" gorm:"primaryKey"`
	TotalAmount      float64 `json:"total_amount" gorm:"default:0"`
	MarkupPercentage float64 `json:"markup_percentage" gorm:"default:0"` // для продаж
	BonusPercentage  float64 `json:"bonus_percentage" gorm:"default:0"`  // для зарплат
}

func (Budget) TableName() string {
	return "budgets"
}
