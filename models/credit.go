package models

import (
	"time"
)

type Credit struct {
	ID                 uint            `gorm:"primaryKey" json:"id"`
	Amount             float64         `json:"amount"`
	ReceivedDate       time.Time       `json:"received_date"`
	TermYears          int             `json:"term_years"`
	AnnualInterestRate float64         `json:"annual_interest_rate"`
	PenaltyPercent     float64         `json:"penalty_percent"`
	CreditPayments     []CreditPayment `gorm:"foreignKey:CreditID" json:"credit_payments"`
	CreatedAt          time.Time
	UpdatedAt          time.Time
}

func (Credit) TableName() string {
	return "credits"
}

type CreditPayment struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	CreditID        uint      `json:"credit_id"`
	PaymentDate     time.Time `json:"payment_date"`
	PrincipalPart   float64   `json:"principal_part"`
	InterestPart    float64   `json:"interest_part"`
	TotalAmount     float64   `json:"total_amount"`
	RemainingCredit float64   `json:"remaining_credit"`
	DaysLate        int       `json:"days_late"`
	PenaltyAmount   float64   `json:"penalty_amount"`
	FinalAmount     float64   `json:"final_amount"`
	CreatedAt       time.Time
	UpdatedAt       time.Time
}

func (CreditPayment) TableName() string {
	return "credit_payments"
}
