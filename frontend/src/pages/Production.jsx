import React, { useState, useEffect } from 'react';
import {
    Box, Button, TextField, MenuItem, Typography, Table, TableHead,
    TableRow, TableCell, TableBody, TableContainer, Paper, CircularProgress,
    Tooltip, Snackbar, Alert, ThemeProvider, Dialog, DialogTitle,
    DialogContent, DialogActions
} from '@mui/material';
import PlusIcon from '@assets/plus-svgrepo-com.svg';
import { theme } from '@theme/theme.jsx';
import {
    inputStyle,
    selectWhiteStyle,
    tableHeadCellStyle,
    tableBodyCellStyle,
    glassTableStyle,
} from '@theme/uiStyles.js';
import { useApi } from '@hooks/useApi';
import { useNotifier } from '@hooks/useNotifier';
import { useFormWithLoading } from '@hooks/useFormWithLoading';

export default function ProductionPage() {
    const api = useApi();
    const { show, snackbarProps, alertProps } = useNotifier();
    const { loading, wrap } = useFormWithLoading();

    const [form, setForm] = useState({ product_id: '', quantity: '', employee_id: '' });
    const [products, setProducts] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [productions, setProductions] = useState([]);
    const [createOpen, setCreateOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        await wrap(async () => {
            const [prods, emps, hist] = await Promise.all([
                api.get('/api/finished-goods'),
                api.get('/api/employees'),
                api.get('/api/productions')
            ]);
            setProducts(prods);
            setEmployees(emps);
            setProductions(hist);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Клиентская валидация
        const prodId = Number(form.product_id);
        const qty    = parseFloat(form.quantity);
        const empId  = Number(form.employee_id);

        if (!prodId || isNaN(qty) || qty <= 0 || !empId) {
            show("Пожалуйста, заполните все поля корректно", "error");
            return;
        }

        // 2. Обёртка с загрузкой и перехватом ошибок
        try {
            await wrap(async () => {
                await api.post("/api/productions/create", {
                    product_id: prodId,
                    quantity: qty,
                    employee_id: empId,
                });
                // Если запрос ОК – закрываем форму и обновляем
                show("Производство успешно завершено", "success");
                setCreateOpen(false);
                setForm({ product_id: "", quantity: "", employee_id: "" });
                await loadData();
            });
        } catch (err) {
            // useApi уже вызвал show() с сообщением от сервера,
            // но нам нужно подавить «незамеченную» ошибку,
            // чтобы React точно сделал ререндер и Snackbar показался.
        }
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ color: '#fff', pt: 5, pl: 5 }}>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant='h4' color='#000'>Производство продукции</Typography>
                    <Tooltip title='Произвести' placement='right'>
            <span>
              <Button variant='contained' onClick={() => setCreateOpen(true)} disabled={loading} sx={{ p: 1, minWidth: 40, borderRadius: 1 }}>
                <img src={PlusIcon} alt='Произвести' width={24} height={24} />
              </Button>
            </span>
                    </Tooltip>
                </Box>

                {/* Формирование истории */}
                <TableContainer component={Paper} sx={glassTableStyle} elevation={10}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={tableHeadCellStyle}>Продукт</TableCell>
                                <TableCell sx={tableHeadCellStyle}>Количество</TableCell>
                                <TableCell sx={tableHeadCellStyle}>Дата</TableCell>
                                <TableCell sx={tableHeadCellStyle}>Сотрудник</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {productions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align='center' sx={tableBodyCellStyle}>Нет записей</TableCell>
                                </TableRow>
                            ) : (
                                productions.map(pr => (
                                    <TableRow key={pr.id}>
                                        <TableCell sx={tableBodyCellStyle}>{pr.product.name}</TableCell>
                                        <TableCell sx={tableBodyCellStyle}>{pr.quantity}</TableCell>
                                        <TableCell sx={tableBodyCellStyle}>{new Date(pr.production_date).toLocaleString()}</TableCell>
                                        <TableCell sx={tableBodyCellStyle}>{pr.employee.full_name}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Модалка создания */}
                <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth='sm'>
                    <DialogTitle sx={{ backgroundColor: '#1e1e1e', color: '#fff' }}>Произвести</DialogTitle>
                    <DialogContent sx={{ backgroundColor: '#1e1e1e' }}>
                        <TextField
                            select fullWidth margin='dense' label='Продукт'
                            name='product_id' value={form.product_id} onChange={handleChange}
                            sx={selectWhiteStyle} required
                        >
                            <MenuItem value=''>-- Выберите продукт --</MenuItem>
                            {products.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                        </TextField>

                        <TextField
                            label='Количество' type='number' fullWidth margin='dense'
                            name='quantity' value={form.quantity} onChange={handleChange}
                            sx={inputStyle} required
                        />

                        <TextField
                            select fullWidth margin='dense' label='Сотрудник'
                            name='employee_id' value={form.employee_id} onChange={handleChange}
                            sx={selectWhiteStyle} required
                        >
                            <MenuItem value=''>-- Выберите сотрудника --</MenuItem>
                            {employees.map(e => <MenuItem key={e.id} value={e.id}>{e.full_name}</MenuItem>)}
                        </TextField>
                    </DialogContent>
                    <DialogActions sx={{ backgroundColor: '#1e1e1e' }}>
                        <Button onClick={() => setCreateOpen(false)}>Отмена</Button>
                        <Button onClick={handleSubmit} variant='contained' disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : 'Произвести'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar уведомления */}
                <Snackbar {...snackbarProps}>
                    <Alert {...alertProps} onClose={snackbarProps.onClose}>{alertProps.children}</Alert>
                </Snackbar>
            </Box>
        </ThemeProvider>
    );
}
