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

func GenerateProductionReport(db *gorm.DB, from, to time.Time, format string) ([]byte, string, error) {
	var productions []models.ProductProduction
	if err := db.Preload("Product").Preload("Employee").
		Where("production_date BETWEEN ? AND ?", from, to).
		Order("production_date ASC").Find(&productions).Error; err != nil {
		return nil, "", err
	}

	switch format {
	case "xlsx":
		return exportProductionToExcel(productions)
	case "pdf":
		return exportProductionToPDF(productions)
	case "docx":
		return exportProductionToDocx(productions)
	default:
		return nil, "", fmt.Errorf("unsupported format: %s", format)
	}

}

func exportProductionToExcel(productions []models.ProductProduction) ([]byte, string, error) {
	f := excelize.NewFile()
	sheet := "Производство"
	f.SetSheetName("Sheet1", sheet)

	headers := []string{"Дата", "Товар", "Количество", "Сотрудник"}
	for i, h := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		f.SetCellValue(sheet, cell, h)
	}

	for i, prod := range productions {
		row := i + 2
		f.SetCellValue(sheet, fmt.Sprintf("A%d", row), prod.ProductionDate.Format("2006-01-02"))
		f.SetCellValue(sheet, fmt.Sprintf("B%d", row), prod.Product.Name)
		f.SetCellValue(sheet, fmt.Sprintf("C%d", row), prod.Quantity)
		f.SetCellValue(sheet, fmt.Sprintf("D%d", row), prod.Employee.FullName)
	}

	var buf bytes.Buffer
	if err := f.Write(&buf); err != nil {
		return nil, "", err
	}
	filename := fmt.Sprintf("production-report-%s.xlsx", time.Now().Format("20060102-150405"))
	return buf.Bytes(), filename, nil
}

func exportProductionToPDF(productions []models.ProductProduction) ([]byte, string, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddUTF8Font("Tilda", "", "frontend/src/assets/fonts/TildaSans/TildaSans-Regular.ttf")
	pdf.SetFont("Tilda", "", 14)
	pdf.AddPage()
	pdf.Cell(40, 10, "Отчёт по производству")
	pdf.Ln(12)

	headers := []string{"Дата", "Товар", "Количество", "Сотрудник"}
	pdf.SetFont("Tilda", "", 11)
	for _, h := range headers {
		pdf.CellFormat(48, 8, h, "1", 0, "", false, 0, "")
	}
	pdf.Ln(-1)

	pdf.SetFont("Tilda", "", 10)
	for _, p := range productions {
		pdf.CellFormat(48, 8, p.ProductionDate.Format("2006-01-02"), "1", 0, "", false, 0, "")
		pdf.CellFormat(48, 8, p.Product.Name, "1", 0, "", false, 0, "")
		pdf.CellFormat(48, 8, fmt.Sprintf("%.2f", p.Quantity), "1", 0, "", false, 0, "")
		pdf.CellFormat(48, 8, p.Employee.FullName, "1", 0, "", false, 0, "")
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
	filename := fmt.Sprintf("production-report-%s.pdf", time.Now().Format("20060102-150405"))
	return buf.Bytes(), filename, nil
}
func exportProductionToDocx(productions []models.ProductProduction) ([]byte, string, error) {
	doc := document.New()
	doc.AddParagraph().AddRun().AddText("Отчёт по производству")

	table := doc.AddTable()
	headers := []string{"Дата", "Товар", "Количество", "Сотрудник"}

	// Заголовки
	headerRow := table.AddRow()
	for _, h := range headers {
		cell := headerRow.AddCell()
		cellPara := cell.AddParagraph()
		cellPara.AddRun().AddText(h)
	}

	// Данные
	for _, p := range productions {
		row := table.AddRow()
		row.AddCell().AddParagraph().AddRun().AddText(p.ProductionDate.Format("2006-01-02"))
		row.AddCell().AddParagraph().AddRun().AddText(p.Product.Name)
		row.AddCell().AddParagraph().AddRun().AddText(fmt.Sprintf("%.2f", p.Quantity))
		row.AddCell().AddParagraph().AddRun().AddText(p.Employee.FullName)
	}

	var buf bytes.Buffer
	if err := doc.Save(&buf); err != nil {
		return nil, "", err
	}
	filename := fmt.Sprintf("production-report-%s.docx", time.Now().Format("20060102-150405"))
	return buf.Bytes(), filename, nil
}
