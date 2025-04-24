// src/pages/Salary.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, Button, TextField, Select, MenuItem, InputLabel, FormControl,
    Container, Typography, Table, TableHead, TableRow, TableCell,
    TableBody, TableContainer, Paper, CircularProgress, Snackbar,
    Alert, ThemeProvider, createTheme, Tooltip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { theme } from '../theme/theme.jsx';
import PenIcon from "../assets/pen-svgrepo-com.svg";
const inputStyle = {
    input: { color: '#fff' },
    label: { color: '#fff' },
    '& .MuiOutlinedInput-root': {
        '& fieldset': { borderColor: '#555' },
        '&:hover fieldset': { borderColor: '#fff' },
        '&.Mui-focused fieldset': { borderColor: '#646cff' },
        backgroundColor: '#2a2a2a',
    },
};
const selectWhiteStyle = {
    "& label": { color: "#000000" },
    "& label.Mui-focused": { color: "#646cff" },
    "& .MuiOutlinedInput-root": {
        backgroundColor: "none",
        "& fieldset": { borderColor: "#ccc" },
        "&:hover fieldset": { borderColor: "#888" },
        "&.Mui-focused fieldset": { borderColor: "#646cff" },
        "& .MuiSelect-select": { color: "#000000" },
        "& .MuiSvgIcon-root": { color: "#000000" },
    },
};

const tableHeadCellStyle = {
    color: '#fff',
    backgroundColor: '#6F1A07',
    fontSize: '20px',
};

const tableBodyCellStyle = {
    color: '#3d3d3d',
    fontSize: '20px',
    backgroundColor: '#B3B6B7',
};

const glowColorPrimary   = 'rgba(182,186,241,0.24)';
const glowColorSecondary = '#646cff1a';
const glassBorderColor   = 'rgba(87,71,71,0.59)';
const glassTableStyle = {
    backgroundColor: 'rgba(0,0,0,0.05)',
    backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
    boxShadow: `0 0 20px ${glowColorPrimary}, 0 0 60px ${glowColorSecondary}`,
    borderRadius: '12px', border: `1px solid ${glassBorderColor}`, overflow: 'hidden',
};


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

    // load/generate salaries whenever year/month change
    useEffect(() => {
        async function load() {
            if (!year || !month) return;
            setLoading(true);
            try {
                // генерация (игнорируем 409)
                await fetch('/api/generate-salaries', {
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body: JSON.stringify({ year, month })
                });
            } catch(_) {}
            try {
                const res = await fetch(`/api/salaries?year=${year}&month=${month}`);
                if (!res.ok) throw new Error('Ошибка при получении данных');
                const data = await res.json();
                if (data.message) {
                    showSnackbar(data.message, 'info');
                    setSalaries([]);
                } else {
                    setSalaries(data);
                }
            } catch(err) {
                console.error(err);
                showSnackbar(err.message, 'error');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [year, month]);

    // recalc total to pay
    const totalToPay = salaries.reduce((sum, s) => sum + (parseFloat(s.total_salary)||0), 0);

    // handle manual edit of total_salary
    const handleTotalChange = (idx, value) => {
        const updated = [...salaries];
        updated[idx].total_salary = parseFloat(value) || 0;
        setSalaries(updated);
    };

    // issue salaries
    const issueSalaries = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/salaries/issue', {
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body: JSON.stringify({ year, month })
            });
            if (!res.ok) throw new Error('Недостаточно денег в бюджете');
            const data = await res.json();
            showSnackbar(data.message || 'Зарплата успешно выдана', 'success');
            // обновим статусы
            const fresh = await fetch(`/api/salaries?year=${year}&month=${month}`);
            const arr = await fresh.json();
            setSalaries(arr);
        } catch(err) {
            showSnackbar(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

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
                    total_salary: totalSalary
                })
            });
            if (!res.ok) throw new Error('Ошибка при сохранении');
            const data = await res.json();
            showSnackbar(data.message || 'Сумма сохранена', 'success');
        } catch (err) {
            console.error(err);
            showSnackbar(err.message, 'error');
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="xl" sx={{ mt: 5 }}>
                <Typography variant="h4" align="center" gutterBottom color={'#000'}>
                    Выдача зарплаты
                </Typography>

                <Box sx={{ display:'flex', gap:2, mb:3 }}>
                    <FormControl size="small" sx={selectWhiteStyle}>
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

                    <FormControl size="small" sx={selectWhiteStyle}>
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
                                                value={s.total_salary.toFixed(2)}
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
