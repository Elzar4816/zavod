// src/pages/Salary.jsx
import axios from 'axios';
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

export default function Salary() {
    const currentYear = new Date().getFullYear();

    // form state
    const [year, setYear]   = useState(currentYear);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [salaries, setSalaries] = useState([]);
    const [loading, setLoading]   = useState(false);

    // snackbar
    const [snackbarOpen, setSnackbarOpen]     = useState(false);
    const [snackbarMsg, setSnackbarMsg]       = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const showSnackbar = (msg, sev='success') => {
        setSnackbarMsg(msg); setSnackbarSeverity(sev); setSnackbarOpen(true);
    };

    // определяем, все ли уже выданы
    const allIssued = salaries.length > 0 && salaries.every(s => s.status === true);


    function parseError(err) {
        try {
            const error = err?.response?.data?.error || err?.message || err;
            if (typeof error === "string") return error;
            if (typeof error === "object") return error.message || JSON.stringify(error);
            return "Неизвестная ошибка";
        } catch (e) {
            return "Ошибка парсинга";
        }
    }

    const handleTotalChange = (idx, value) => {
        const updated = [...salaries];
        updated[idx].total_salary = value; // сохраняем строку (или пустую)
        setSalaries(updated);
    };

    // load/generate salaries whenever year/month change
    useEffect(() => {
        async function load() {
            if (!year || !month) return;
            setLoading(true);

            try {
                const genRes = await axios.post('/api/generate-salaries', { year, month });
                const msg = genRes.data.message?.toLowerCase() || "";

                if (msg.includes("рассчитаны впервые")) {
                    showSnackbar("Зарплаты успешно сгенерированы", "success");
                } else if (msg.includes("пересчитаны")) {
                    showSnackbar("Зарплаты были пересчитаны повторно", "info");
                }

            } catch (err) {
                showSnackbar(parseError(err), "error");
            }

            try {
                const res = await axios.get(`/api/salaries?year=${year}&month=${month}`);
                setSalaries(res.data);
            } catch (err) {
                showSnackbar(parseError(err), "error");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [year, month]);


// issue salaries
    const issueSalaries = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/salaries/issue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ year, month })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data?.error?.message || 'Ошибка при выдаче зарплат');

            showSnackbar(data.message || 'Зарплата успешно выдана', 'success');

            const fresh = await fetch(`/api/salaries?year=${year}&month=${month}`);
            const arr = await fresh.json();
            setSalaries(arr);
        } catch (err) {
            showSnackbar(parseError(err), 'error');
        } finally {
            setLoading(false);
        }
    };


    const totalToPay = salaries.reduce((sum, s) => sum + (parseFloat(s.total_salary)||0), 0);

// сохраняет измененную зарплату по сотруднику
    const handleSave = async (employeeId, totalSalary) => {
        try {
            const res = await fetch('/api/salaries/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employee_id: employeeId,
                    year,
                    month,
                    total_salary: parseFloat(totalSalary) || 0
                })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data?.error?.message || 'Ошибка при сохранении');

            showSnackbar(data.message || 'Сумма сохранена', 'success');
        } catch (err) {
            showSnackbar(parseError(err), 'error');
        }
    };



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
                                {['ФИО','Оклад','Закупка','Произв.','Продажа','Участий','Бонус','К выдаче','Выдано']
                                    .map(h=> <TableCell key={h} sx={tableHeadCellStyle}>{h}</TableCell>)}
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
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={()=>setSnackbarOpen(false)}
                    anchorOrigin={{ vertical:'bottom', horizontal:'center' }}
                >
                    <Alert
                        onClose={()=>setSnackbarOpen(false)}
                        severity={snackbarSeverity}
                        sx={{ width:'100%' }}
                    >
                        {snackbarMsg}
                    </Alert>
                </Snackbar>
            </Container>
        </ThemeProvider>
    );
}
