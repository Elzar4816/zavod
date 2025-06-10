package reports

import (
	"baliance.com/gooxml/document"
	"bytes"
	"fmt"
	"github.com/jung-kurt/gofpdf"
	"github.com/xuri/excelize/v2"
	"gorm.io/gorm"
	"time"
	"zavod/models"
)

func GeneratePurchaseReport(db *gorm.DB, from, to time.Time, format string) ([]byte, string, error) {
	var purchases []models.RawMaterialPurchase
	if err := db.Preload("RawMaterial").Preload("Employee").
		Where("purchase_date >= ? AND purchase_date < ?", from, to.AddDate(0, 0, 1)).
		Order("purchase_date ASC").
		Find(&purchases).Error; err != nil {
		return nil, "", err
	}

	switch format {
	case "xlsx":
		return exportPurchasesToExcel(purchases)
	case "pdf":
		return exportPurchasesToPDF(purchases)
	case "docx":
		return exportPurchasesToDocx(purchases)
	default:
		return nil, "", fmt.Errorf("unsupported format: %s", format)
	}
}
func exportPurchasesToExcel(purchases []models.RawMaterialPurchase) ([]byte, string, error) {
	f := excelize.NewFile()
	sheet := "Закупки"
	f.SetSheetName("Sheet1", sheet)

	headers := []string{"Дата", "Сырьё", "Кол-во", "Сумма", "Сотрудник"}
	for i, h := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		f.SetCellValue(sheet, cell, h)
	}

	for i, p := range purchases {
		row := i + 2
		f.SetCellValue(sheet, fmt.Sprintf("A%d", row), p.PurchaseDate.Format("2006-01-02"))
		f.SetCellValue(sheet, fmt.Sprintf("B%d", row), p.RawMaterial.Name)
		f.SetCellValue(sheet, fmt.Sprintf("C%d", row), p.Quantity)
		f.SetCellValue(sheet, fmt.Sprintf("D%d", row), p.TotalAmount)
		f.SetCellValue(sheet, fmt.Sprintf("E%d", row), p.Employee.FullName)
	}

	var buf bytes.Buffer
	if err := f.Write(&buf); err != nil {
		return nil, "", err
	}
	filename := fmt.Sprintf("purchase-report-%s.xlsx", time.Now().Format("20060102-150405"))
	return buf.Bytes(), filename, nil
}
func exportPurchasesToPDF(purchases []models.RawMaterialPurchase) ([]byte, string, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddUTF8Font("Tilda", "", "frontend/src/assets/fonts/TildaSans/TildaSans-Regular.ttf")
	pdf.SetFont("Tilda", "", 14)
	pdf.AddPage()
	pdf.Cell(40, 10, "Отчёт по закупке сырья")
	pdf.Ln(12)

	headers := []string{"Дата", "Сырьё", "Кол-во", "Сумма", "Сотрудник"}
	pdf.SetFont("Tilda", "", 11)
	for _, h := range headers {
		pdf.CellFormat(40, 8, h, "1", 0, "", false, 0, "")
	}
	pdf.Ln(-1)

	pdf.SetFont("Tilda", "", 10)
	for _, p := range purchases {
		pdf.CellFormat(40, 8, p.PurchaseDate.Format("2006-01-02"), "1", 0, "", false, 0, "")
		pdf.CellFormat(40, 8, p.RawMaterial.Name, "1", 0, "", false, 0, "")
		pdf.CellFormat(40, 8, fmt.Sprintf("%.2f", p.Quantity), "1", 0, "", false, 0, "")
		pdf.CellFormat(40, 8, fmt.Sprintf("%.2f", p.TotalAmount), "1", 0, "", false, 0, "")
		pdf.CellFormat(40, 8, p.Employee.FullName, "1", 0, "", false, 0, "")
		pdf.Ln(-1)
	}
	// Добавление подписи сразу под таблицей
	currentY := pdf.GetY()
	pdf.SetY(currentY + 10)
	pdf.SetFont("Tilda", "", 12)
	pdf.CellFormat(60, 10, "", "B", 0, "", false, 0, "") // подчеркивание
	pdf.CellFormat(60, 10, "Подпись директора:", "", 0, "", false, 0, "")

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, "", err
	}
	filename := fmt.Sprintf("purchase-report-%s.pdf", time.Now().Format("20060102-150405"))
	return buf.Bytes(), filename, nil
}
func exportPurchasesToDocx(purchases []models.RawMaterialPurchase) ([]byte, string, error) {
	doc := document.New()
	doc.AddParagraph().AddRun().AddText("Отчёт по закупке сырья")

	table := doc.AddTable()
	headers := []string{"Дата", "Сырьё", "Кол-во", "Сумма", "Сотрудник"}

	headerRow := table.AddRow()
	for _, h := range headers {
		cell := headerRow.AddCell()
		cell.AddParagraph().AddRun().AddText(h)
	}

	for _, p := range purchases {
		row := table.AddRow()
		row.AddCell().AddParagraph().AddRun().AddText(p.PurchaseDate.Format("2006-01-02"))
		row.AddCell().AddParagraph().AddRun().AddText(p.RawMaterial.Name)
		row.AddCell().AddParagraph().AddRun().AddText(fmt.Sprintf("%.2f", p.Quantity))
		row.AddCell().AddParagraph().AddRun().AddText(fmt.Sprintf("%.2f", p.TotalAmount))
		row.AddCell().AddParagraph().AddRun().AddText(p.Employee.FullName)
	}

	var buf bytes.Buffer
	if err := doc.Save(&buf); err != nil {
		return nil, "", err
	}
	filename := fmt.Sprintf("purchase-report-%s.docx", time.Now().Format("20060102-150405"))
	return buf.Bytes(), filename, nil
}
