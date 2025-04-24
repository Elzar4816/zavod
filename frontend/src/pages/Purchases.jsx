// src/pages/Purchases.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, Button, TextField, MenuItem, Select, InputLabel, FormControl,
    Container, Typography, Table, TableHead, TableRow, TableCell,
    TableBody, TableContainer, Paper, CircularProgress, Modal,
    Tooltip, Snackbar, Alert, ThemeProvider
} from '@mui/material';
import { theme } from '../theme/theme.jsx';

import PlusIcon from '../assets/plus-svgrepo-com.svg';
import TrashIcon from "../assets/trash-svgrepo-com.svg";

// 🎨 Стили (точь-в-точь как в ProductionPage.jsx)
const modalStyle = {
    position: 'absolute',
    top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: '#1e1e1e',
    color: '#fff',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    minWidth: 300,
};

const inputStyle = {
    input: { color: '#fff' },
    label: { color: '#fff' },
    '& .MuiOutlinedInput-root': {
        '& fieldset': { borderColor: '#555' },
        '&:hover fieldset': { borderColor: '#fff' },
        '&.Mui-focused fieldset': { borderColor: '#646cff' },
        backgroundColor: '#2a2a2a',
        '& .MuiSelect-select': { color: '#fff' },
    },
};

const selectWhiteStyle = {
    '& label': { color: '#fff' },
    '& label.Mui-focused': { color: '#646cff' },
    '& .MuiOutlinedInput-root': {
        backgroundColor: 'none',
        '& fieldset': { borderColor: '#ccc' },
        '&:hover fieldset': { borderColor: '#888' },
        '&.Mui-focused fieldset': { borderColor: '#646cff' },
        '& .MuiSelect-select': { color: '#fdfdfd' },
        '& .MuiSvgIcon-root': { color: '#fff' },
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
const glowColorPrimary = 'rgba(182,186,241,0.24)';
const glowColorSecondary = '#646cff1a';
const glassBorderColor = 'rgba(87,71,71,0.59)';
const glassTableStyle = {
    backgroundColor: 'rgba(0,0,0,0.05)',
    backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
    boxShadow: `0 0 20px ${glowColorPrimary}, 0 0 60px ${glowColorSecondary}`,
    borderRadius: '12px', border: `1px solid ${glassBorderColor}`,
    overflow: 'hidden',
};

export default function Purchases() {
    const [form, setForm] = useState({
        raw_material_id: '',
        quantity: '',
        total_amount: '',
        employee_id: '',
    });
    const [rawMaterials, setRawMaterials] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [currentDeleteId, setCurrentDeleteId] = useState(null);

    // Snackbar state
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const showSnackbar = (message, severity = 'success') => {
        setSnackbarMsg(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [rmRes, empRes, pRes] = await Promise.all([
                fetch('/api/raw-materials'),
                fetch('/api/employees'),
                fetch('/api/purchases'),
            ]);
            const [rmData, empData, pData] = await Promise.all([
                rmRes.json(), empRes.json(), pRes.json(),
            ]);

            // Логирование данных в консоль
            console.log('Сырьё:', rmData);
            console.log('Сотрудники:', empData);
            console.log('Закупки:', pData);

            setRawMaterials(rmData);
            setEmployees(empData);
            setPurchases(pData);
        } catch (err) {
            console.error('Ошибка при загрузке данных:', err);
            showSnackbar('Ошибка загрузки данных: ' + err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async e => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            raw_material_id: Number(form.raw_material_id),
            quantity: parseFloat(form.quantity),
            total_amount: parseFloat(form.total_amount),
            employee_id: Number(form.employee_id),
        };

        try {
            const res = await fetch('/api/purchases/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const text = await res.text();
            let result = {};
            try { result = JSON.parse(text); } catch {}

            if (res.ok) {
                showSnackbar('Сырье закуплено успешно', 'success');
                setCreateOpen(false);
                setForm({ raw_material_id: '', quantity: '', total_amount: '', employee_id: '' });
                await loadData();
            } else {
                const errMsg = result?.error || text || 'Неизвестная ошибка';
                showSnackbar('Ошибка: ' + errMsg, 'error');
            }
        } catch (err) {
            showSnackbar('Ошибка: ' + err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const openDeleteModal = id => {
        setCurrentDeleteId(id);
        setDeleteOpen(true);
    };
    const handleDelete = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/purchases/delete/${currentDeleteId}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.message === 'Закупка удалена') {
                showSnackbar('Закупка отменена', 'success');
                setDeleteOpen(false);
                await loadData();
            } else {
                showSnackbar('Ошибка при отмене закупки', 'error');
            }
        } catch (err) {
            showSnackbar('Ошибка: ' + err.message, 'error');
        } finally {
            setLoading(false);
        }
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
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={() => setSnackbarOpen(false)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert
                        onClose={() => setSnackbarOpen(false)}
                        severity={snackbarSeverity}
                        sx={{ width: '100%' }}
                    >
                        {snackbarMsg}
                    </Alert>
                </Snackbar>
            </Box>
        </ThemeProvider>
    );
}
