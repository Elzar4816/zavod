// src/pages/Salary.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, Button, TextField, Select, MenuItem, InputLabel, FormControl,
    Container, Typography, Table, TableHead, TableRow, TableCell,
    TableBody, TableContainer, Paper, CircularProgress, Snackbar,
    Alert, ThemeProvider,  Tooltip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { theme } from '../theme/theme.jsx';
import PenIcon from "../assets/pen-svgrepo-com.svg";
import {
    inputStyle,
    tableHeadCellStyle,
    tableBodyCellStyle,
    glassTableStyle,
    selectWhiteStyleForDropper
} from '../theme/uiStyles.js';
import { useNotifier } from '../hooks/useNotifier';
import { useApi } from '../hooks/useApi';

export default function Salary() {
    const currentYear = new Date().getFullYear();

    const api = useApi(); // ✅ теперь используем универсальный API хук
    const { snackbarProps, alertProps, show } = useNotifier();

    const [year, setYear] = useState(currentYear);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [salaries, setSalaries] = useState([]);
    const [loading, setLoading] = useState(false);

    const allIssued = salaries.length > 0 && salaries.every(s => s.status === true);

    const handleTotalChange = (idx, value) => {
        const updated = [...salaries];
        updated[idx].total_salary = value;
        setSalaries(updated);
    };

// 💡 загрузка и генерация зарплат
    useEffect(() => {
        async function load() {
            if (!year || !month) return;
            setLoading(true);

            try {
                const genRes = await api.post('/api/generate-salaries', { year, month });
                const msg = genRes.message?.toLowerCase() || '';

                if (msg.includes("рассчитаны впервые")) {
                    show("Зарплаты успешно сгенерированы", "success");
                } else if (msg.includes("пересчитаны")) {
                    show("Зарплаты были пересчитаны повторно", "info");
                }

                const salaryData = await api.get(`/api/salaries?year=${year}&month=${month}`);
                setSalaries(salaryData);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [year, month]);

// 💸 выдача зарплат
    const issueSalaries = async () => {
        setLoading(true);
        try {
            await api.post('/api/salaries/issue', { year, month });
            const fresh = await api.get(`/api/salaries?year=${year}&month=${month}`);
            setSalaries(fresh);
            show('Зарплата успешно выдана', 'success');
        } finally {
            setLoading(false);
        }
    };

// 💾 сохранение вручную изменённой суммы
    const handleSave = async (employeeId, totalSalary) => {
        await api.post('/api/salaries/update', {
            employee_id: employeeId,
            year,
            month,
            total_salary: parseFloat(totalSalary) || 0
        });
        show('Сумма сохранена', 'success');
    };

    const totalToPay = salaries.reduce((sum, s) => sum + (parseFloat(s.total_salary) || 0), 0);




    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="xl" sx={{ mt: 5 }}>
                <Typography variant="h4" align="center" gutterBottom color={'#000'}>
                    Выдача зарплаты
                </Typography>

                <Box sx={{ display:'flex', gap:2, mb:3 }}>
                    <FormControl size="small" sx={selectWhiteStyleForDropper}>
                        <InputLabel>Год</InputLabel>
                        <Select
                            value={year}
                            label="Год"
                            onChange={e => setYear(e.target.value)}
                            variant={'outlined'}>
                            {Array.from({length:6},(_,i)=>currentYear-i)
                                .map(y=> <MenuItem key={y} value={y}>{y}</MenuItem>)}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={selectWhiteStyleForDropper}>
                        <InputLabel>Месяц</InputLabel>
                        <Select
                            value={month}
                            label="Месяц"
                            onChange={e => setMonth(e.target.value)}
                            variant={'outlined'}>
                            {[
                                'Январь','Февраль','Март','Апрель','Май','Июнь',
                                'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'
                            ].map((m,i)=>(
                                <MenuItem key={i+1} value={i+1}>{m}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Tooltip title={
                        allIssued
                            ? "Зарплата уже выдана"
                            : "Внимание! Данное действие необратимо!"
                    }
                             placement="right"
                             slotProps={{
                                 tooltip: {
                                     sx: {
                                         fontSize: '14px', // шрифт
                                         padding: '10px 14px', // отступы внутри тултипа
                                         backgroundColor: '#2a2a2a',
                                         color: '#fff',
                                         border: '1px solid #646cff',
                                         borderRadius: '8px',
                                     },
                                 },
                             }}>
                        <span>
                            <Button
                                variant="contained"
                                onClick={issueSalaries}
                                disabled={loading || allIssued}
                            >
                                {loading
                                    ? <CircularProgress size={20} />
                                    : 'Выдать зарплату'}
                            </Button>
                        </span>
                    </Tooltip>
                </Box>

                <TableContainer component={Paper} sx={glassTableStyle}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {[
                                    'ФИО', 'Оклад', 'Закупка', 'Произв.', 'Продажа',
                                    'Участий', 'Бонус', 'К выдаче', 'Выдано'
                                ].map((h, idx) => (
                                    <TableCell key={idx} sx={tableHeadCellStyle}>
                                        {h}
                                    </TableCell>
                                ))}
                                {!allIssued && (
                                    <TableCell sx={tableHeadCellStyle}>Действия</TableCell>
                                )}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {salaries.map((s, idx)=>(
                                <TableRow key={s.id}>
                                    <TableCell sx={tableBodyCellStyle}>{s.employee.full_name}</TableCell>
                                    <TableCell sx={tableBodyCellStyle}>{s.employee.salary}</TableCell>
                                    <TableCell sx={tableBodyCellStyle}>{s.purchase_count}</TableCell>
                                    <TableCell sx={tableBodyCellStyle}>{s.production_count}</TableCell>
                                    <TableCell sx={tableBodyCellStyle}>{s.sale_count}</TableCell>
                                    <TableCell sx={tableBodyCellStyle}>{s.total_participation}</TableCell>
                                    <TableCell sx={tableBodyCellStyle}>{s.bonus.toFixed(2)}</TableCell>
                                    <TableCell sx={tableBodyCellStyle}>
                                        {s.status ? (
                                            <Typography sx={tableBodyCellStyle}>
                                                {s.total_salary.toFixed(2)}
                                            </Typography>
                                        ) : (
                                            <TextField
                                                type="number"
                                                size="small"
                                                value={s.total_salary !== null && s.total_salary !== undefined ? String(s.total_salary) : ""}
                                                onChange={e => handleTotalChange(idx, e.target.value)}
                                                sx={inputStyle}
                                                inputProps={{ step:"0.01" }}
                                            />

                                        )}
                                    </TableCell>
                                    <TableCell sx={tableBodyCellStyle} align="center">
                                        {s.status
                                            ? <CheckCircleIcon fontSize="small" color="success"/>
                                            : <CancelIcon fontSize="small" color="error"/>}
                                    </TableCell>
                                    {!allIssued && (
                                        <TableCell sx={tableBodyCellStyle} align="center">
                                            <Tooltip title="Редактировать" placement="top" slotProps={{
                                                tooltip: { sx: { fontSize:14,p:"10px 14px",bgcolor:"#2a2a2a",color:"#fff",border:"1px solid #646cff",borderRadius:1 }}
                                            }}>
                                                <Button
                                                    size="small"
                                                    sx={{ minWidth:0, mr:1 }}
                                                    onClick={() => handleSave(s.employee.id, s.total_salary)}
                                                >
                                                    <img src={PenIcon} alt="Ред." width={20} height={20}/>
                                                </Button>
                                            </Tooltip>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ mt:2, textAlign:'right' }}>
                    <Typography variant="h6" color={'#000'}>
                        Итого к выдаче: {totalToPay.toFixed(2)} руб.
                    </Typography>
                </Box>

                <Snackbar
                    open={snackbarProps.open}
                    onClose={snackbarProps.onClose}
                    autoHideDuration={snackbarProps.autoHideDuration}
                    anchorOrigin={snackbarProps.anchorOrigin}
                >
                    <Alert
                        severity={alertProps.severity}
                        sx={alertProps.sx}
                        onClose={snackbarProps.onClose}
                    >
                        {alertProps.children}
                    </Alert>
                </Snackbar>


            </Container>
        </ThemeProvider>
    );
}
