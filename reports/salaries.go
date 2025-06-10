package reports

import (
	"baliance.com/gooxml/document"
	"bytes"
	"fmt"
	"github.com/jung-kurt/gofpdf"
	"github.com/xuri/excelize/v2"
	"gorm.io/gorm"
	"zavod/models"
)

func GenerateSalaryReport(db *gorm.DB, year, month int, format string) ([]byte, string, error) {
	var salaries []models.Salary
	if err := db.Preload("Employee").
		Where("year = ? AND month = ?", year, month).
		Order("employee_id").
		Find(&salaries).Error; err != nil {
		return nil, "", err
	}

	switch format {
	case "xlsx":
		return exportSalariesToExcel(salaries, year, month)
	case "pdf":
		return exportSalariesToPDF(salaries, year, month)
	case "docx":
		return exportSalariesToDocx(salaries, year, month)
	default:
		return nil, "", fmt.Errorf("неподдерживаемый формат: %s", format)
	}
}

func exportSalariesToExcel(salaries []models.Salary, year, month int) ([]byte, string, error) {
	f := excelize.NewFile()
	sheet := "Зарплаты"
	f.SetSheetName("Sheet1", sheet)

	headers := []string{"Сотрудник", "Год", "Месяц", "Продажи", "Закупки", "Производства", "Бонус", "Итог", "Выдана"}
	for i, h := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		f.SetCellValue(sheet, cell, h)
	}

	for i, s := range salaries {
		row := i + 2
		f.SetCellValue(sheet, fmt.Sprintf("A%d", row), s.Employee.FullName)
		f.SetCellValue(sheet, fmt.Sprintf("B%d", row), s.Year)
		f.SetCellValue(sheet, fmt.Sprintf("C%d", row), s.Month)
		f.SetCellValue(sheet, fmt.Sprintf("D%d", row), s.SaleCount)
		f.SetCellValue(sheet, fmt.Sprintf("E%d", row), s.PurchaseCount)
		f.SetCellValue(sheet, fmt.Sprintf("F%d", row), s.ProductionCount)
		f.SetCellValue(sheet, fmt.Sprintf("G%d", row), s.Bonus)
		f.SetCellValue(sheet, fmt.Sprintf("H%d", row), s.TotalSalary)
		f.SetCellValue(sheet, fmt.Sprintf("I%d", row), map[bool]string{true: "Да", false: "Нет"}[s.Status])
	}

	var buf bytes.Buffer
	if err := f.Write(&buf); err != nil {
		return nil, "", err
	}
	filename := fmt.Sprintf("salary-report-%d-%02d.xlsx", year, month)
	return buf.Bytes(), filename, nil
}

func exportSalariesToPDF(salaries []models.Salary, year, month int) ([]byte, string, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddUTF8Font("Tilda", "", "frontend/src/assets/fonts/TildaSans/TildaSans-Regular.ttf")
	pdf.SetFont("Tilda", "", 14)

	if !pdf.Ok() {
		err := pdf.Error()
		fmt.Println("Ошибка подключения шрифта:", err)
		return nil, "", err
	}

	pdf.AddPage()
	title := fmt.Sprintf("Зарплаты за %02d.%d", month, year)
	pdf.Cell(40, 10, title)
	pdf.Ln(12)

	headers := []string{"Сотрудник", "Продажи", "Закупки", "Производства", "Бонус", "Итог", "Выдана"}
	widths := []float64{50, 20, 20, 30, 25, 25, 20}

	pdf.SetFont("Tilda", "", 11)
	for i, h := range headers {
		pdf.CellFormat(widths[i], 8, h, "1", 0, "", false, 0, "")
	}
	pdf.Ln(-1)

	pdf.SetFont("Tilda", "", 10)
	for _, s := range salaries {
		cells := []string{
			s.Employee.FullName,
			fmt.Sprintf("%d", s.SaleCount),
			fmt.Sprintf("%d", s.PurchaseCount),
			fmt.Sprintf("%d", s.ProductionCount),
			fmt.Sprintf("%.2f", s.Bonus),
			fmt.Sprintf("%.2f", s.TotalSalary),
			map[bool]string{true: "Да", false: "Нет"}[s.Status],
		}
		for i, val := range cells {
			pdf.CellFormat(widths[i], 8, val, "1", 0, "", false, 0, "")
		}
		pdf.Ln(-1)
	}
	// Получаем текущую вертикальную позицию после таблицы
	currentY := pdf.GetY()
	pdf.SetY(currentY + 10) // небольшой отступ после таблицы

	pdf.SetFont("Tilda", "", 12)
	pdf.CellFormat(60, 10, "", "B", 0, "", false, 0, "") // подчёркнутая линия
	pdf.CellFormat(60, 10, "Подпись директора:", "", 0, "", false, 0, "")

	if !pdf.Ok() {
		err := pdf.Error()
		fmt.Println("Ошибка PDF:", err)
		return nil, "", err
	}

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		fmt.Println("Ошибка при выводе PDF:", err)
		return nil, "", err
	}

	filename := fmt.Sprintf("salary-report-%d-%02d.pdf", year, month)
	return buf.Bytes(), filename, nil
}

func exportSalariesToDocx(salaries []models.Salary, year, month int) ([]byte, string, error) {
	doc := document.New()
	doc.AddParagraph().AddRun().AddText(fmt.Sprintf("Зарплаты за %02d.%d", month, year))

	table := doc.AddTable()

	headers := []string{"Сотрудник", "Продажи", "Закупки", "Производства", "Бонус", "Итог", "Выдана"}
	headerRow := table.AddRow()
	for _, h := range headers {
		cell := headerRow.AddCell()
		cell.AddParagraph().AddRun().AddText(h)
	}

	for _, s := range salaries {
		row := table.AddRow()
		row.AddCell().AddParagraph().AddRun().AddText(s.Employee.FullName)
		row.AddCell().AddParagraph().AddRun().AddText(fmt.Sprintf("%d", s.SaleCount))
		row.AddCell().AddParagraph().AddRun().AddText(fmt.Sprintf("%d", s.PurchaseCount))
		row.AddCell().AddParagraph().AddRun().AddText(fmt.Sprintf("%d", s.ProductionCount))
		row.AddCell().AddParagraph().AddRun().AddText(fmt.Sprintf("%.2f", s.Bonus))
		row.AddCell().AddParagraph().AddRun().AddText(fmt.Sprintf("%.2f", s.TotalSalary))
		row.AddCell().AddParagraph().AddRun().AddText(map[bool]string{true: "Да", false: "Нет"}[s.Status])
	}

	var buf bytes.Buffer
	if err := doc.Save(&buf); err != nil {
		return nil, "", err
	}
	filename := fmt.Sprintf("salary-report-%d-%02d.docx", year, month)
	return buf.Bytes(), filename, nil
}
