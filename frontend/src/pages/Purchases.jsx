// src/pages/Purchases.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, Button, TextField, MenuItem, Select, InputLabel, FormControl,
    Typography, Table, TableHead, TableRow, TableCell,
    TableBody, TableContainer, Paper, CircularProgress, Modal,
    Tooltip, Snackbar, Alert, ThemeProvider
} from '@mui/material';
import { theme } from '../theme/theme.jsx';

import PlusIcon from '../assets/plus-svgrepo-com.svg';
import TrashIcon from "../assets/trash-svgrepo-com.svg";
import {
    inputStyle,
    selectWhiteStyle,
    tableHeadCellStyle,
    tableBodyCellStyle,
    glassTableStyle,
    modalStyle,
} from '../theme/uiStyles.js';
import { useApi } from '../hooks/useApi';
import { useNotifier } from '../hooks/useNotifier';
import { usePurchasesData } from '../hooks/usePurchasesData';
import { useFormWithLoading } from '../hooks/useFormWithLoading';



export default function Purchases() {

    const [form, setForm] = useState({
        raw_material_id: '',
        quantity: '',
        total_amount: '',
        employee_id: '',
    });

    const [createOpen, setCreateOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [currentDeleteId, setCurrentDeleteId] = useState(null);

// хук для формы
    const { loading, wrap } = useFormWithLoading();

// Snackbar
    const { snackbarProps, alertProps, show } = useNotifier();
    const api = useApi();

// загрузка данных
    const [rawMaterials, setRawMaterials] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [dataLoading, setDataLoading] = useState(false);

    const { load } = usePurchasesData();

    const loadData = async () => {
        setDataLoading(true);
        try {
            const result = await load();
            setRawMaterials(result.rawMaterials);
            setEmployees(result.employees);
            setPurchases(result.purchases);
        } finally {
            setDataLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const raw_material_id = Number(form.raw_material_id);
        const quantity = parseFloat(form.quantity);
        const total_amount = parseFloat(form.total_amount);
        const employee_id = Number(form.employee_id);

        const isValid =
            raw_material_id &&
            !isNaN(quantity) && quantity > 0 &&
            !isNaN(total_amount) && total_amount > 0 &&
            employee_id;

        if (!isValid) {
            show("Пожалуйста, заполните все поля корректно", "error");
            return;
        }

        await wrap(async () => {
            try {
                await api.post('/api/purchases/create', {
                    raw_material_id,
                    quantity,
                    total_amount,
                    employee_id,
                });

                // ✅ Только если запрос прошёл успешно:
                setCreateOpen(false);
                setForm({ raw_material_id: '', quantity: '', total_amount: '', employee_id: '' });
                await loadData();
                show('Сырье закуплено успешно', 'success');
            } catch (err) {
                console.error('Ошибка при создании закупки:', err);

                // Расшифровка типа ошибки:
                if (err?.response?.status === 409) {
                    show(err.response.data.message || 'Недостаточно средств в бюджете', 'error');
                } else if (err?.response?.status === 400) {
                    show(err.response.data.message || 'Некорректные данные', 'error');
                } else {
                    show('Что-то пошло не так', 'error');
                }
            }
        });
    };
    

    const openDeleteModal = (id) => {
        setCurrentDeleteId(id);
        setDeleteOpen(true);
    };

    const handleDelete = async () => {
        await wrap(async () => {
            await api.del(`/api/purchases/delete/${currentDeleteId}`);
            show('Закупка отменена');
            setDeleteOpen(false);
            await loadData();
        });
    };




    return (
        <ThemeProvider theme={theme}>

            <Box sx={{ color: '#ffffff', pt:5,pl:5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" color="#000">Закупки сырья</Typography>
                </Box>

                <Modal open={createOpen} onClose={() => setCreateOpen(false)}>
                    <Box sx={modalStyle} component="form" onSubmit={handleFormSubmit}>
                        <Typography variant="h6" gutterBottom>
                            Создать закупку
                        </Typography>

                        <FormControl fullWidth margin="normal" sx={selectWhiteStyle}>
                            <InputLabel>Сырье</InputLabel>
                            <Select
                                value={form.raw_material_id}
                                onChange={e => setForm(f => ({ ...f, raw_material_id: e.target.value }))}
                                required
                            >
                                <MenuItem value="">-- Выберите сырье --</MenuItem>
                                {rawMaterials.map(rm => (
                                    <MenuItem key={rm.id} value={rm.id}>{rm.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Количество"
                            type="number"
                            fullWidth
                            margin="normal"
                            value={form.quantity}
                            onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                            required
                            sx={inputStyle}
                        />

                        <TextField
                            label="Общая сумма"
                            type="number"
                            fullWidth
                            margin="normal"
                            value={form.total_amount}
                            onChange={e => setForm(f => ({ ...f, total_amount: e.target.value }))}
                            required
                            sx={inputStyle}
                        />

                        <FormControl fullWidth margin="normal" sx={selectWhiteStyle}>
                            <InputLabel>Сотрудник</InputLabel>
                            <Select
                                value={form.employee_id}
                                onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))}
                                required
                            >
                                <MenuItem value="">-- Выберите сотрудника --</MenuItem>
                                {employees.map(emp => (
                                    <MenuItem key={emp.id} value={emp.id}>{emp.full_name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button onClick={() => setCreateOpen(false)} sx={{ mr: 2 }}>
                                Отмена
                            </Button>
                            <Button type="submit" variant="contained" disabled={loading}>
                                {loading ? <CircularProgress size={24} /> : 'Добавить'}
                            </Button>
                        </Box>
                    </Box>
                </Modal>

                {/* Модалка удаления */}
                <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)}>
                    <Box sx={modalStyle}>
                        <Typography variant="h6" gutterBottom>
                            Удалить закупку?
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button onClick={() => setDeleteOpen(false)} sx={{ mr: 2 }}>
                                Отмена
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={handleDelete}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24}/> : 'Удалить'}
                            </Button>
                        </Box>
                    </Box>
                </Modal>

                {/* История закупок */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 5, mb: 2 }}>
                <Typography variant="h6" color="#000">История закупок</Typography>
                        <Tooltip
                            title="Закупить сырье"
                            placement="right"
                            slotProps={{
                                tooltip: { sx: {
                                        fontSize: '14px',
                                        padding: '10px 14px',
                                        backgroundColor: '#2a2a2a',
                                        color: '#fff',
                                        border: '1px solid #646cff',
                                        borderRadius: '8px',
                                    } },
                            }}>
                            <span>
                                <Button variant="contained" onClick={() => setCreateOpen(true)} sx={{ p: '6px', minWidth: '40px', borderRadius: '8px' }}>
                                    <img src={PlusIcon} alt="Добавить" width={24} height={24} />
                                </Button>
                            </span>
                        </Tooltip>
                </Box>
                <TableContainer component={Paper} sx={glassTableStyle}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={tableHeadCellStyle}>Сырье</TableCell>
                                <TableCell sx={tableHeadCellStyle}>Количество</TableCell>
                                <TableCell sx={tableHeadCellStyle}>Сумма</TableCell>
                                <TableCell sx={tableHeadCellStyle}>Сотрудник</TableCell>
                                <TableCell sx={tableHeadCellStyle}>Дата</TableCell>
                                <TableCell sx={tableHeadCellStyle}>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {purchases.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={tableBodyCellStyle}>
                                        Нет записей
                                    </TableCell>
                                </TableRow>
                            ) : (
                                purchases.map(p => (
                                    <TableRow key={p.id}>
                                        <TableCell sx={tableBodyCellStyle}>{p.raw_material.name}</TableCell>
                                        <TableCell sx={tableBodyCellStyle}>{p.quantity}</TableCell>
                                        <TableCell sx={tableBodyCellStyle}>{p.total_amount}</TableCell>
                                        <TableCell sx={tableBodyCellStyle}>{p.employee.full_name}</TableCell>
                                        <TableCell sx={tableBodyCellStyle}>
                                            {new Date(p.purchase_date).toLocaleString()}
                                        </TableCell>
                                        <TableCell sx={tableBodyCellStyle}>
                                            <Tooltip title="Отменить закупку" placement="top"
                                                     slotProps={{ tooltip: { sx: { fontSize: 14, p: "10px 14px", bgcolor: "#2a2a2a", color: "#fff", border: "1px solid #646cff", borderRadius: 1 } } }}
                                            >
                                                <Button
                                                    variant="text"
                                                    color="error"
                                                    onClick={() => openDeleteModal(p.id)}
                                                >
                                                    <img src={TrashIcon} alt="Del" width={20} height={20} />
                                                </Button>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Snackbar */}
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

            </Box>
        </ThemeProvider>
    );
}
