import React, { useState } from "react";
import {
    Box, Button, MenuItem, TextField, Typography, Paper, Table, TableHead,
    TableRow, TableCell, TableBody
} from "@mui/material";

const ReportPage = () => {
    const [type, setType] = useState("sales");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [creditId, setCreditId] = useState("");
    const [format, setFormat] = useState("xlsx");
    const [data, setData] = useState([]);

    const handleDownload = async () => {
        let url = "";
        if (type === "sales") {
            if (!from || !to) return alert("Выберите даты");
            url = `/api/report/sales?from=${from}&to=${to}&format=${format}`;
        } else if (type === "salaries") {
            url = `/api/report/salaries?year=${year}&month=${month}&format=${format}`;
        } else if (type === "credit-payments") {
            if (!creditId) return alert("Укажите ID кредита");
            url = `/api/report/credit-payments?credit_id=${creditId}&format=${format}`;
        }else if (type === "productions") {
            if (!from || !to) return alert("Выберите даты");
            url = `/api/report/productions?from=${from}&to=${to}&format=${format}`;
        }else if (type === "purchases") {
            if (!from || !to) return alert("Выберите даты");
            url = `/api/report/purchases?from=${from}&to=${to}&format=${format}`;
        }



        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) return alert("Ошибка при загрузке отчёта");

        const blob = await res.blob();
        const a = document.createElement("a");
        a.href = window.URL.createObjectURL(blob);
        a.download = `${type}-report.${format}`;
        a.click();
        window.URL.revokeObjectURL(a.href);
    };

    const HEADERS_MAP = {
        sales: {
            id: "ID",
            product_id: "ID товара",
            product: "Товар",
            quantity: "Кол-во",
            total_amount: "Сумма",
            sale_date: "Дата продажи",
            employee_id: "ID сотрудника",
            employee: "Сотрудник"
        },
        salaries: {
            id: "ID",
            employee_id: "ID сотрудника",
            employee: "Сотрудник",
            year: "Год",
            month: "Месяц",
            purchase_count: "Закупки",
            production_count: "Производства",
            sale_count: "Продажи",
            total_participation: "Итого участие",
            bonus: "Бонус",
            total_salary: "Итоговая з/п",
            status: "Выдана"
        },
        "credit-payments": {
            id: "ID",
            credit_id: "ID кредита",
            payment_date: "Дата",
            principal_part: "Осн. долг",
            interest_part: "Проценты",
            total_amount: "Сумма",
            remaining_credit: "Остаток",
            days_late: "Дни просрочки",
            penalty_amount: "Пеня",
            final_amount: "Итог"
        },
        productions: {
            id: "ID",
            production_date: "Дата",
            product_id: "ID товара",
            product: "Товар",
            quantity: "К    ол-во",
            employee_id: "ID сотрудника",
            employee: "Сотрудник"
        },
        purchases: {
            id: "ID",
            raw_material_id: "ID сырья",
            raw_material: "Сырьё",
            quantity: "Кол-во",
            total_amount: "Сумма",
            purchase_date: "Дата закупки",
            employee_id: "ID сотрудника",
            employee: "Сотрудник"
        }


    };

    const handlePreview = async () => {
        let url = "";
        if (type === "sales") {
            if (!from || !to) return alert("Выберите даты");
            url = `/api/sales?from=${from}&to=${to}`;
        } else if (type === "salaries") {
            url = `/api/salaries?year=${year}&month=${month}`;
        } else if (type === "credit-payments") {
            if (!creditId) return alert("Укажите ID кредита");
            url = `/api/credits/${creditId}/payments`;
        }else if (type === "productions") {
            if (!from || !to) return alert("Выберите даты");
            url = `/api/productions?from=${from}&to=${to}`;
        }else if (type === "purchases") {
            if (!from || !to) return alert("Выберите даты");
            url = `/api/purchases?from=${from}&to=${to}`;
        }



        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) return alert("Ошибка при получении данных");
        const json = await res.json();
        setData(json);
    };

    return (
        <Box sx={{ width: "100%", px: 3, mt: 5, display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography variant="h5">Генерация отчёта</Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                <TextField
                    label="Тип"
                    select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    sx={{ minWidth: 180 }}
                >
                    <MenuItem value="sales">Продажи</MenuItem>
                    <MenuItem value="salaries">Зарплаты</MenuItem>
                    <MenuItem value="credit-payments">Выплаты по кредиту</MenuItem>
                    <MenuItem value="productions">Производство</MenuItem>
                    <MenuItem value="purchases">Закупки сырья</MenuItem>
                </TextField>

                {/* Блок для дат (sales, productions, purchases) */}
                {["sales", "productions", "purchases"].includes(type) && (
                    <>
                        <TextField
                            label="Дата с"
                            type="date"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label="Дата по"
                            type="date"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </>
                )}

                {/* Блок для зарплат */}
                {type === "salaries" && (
                    <>
                        <TextField
                            label="Год"
                            select
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            sx={{ minWidth: 100 }}
                        >
                            {[2025, 2024, 2023, 2022, 2021, 2020].map(y => (
                                <MenuItem key={y} value={y}>{y}</MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Месяц"
                            select
                            value={month}
                            onChange={(e) => setMonth(Number(e.target.value))}
                            sx={{ minWidth: 140 }}
                        >
                            {[
                                "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
                                "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
                            ].map((name, index) => (
                                <MenuItem key={index + 1} value={index + 1}>{name}</MenuItem>
                            ))}
                        </TextField>
                    </>
                )}

                {/* Блок для ID кредита */}
                {type === "credit-payments" && (
                    <TextField
                        label="ID кредита"
                        value={creditId}
                        onChange={(e) => setCreditId(e.target.value)}
                        sx={{ minWidth: 150 }}
                    />
                )}

                {/* Формат */}
                <TextField
                    label="Формат"
                    select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    sx={{ minWidth: 140 }}
                >
                    <MenuItem value="xlsx">Excel</MenuItem>
                    <MenuItem value="pdf">PDF</MenuItem>
                    <MenuItem value="docx">Word</MenuItem>
                </TextField>

                <Button variant="outlined" onClick={handlePreview}>
                    Показать
                </Button>
                <Button variant="contained" onClick={handleDownload}>
                    Скачать
                </Button>
            </Box>


            {data.length > 0 && (
                <Paper sx={{ width: "100%" }}>
                    <Table sx={{ width: "100%" }}>
                        <TableHead>
                            <TableRow>
                                {Object.keys(data[0])
                                    .filter(key => key !== "CreatedAt" && key !== "UpdatedAt")
                                    .map((key) => (
                                        <TableCell
                                            key={key}
                                            sx={{
                                                whiteSpace: "nowrap",
                                                fontWeight: 600
                                            }}
                                        >
                                            {HEADERS_MAP[type]?.[key] || key}
                                        </TableCell>
                                    ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {data.map((row, idx) => (
                                <TableRow key={idx}>
                                    {Object.entries(row)
                                        .filter(([key]) => key !== "CreatedAt" && key !== "UpdatedAt")
                                        .map(([key, value], i) => (
                                            <TableCell key={i}>
                                                {typeof value === "object" && value !== null
                                                    ? value.full_name || value.name || "[объект]"
                                                    : String(value)}
                                            </TableCell>
                                        ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            )}
        </Box>
    );
};

export default ReportPage;
