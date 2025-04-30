// src/pages/PaymentsPage.jsx

import React, { useState, useEffect } from 'react';
import {
    Box, Button, Container, Typography, Table, TableHead, TableRow, TableCell,
    TableBody, TableContainer, Paper, TextField, CircularProgress,
    Snackbar, Alert, ThemeProvider,
    Dialog, DialogTitle, DialogContent, DialogActions, Tooltip
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { theme } from '../theme/theme.jsx';
import PlusIcon from '../assets/plus-svgrepo-com.svg';
import axios from "axios";
import {
    inputStyle,
    tableHeadCellStyle,
    tableBodyCellStyle,
} from '../theme/uiStyles.js';
function parseError(err) {
    const error = err?.response?.data?.error;
    if (typeof error === "string") return error;
    if (typeof error === "object") return error.message || JSON.stringify(error);
    return err.message || "Неизвестная ошибка";
}

// Форматирование чисел с разделением тысяч
const formatNumber = (num) => {
    return num.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function PaymentsPage() {
    const { id } = useParams();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 16));
    const [createOpen, setCreateOpen] = useState(false);
    const [creditInfo, setCreditInfo] = useState(null);


    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const showSnackbar = (msg, sev = 'success') => {
        setSnackbarMsg(msg);
        setSnackbarSeverity(sev);
        setSnackbarOpen(true);
    };
    const loadCreditInfo = async () => {
        try {
            const res = await axios.get(`/api/credits/${id}`);
            setCreditInfo(res.data);
        } catch (err) {
            showSnackbar(parseError(err), 'error');
        }
    };


    const loadPayments = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/credits/${id}/payments`);
            setPayments(res.data);
        } catch (err) {
            console.error(err);
            showSnackbar(parseError(err), 'error');
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadCreditInfo();
        loadPayments();
    }, [id]);


    const handleMakePayment = async e => {
        e.preventDefault();
        if (!paymentDate) {
            showSnackbar('Укажите дату выплаты', 'warning');
            return;
        }
        setLoading(true);
        try {
            await axios.post('/api/credits/payment', {
                credit_id: parseInt(id),
                payment_date: new Date(paymentDate).toISOString(),
            });
            showSnackbar('Выплата успешно добавлена');
            setCreateOpen(false);
            setPaymentDate(new Date().toISOString().slice(0, 16));
            loadPayments();
        } catch (err) {
            console.error(err);
            showSnackbar(parseError(err), 'error');
        } finally {
            setLoading(false);
        }
    };


    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="xl" sx={{ mt: 5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" color="#000">
                        Выплаты по кредиту #{id}
                    </Typography>
                    <Tooltip title="Добавить выплату" placement="left">
                        <Button
                            variant="contained"
                            onClick={() => setCreateOpen(true)}
                            sx={{ p: '6px', minWidth: '40px', borderRadius: '8px' }}
                        >
                            <img src={PlusIcon} alt="Добавить" width={24} height={24} />
                        </Button>
                    </Tooltip>
                </Box>

                {/* Модальное окно */}
                <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle sx={{ bgcolor: '#1e1e1e', color: '#fff' }}>Добавить выплату</DialogTitle>
                    <DialogContent sx={{ bgcolor: '#1e1e1e', color: '#fff' }}>
                        <TextField
                            label="Дата выплаты"
                            type="date"
                            fullWidth
                            margin="dense"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            required
                            sx={inputStyle}
                            inputProps={{
                                min: creditInfo ? creditInfo.received_date.slice(0, 10) : undefined
                            }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ bgcolor: '#1e1e1e' }}>
                        <Button onClick={() => setCreateOpen(false)}>Отмена</Button>
                        <Button onClick={handleMakePayment} variant="contained" disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : 'Добавить'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Таблица выплат */}
                <TableContainer component={Paper} sx={{ mb: 5 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {['#', 'Дата', 'Часть долга', 'Процент', 'Общая сумма', 'Остаток', 'Просрочка', 'Пени', 'Итого'].map(h => (
                                    <TableCell key={h} sx={tableHeadCellStyle}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {payments.map((p, idx) => (
                                <TableRow key={p.id}>
                                    <TableCell sx={tableBodyCellStyle}>{idx + 1}</TableCell>
                                    <TableCell sx={tableBodyCellStyle}>
                                        {new Date(p.payment_date).toLocaleDateString('ru-RU')}
                                    </TableCell>
                                    <TableCell sx={tableBodyCellStyle}>{formatNumber(p.principal_part)}</TableCell>
                                    <TableCell sx={tableBodyCellStyle}>{formatNumber(p.interest_part)}</TableCell>
                                    <TableCell sx={tableBodyCellStyle}>{formatNumber(p.total_amount)}</TableCell>
                                    <TableCell sx={tableBodyCellStyle}>{formatNumber(p.remaining_credit)}</TableCell>
                                    <TableCell sx={tableBodyCellStyle}>{p.days_late}</TableCell>
                                    <TableCell sx={tableBodyCellStyle}>{formatNumber(p.penalty_amount)}</TableCell>
                                    <TableCell sx={tableBodyCellStyle}>{formatNumber(p.final_amount)}</TableCell>
                                </TableRow>
                            ))}
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
            </Container>
        </ThemeProvider>

    );
}
