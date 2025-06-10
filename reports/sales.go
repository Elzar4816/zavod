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

func GenerateSalesReport(db *gorm.DB, from, to time.Time, format string) ([]byte, string, error) {
	var sales []models.ProductSale
	if err := db.Preload("Product").Preload("Employee").
		Where("sale_date BETWEEN ? AND ?", from, to).
		Order("sale_date ASC").
		Find(&sales).Error; err != nil {
		return nil, "", err
	}

	switch format {
	case "xlsx":
		return exportSalesToExcel(sales)
	case "pdf":
		return exportSalesToPDF(sales)
	case "docx":
		return exportSalesToDocx(sales)
	default:
		return nil, "", fmt.Errorf("неподдерживаемый формат: %s", format)
	}
}

func exportSalesToExcel(sales []models.ProductSale) ([]byte, string, error) {
	f := excelize.NewFile()
	sheet := "Продажи"
	f.SetSheetName("Sheet1", sheet)

	headers := []string{"Дата", "Товар", "Кол-во", "Сумма", "Сотрудник"}
	for i, h := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		f.SetCellValue(sheet, cell, h)
	}

	for i, sale := range sales {
		row := i + 2
		f.SetCellValue(sheet, fmt.Sprintf("A%d", row), sale.SaleDate.Format("2006-01-02"))
		f.SetCellValue(sheet, fmt.Sprintf("B%d", row), sale.Product.Name)
		f.SetCellValue(sheet, fmt.Sprintf("C%d", row), sale.Quantity)
		f.SetCellValue(sheet, fmt.Sprintf("D%d", row), sale.TotalAmount)
		f.SetCellValue(sheet, fmt.Sprintf("E%d", row), sale.Employee.FullName)
	}

	var buf bytes.Buffer
	if err := f.Write(&buf); err != nil {
		return nil, "", err
	}
	filename := fmt.Sprintf("sales-report-%s.xlsx", time.Now().Format("20060102-150405"))
	return buf.Bytes(), filename, nil
}

func exportSalesToPDF(sales []models.ProductSale) ([]byte, string, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")

	//fontPath := filepath.Join("src", "assets", "fonts", "TildaSans", "TildaSans_Regular.ttf")
	pdf.AddUTF8Font("Tilda", "", "frontend/src/assets/fonts/TildaSans/TildaSans-Regular.ttf")

	pdf.SetFont("Tilda", "", 14)

	// ✅ Проверка на ошибку после установки шрифта
	if !pdf.Ok() {
		err := pdf.Error()
		fmt.Println("Ошибка подключения шрифта:", err)
		return nil, "", err
	}

	pdf.AddPage()
	pdf.Cell(40, 10, "Отчёт по продажам")
	pdf.Ln(12)

	headers := []string{"Дата", "Товар", "Кол-во", "Сумма", "Сотрудник"}
	pdf.SetFont("Tilda", "", 11)
	for _, h := range headers {
		pdf.CellFormat(40, 8, h, "1", 0, "", false, 0, "")
	}
	pdf.Ln(-1)

	pdf.SetFont("Tilda", "", 10)
	for _, sale := range sales {
		pdf.CellFormat(40, 8, sale.SaleDate.Format("2006-01-02"), "1", 0, "", false, 0, "")
		pdf.CellFormat(40, 8, sale.Product.Name, "1", 0, "", false, 0, "")
		pdf.CellFormat(40, 8, fmt.Sprintf("%.2f", sale.Quantity), "1", 0, "", false, 0, "")
		pdf.CellFormat(40, 8, fmt.Sprintf("%.2f", sale.TotalAmount), "1", 0, "", false, 0, "")
		pdf.CellFormat(40, 8, sale.Employee.FullName, "1", 0, "", false, 0, "")
		pdf.Ln(-1)
	}
	// Добавление подписи сразу под таблицей
	currentY := pdf.GetY()
	pdf.SetY(currentY + 10)
	pdf.SetFont("Tilda", "", 12)
	pdf.CellFormat(60, 10, "", "B", 0, "", false, 0, "") // подчеркивание
	pdf.CellFormat(60, 10, "Подпись директора:", "", 0, "", false, 0, "")

	if !pdf.Ok() {
		err := pdf.Error()
		fmt.Println("Ошибка после генерации PDF:", err)
		return nil, "", err
	}

	var buf bytes.Buffer
	err := pdf.Output(&buf)
	if err != nil {
		fmt.Println("Ошибка при выводе PDF:", err)
		return nil, "", err
	}

	filename := fmt.Sprintf("sales-report-%s.pdf", time.Now().Format("20060102-150405"))
	return buf.Bytes(), filename, nil
}

func exportSalesToDocx(sales []models.ProductSale) ([]byte, string, error) {
	doc := document.New()
	doc.AddParagraph().AddRun().AddText("Отчёт по продажам")

	table := doc.AddTable()

	// Заголовки
	headers := []string{"Дата", "Товар", "Кол-во", "Сумма", "Сотрудник"}
	headerRow := table.AddRow()
	for _, h := range headers {
		cell := headerRow.AddCell()
		cellPara := cell.AddParagraph()
		cellPara.AddRun().AddText(h)
	}

	// Данные
	for _, sale := range sales {
		row := table.AddRow()

		row.AddCell().AddParagraph().AddRun().AddText(sale.SaleDate.Format("2006-01-02"))
		row.AddCell().AddParagraph().AddRun().AddText(sale.Product.Name)
		row.AddCell().AddParagraph().AddRun().AddText(fmt.Sprintf("%.2f", sale.Quantity))
		row.AddCell().AddParagraph().AddRun().AddText(fmt.Sprintf("%.2f", sale.TotalAmount))
		row.AddCell().AddParagraph().AddRun().AddText(sale.Employee.FullName)
	}

	var buf bytes.Buffer
	if err := doc.Save(&buf); err != nil {
		return nil, "", err
	}
	filename := fmt.Sprintf("sales-report-%s.docx", time.Now().Format("20060102-150405"))
	return buf.Bytes(), filename, nil
}
