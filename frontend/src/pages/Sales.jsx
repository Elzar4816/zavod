import React, { useState, useEffect } from 'react';
import {
    Box, Button, TextField, MenuItem,
    Typography, Table, TableHead, TableRow, TableCell,
    TableBody, TableContainer, Paper, CircularProgress,
    Tooltip, Snackbar, Alert, ThemeProvider,
    Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { theme } from '../theme/theme.jsx';
import PlusIcon from '../assets/plus-svgrepo-com.svg';
import axios from "axios";
import {
    inputStyle,
    selectWhiteStyle,
    tableHeadCellStyle,
    tableBodyCellStyle,
    glassTableStyle
} from '../theme/uiStyles.js';


export default function SalesPage() {
    const [form, setForm] = useState({
        product_id: '',
        quantity: '',
        employee_id: '',
        sale_date: new Date().toISOString().slice(0, 16),
    });
    const [products, setProducts] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const showSnackbar = (msg, sev = 'success') => {
        setSnackbarMsg(msg);
        setSnackbarSeverity(sev);
        setSnackbarOpen(true);
    };

    function parseError(err) {
        const error = err?.response?.data?.error;
        if (typeof error === "string") return error;
        if (typeof error === "object") return error.message || JSON.stringify(error);
        return err.message || "Неизвестная ошибка";
    }
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [pRes, eRes, sRes] = await Promise.all([
                axios.get('/api/finished-goods'),
                axios.get('/api/employees'),
                axios.get('/api/sales'),
            ]);
            setProducts(pRes.data);
            setEmployees(eRes.data);
            setSales(sRes.data);
        } catch (err) {
            showSnackbar("Ошибка загрузки данных: " + parseError(err), "error");
        } finally {
            setLoading(false);
        }
    };


    const handleFormSubmit = async e => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            product_id: Number(form.product_id),
            quantity: parseFloat(form.quantity),
            sale_date: new Date(form.sale_date).toISOString(),
            employee_id: Number(form.employee_id),
        };

        try {
            const res = await axios.post('/api/sale_product', payload);
            showSnackbar(res.data?.message || "Успешно продано");
            setCreateOpen(false);
            setForm({
                product_id: '',
                quantity: '',
                employee_id: '',
                sale_date: new Date().toISOString().slice(0, 16),
            });
            await loadData();
        } catch (err) {
            showSnackbar("Ошибка: " + parseError(err), "error");
        } finally {
            setLoading(false);
        }
    };


    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ color: '#ffffff', pt:5,pl:5 }}>
                {/* Заголовок */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" color="#000">Продажи</Typography>
                </Box>

                {/* Диалог «Продать» */}
                <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle sx={{ bgcolor: '#1e1e1e', color: '#fff' }}>Продать</DialogTitle>
                    <DialogContent sx={{ bgcolor: '#1e1e1e', color: '#fff' }}>
                        <TextField
                            select fullWidth margin="dense" label="Продукт"
                            value={form.product_id}
                            onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))}
                            required sx={selectWhiteStyle}
                        >
                            <MenuItem value="">-- Выберите продукт --</MenuItem>
                            {products.map(p => (
                                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Количество" type="number"
                            fullWidth margin="dense"
                            value={form.quantity}
                            onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                            required sx={inputStyle}
                        />

                        <TextField
                            select fullWidth margin="dense" label="Сотрудник"
                            value={form.employee_id}
                            onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))}
                            required sx={selectWhiteStyle}
                        >
                            <MenuItem value="">-- Выберите сотрудника --</MenuItem>
                            {employees.map(emp => (
                                <MenuItem key={emp.id} value={emp.id}>{emp.full_name}</MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Дата продажи"
                            type="datetime-local"
                            fullWidth margin="dense"
                            value={form.sale_date}
                            onChange={e => setForm(f => ({ ...f, sale_date: e.target.value }))}
                            InputLabelProps={{ shrink: true }}
                            required sx={inputStyle}
                        />
                    </DialogContent>
                    <DialogActions sx={{ bgcolor: '#1e1e1e' }}>
                        <Button onClick={() => setCreateOpen(false)}>Отмена</Button>
                        <Button onClick={handleFormSubmit} variant="contained" disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : 'Продать'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Заголовок истории + кнопка */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 5, mb: 2 }}>
                    <Typography variant="h6" color="#000">История продаж</Typography>
                    <Tooltip title="Продать" placement="right" slotProps={{
                        tooltip: { sx: { fontSize: '14px', p: '10px 14px', bgcolor: '#2a2a2a', color: '#fff', border: '1px solid #646cff', borderRadius: '8px' } }
                    }}>
                        <span>
                            <Button variant="contained" onClick={() => setCreateOpen(true)} sx={{ p: '6px', minWidth: '40px', borderRadius: '8px' }}>
                                <img src={PlusIcon} alt="Продать" width={24} height={24}/>
                            </Button>
                        </span>
                    </Tooltip>
                </Box>

                {/* Таблица истории */}
                <TableContainer component={Paper} elevation={10} sx={glassTableStyle}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={tableHeadCellStyle}>Продукт</TableCell>
                                <TableCell sx={tableHeadCellStyle}>Количество</TableCell>
                                <TableCell sx={tableHeadCellStyle}>Сумма продажи ($) </TableCell>
                                <TableCell sx={tableHeadCellStyle}>Дата продажи</TableCell>
                                <TableCell sx={tableHeadCellStyle}>Сотрудник</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sales.length === 0
                                ? <TableRow>
                                    <TableCell colSpan={4} align="center" sx={tableBodyCellStyle}>
                                        Нет записей
                                    </TableCell>
                                </TableRow>
                                : sales.map(s => (
                                    <TableRow key={s.id}>
                                        <TableCell sx={tableBodyCellStyle}>{s.product.name}</TableCell>
                                        <TableCell sx={tableBodyCellStyle}>{s.quantity}</TableCell>
                                        <TableCell sx={tableBodyCellStyle}>
                                            {typeof s.total_amount !== 'undefined'
                                            ? s.total_amount.toFixed(2)
                                            : (s.quantity * (s.product.price || 0)).toFixed(2)
                                            }
                                        </TableCell>
                                        <TableCell sx={tableBodyCellStyle}>
                                            {new Date(s.sale_date).toLocaleString()}
                                        </TableCell>
                                        <TableCell sx={tableBodyCellStyle}>{s.employee.full_name}</TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Snackbar */}
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={() => setSnackbarOpen(false)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                        {snackbarMsg}
                    </Alert>
                </Snackbar>
            </Box>
        </ThemeProvider>
    );
}
