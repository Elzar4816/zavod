// src/pages/ProductionPage.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, Button, TextField, MenuItem, Typography, Table, TableHead, TableRow, TableCell,
    TableBody, TableContainer, Paper, CircularProgress,
    Tooltip, Snackbar, Alert, ThemeProvider, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import PlusIcon from '../assets/plus-svgrepo-com.svg';
import { theme } from '../theme/theme.jsx';
// 🎨 Стили из IngredientsPage
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
    backgroundColor:'#B3B6B7',
};

const glowColorPrimary = 'rgba(182,186,241,0.24)';
const glowColorSecondary = '#646cff1a';
const glassBorderColor = 'rgba(87,71,71,0.59)';
const glassTableStyle = {
    backgroundColor: 'rgba(0,0,0,0.05)',
    backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
    boxShadow: `0 0 20px ${glowColorPrimary}, 0 0 60px ${glowColorSecondary}`,
    borderRadius: '12px',
    // border: `1px solid ${glassBorderColor}`,
    overflow: 'hidden',
};



export default function ProductionPage() {
    const [form, setForm] = useState({
        product_id: '',
        quantity: '',
        employee_id: '',
    });
    const [products, setProducts] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [productions, setProductions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);

    // -- NEW: состояния для Snackbar/Alert
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    // -- NEW: утилита для вызова уведомлений
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
            const [prodRes, empRes, pRes] = await Promise.all([
                fetch('/api/finished-goods'),
                fetch('/api/employees'),
                fetch('/api/productions'),
            ]);
            const [prodData, empData, pData] = await Promise.all([
                prodRes.json(), empRes.json(), pRes.json(),
            ]);
            setProducts(prodData);
            setEmployees(empData);
            setProductions(pData);
        } catch (err) {
            console.error(err);
            showSnackbar('Ошибка загрузки данных: ' + err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            product_id: Number(form.product_id),
            quantity: parseFloat(form.quantity),
            employee_id: Number(form.employee_id),
        };

        try {
            const res = await fetch('/api/productions/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const text = await res.text();
            let result = {};
            try { result = JSON.parse(text); } catch {}

            if (res.ok) {
                showSnackbar('Успешно произведено', 'success');
                await loadData();
                setCreateOpen(false);
                setForm({ product_id: '', quantity: '', employee_id: '' });
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

    return (
        <ThemeProvider theme={theme}>

            <Box  sx={{color: "#ffffff",pt:5,pl:5}}>

                <Box sx={{ display: 'flex', justifyContent: 'space-between',alignItems:'center', mb: 2   }}>
                    <Typography variant="h4" color={'#000'} >Производство</Typography>

                </Box>

                {/* Модалка с формой */}
                <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle sx={{ backgroundColor: '#1e1e1e', color: '#fff' }}>Произвести</DialogTitle>
                    <DialogContent sx={{ backgroundColor: '#1e1e1e', color: '#fff' }}>
                        <TextField
                            select
                            fullWidth
                            margin="dense"
                            label="Продукт"
                            value={form.product_id}
                            onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))}
                            required
                            sx={selectWhiteStyle}
                        >
                            <MenuItem value="">-- Выберите продукт --</MenuItem>
                            {products.map(p => (
                                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Количество"
                            type="number"
                            fullWidth
                            margin="dense"
                            value={form.quantity}
                            onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                            required
                            sx={inputStyle}
                        />

                        <TextField
                            select
                            fullWidth
                            margin="dense"
                            label="Сотрудник"
                            value={form.employee_id}
                            onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))}
                            required
                            sx={selectWhiteStyle}
                        >
                            <MenuItem value="">-- Выберите сотрудника --</MenuItem>
                            {employees.map(emp => (
                                <MenuItem key={emp.id} value={emp.id}>{emp.full_name}</MenuItem>
                            ))}
                        </TextField>
                    </DialogContent>
                    <DialogActions sx={{ backgroundColor: '#1e1e1e' }}>
                        <Button onClick={() => setCreateOpen(false)}>Отмена</Button>
                        <Button onClick={handleFormSubmit} variant="contained" disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : 'Произвести'}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 5, mb: 2 }}>
                    <Typography variant="h6" color={'#000'}>
                        История производства
                    </Typography>
                    <Tooltip
                        title="Произвести"
                        placement="right"
                        slotProps={{
                            tooltip: {
                                sx: {
                                    fontSize: '14px',
                                    padding: '10px 14px',
                                    backgroundColor: '#2a2a2a',
                                    color: '#fff',
                                    border: '1px solid #646cff',
                                    borderRadius: '8px',
                                },
                            },
                        }}
                    >
        <span>
            <Button
                variant="contained"
                onClick={() => setCreateOpen(true)}
                sx={{ p: '6px', minWidth: '40px', borderRadius: '8px' }}
            >
                <img src={PlusIcon} alt="Добавить" width={24} height={24} />
            </Button>
        </span>
                    </Tooltip>
                </Box>


                <TableContainer component={Paper}  elevation={10} sx={glassTableStyle}>
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
                                    <TableCell colSpan={4} align="center" sx={tableBodyCellStyle}>
                                        Нет записей
                                    </TableCell>
                                </TableRow>
                            ) : (
                                productions.map(pr => (
                                    <TableRow key={pr.id}>
                                        <TableCell sx={tableBodyCellStyle}>{pr.product.name}</TableCell>
                                        <TableCell sx={tableBodyCellStyle}>{pr.quantity}</TableCell>
                                        <TableCell sx={tableBodyCellStyle}>
                                            {new Date(pr.production_date).toLocaleString()}
                                        </TableCell>
                                        <TableCell sx={tableBodyCellStyle}>{pr.employee.full_name}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Snackbar с Alert */}
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
