package reports

import (
	"baliance.com/gooxml/color"
	"baliance.com/gooxml/document"
	"baliance.com/gooxml/measurement"
	"baliance.com/gooxml/schema/soo/wml"
	"bytes"
	"fmt"
	"github.com/jung-kurt/gofpdf"
	"github.com/xuri/excelize/v2"
	"zavod/models"

	"gorm.io/gorm"
)

func GenerateCreditPaymentsReport(db *gorm.DB, creditID uint, format string) ([]byte, string, error) {
	var payments []models.CreditPayment
	if err := db.Where("credit_id = ?", creditID).
		Order("payment_date").
		Find(&payments).Error; err != nil {
		return nil, "", err
	}

	switch format {
	case "xlsx":
		return exportCreditPaymentsToExcel(payments, creditID)
	case "pdf":
		return exportCreditPaymentsToPDF(payments, creditID)
	case "docx":
		return exportCreditPaymentsToDocx(payments, creditID)
	default:
		return nil, "", fmt.Errorf("неподдерживаемый формат: %s", format)
	}
}
func exportCreditPaymentsToExcel(payments []models.CreditPayment, creditID uint) ([]byte, string, error) {
	f := excelize.NewFile()
	sheet := "Выплаты по кредиту"
	f.SetSheetName("Sheet1", sheet)

	headers := []string{"Дата", "Основной долг", "Проценты", "Сумма", "Остаток", "Дни просрочки", "Пеня", "Итог"}
	for i, h := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		f.SetCellValue(sheet, cell, h)
	}

	for i, p := range payments {
		row := i + 2
		f.SetCellValue(sheet, fmt.Sprintf("A%d", row), p.PaymentDate.Format("2006-01-02"))
		f.SetCellValue(sheet, fmt.Sprintf("B%d", row), p.PrincipalPart)
		f.SetCellValue(sheet, fmt.Sprintf("C%d", row), p.InterestPart)
		f.SetCellValue(sheet, fmt.Sprintf("D%d", row), p.TotalAmount)
		f.SetCellValue(sheet, fmt.Sprintf("E%d", row), p.RemainingCredit)
		f.SetCellValue(sheet, fmt.Sprintf("F%d", row), p.DaysLate)
		f.SetCellValue(sheet, fmt.Sprintf("G%d", row), p.PenaltyAmount)
		f.SetCellValue(sheet, fmt.Sprintf("H%d", row), p.FinalAmount)
	}

	var buf bytes.Buffer
	if err := f.Write(&buf); err != nil {
		return nil, "", err
	}
	filename := fmt.Sprintf("credit-payments-report-%d.xlsx", creditID)
	return buf.Bytes(), filename, nil
}
func exportCreditPaymentsToPDF(payments []models.CreditPayment, creditID uint) ([]byte, string, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	fontPath := "frontend/src/assets/fonts/TildaSans/TildaSans-Regular.ttf"
	pdf.AddUTF8Font("Tilda", "", fontPath)
	pdf.SetFont("Tilda", "", 14)

	pdf.AddPage()

	// Заголовок
	title := fmt.Sprintf("Выплаты по кредиту №%d", creditID)
	pdf.Cell(40, 10, title)
	pdf.Ln(8)

	// Диапазон дат
	if len(payments) > 0 {
		from := payments[0].PaymentDate.Format("02.01.2006")
		to := payments[len(payments)-1].PaymentDate.Format("02.01.2006")
		pdf.SetFont("Tilda", "", 12)
		pdf.Cell(0, 10, fmt.Sprintf("Период: с %s по %s", from, to))
		pdf.Ln(10)
	}

	// Таблица
	headers := []string{"Дата", "Осн. долг", "Проц.", "Сумма", "Остаток", "Проср.", "Пеня", "Итог"}
	pdf.SetFont("Tilda", "", 10)
	for _, h := range headers {
		pdf.CellFormat(25, 8, h, "1", 0, "", false, 0, "")
	}
	pdf.Ln(-1)

	for _, p := range payments {
		pdf.CellFormat(25, 8, p.PaymentDate.Format("2006-01-02"), "1", 0, "", false, 0, "")
		pdf.CellFormat(25, 8, fmt.Sprintf("%.2f", p.PrincipalPart), "1", 0, "", false, 0, "")
		pdf.CellFormat(25, 8, fmt.Sprintf("%.2f", p.InterestPart), "1", 0, "", false, 0, "")
		pdf.CellFormat(25, 8, fmt.Sprintf("%.2f", p.TotalAmount), "1", 0, "", false, 0, "")
		pdf.CellFormat(25, 8, fmt.Sprintf("%.2f", p.RemainingCredit), "1", 0, "", false, 0, "")
		pdf.CellFormat(25, 8, fmt.Sprintf("%d", p.DaysLate), "1", 0, "", false, 0, "")
		pdf.CellFormat(25, 8, fmt.Sprintf("%.2f", p.PenaltyAmount), "1", 0, "", false, 0, "")
		pdf.CellFormat(25, 8, fmt.Sprintf("%.2f", p.FinalAmount), "1", 0, "", false, 0, "")
		pdf.Ln(-1)
	}

	// Подписи (в одной строке)
	currentY := pdf.GetY()
	pdf.SetY(currentY + 10)
	pdf.SetFont("Tilda", "", 12)

	// Директор: _____________ Иванов
	pdf.CellFormat(30, 10, "Директор:", "", 0, "", false, 0, "")
	pdf.CellFormat(60, 10, "", "B", 0, "", false, 0, "") // подчёркивание
	pdf.CellFormat(60, 10, "Максим Доровьянович", "", 1, "", false, 0, "")

	// Бухгалтер: _____________ Петров
	pdf.CellFormat(30, 10, "Бухгалтер:", "", 0, "", false, 0, "")
	pdf.CellFormat(60, 10, "", "B", 0, "", false, 0, "")
	pdf.CellFormat(60, 10, "Александр Сергеевич", "", 1, "", false, 0, "")

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, "", err
	}

	filename := fmt.Sprintf("credit-payments-report-%d.pdf", creditID)
	return buf.Bytes(), filename, nil
}

func exportCreditPaymentsToDocx(payments []models.CreditPayment, creditID uint) ([]byte, string, error) {
	doc := document.New()

	// Заголовок
	doc.AddParagraph().AddRun().AddText(fmt.Sprintf("Выплаты по кредиту №%d", creditID))

	// Диапазон дат
	if len(payments) > 0 {
		from := payments[0].PaymentDate.Format("02.01.2006")
		to := payments[len(payments)-1].PaymentDate.Format("02.01.2006")
		doc.AddParagraph().AddRun().AddText(fmt.Sprintf("Период: с %s по %s", from, to))
	}

	// Таблица с границами
	table := doc.AddTable()
	headers := []string{"Дата", "Осн. долг", "Проц.", "Сумма", "Остаток", "Проср.", "Пеня", "Итог"}

	// Заголовки
	headerRow := table.AddRow()
	for _, h := range headers {
		cell := headerRow.AddCell()
		para := cell.AddParagraph()
		para.AddRun().AddText(h)
		setCellBorders(cell) // ✅ применяем границы
	}

	// Данные
	for _, p := range payments {
		row := table.AddRow()

		values := []string{
			p.PaymentDate.Format("2006-01-02"),
			fmt.Sprintf("%.2f", p.PrincipalPart),
			fmt.Sprintf("%.2f", p.InterestPart),
			fmt.Sprintf("%.2f", p.TotalAmount),
			fmt.Sprintf("%.2f", p.RemainingCredit),
			fmt.Sprintf("%d", p.DaysLate),
			fmt.Sprintf("%.2f", p.PenaltyAmount),
			fmt.Sprintf("%.2f", p.FinalAmount),
		}

		for _, val := range values {
			cell := row.AddCell()
			cell.AddParagraph().AddRun().AddText(val)
			setCellBorders(cell) // ✅ границы
		}
	}

	// Отступ перед подписями
	doc.AddParagraph().Properties().Spacing().SetBefore(200)

	// Директор: ________________________ Максим Доровьянович
	dirPara := doc.AddParagraph()
	dirPara.AddRun().AddText("Директор: ")
	dirPara.AddRun().AddText("________________________")
	dirPara.AddRun().AddText(" Максим Доровьянович")

	// Бухгалтер: ________________________ Александр Сергеевич
	accPara := doc.AddParagraph()
	accPara.AddRun().AddText("Бухгалтер: ")
	accPara.AddRun().AddText("________________________")
	accPara.AddRun().AddText(" Александр Сергеевич")

	// Сохраняем
	var buf bytes.Buffer
	if err := doc.Save(&buf); err != nil {
		return nil, "", err
	}
	filename := fmt.Sprintf("credit-payments-report-%d.docx", creditID)
	return buf.Bytes(), filename, nil
}

// Вспомогательная функция для установки границ ячейки
func setCellBorders(cell document.Cell) {
	borders := cell.Properties().Borders()
	borders.SetBottom(wml.ST_BorderSingle, color.Auto, measurement.Zero)
	borders.SetTop(wml.ST_BorderSingle, color.Auto, measurement.Zero)
	borders.SetLeft(wml.ST_BorderSingle, color.Auto, measurement.Zero)
	borders.SetRight(wml.ST_BorderSingle, color.Auto, measurement.Zero)
}
