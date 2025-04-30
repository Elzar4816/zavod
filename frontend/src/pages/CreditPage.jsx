// src/pages/CreditPage.jsx

import React, { useState, useEffect } from 'react';
import {
    Box, Button, TextField, Container, Typography,
    Table, TableHead, TableRow, TableCell,
    TableBody, TableContainer, Paper, CircularProgress,
    Snackbar, Alert, ThemeProvider,
    Dialog, DialogTitle, DialogContent, DialogActions, Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
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

const formatNumber = (num) => {
    return num.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function CreditPage() {
    const [credits, setCredits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);

    const [amount, setAmount] = useState('');
    const [receivedDate, setReceivedDate] = useState(new Date().toISOString().slice(0, 10));
    const [termYears, setTermYears] = useState('');
    const [interestRate, setInterestRate] = useState('');
    const [penaltyPercent, setPenaltyPercent] = useState('');

    const navigate = useNavigate();

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const showSnackbar = (msg, sev = 'success') => {
        setSnackbarMsg(msg);
        setSnackbarSeverity(sev);
        setSnackbarOpen(true);
    };

    const loadCredits = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/credits');
            setCredits(res.data);
        } catch (err) {
            console.error(err);
            showSnackbar(parseError(err), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCredits();
    }, []);

    const handleCreateCredit = async (e) => {
        e.preventDefault();
        if (!amount || !receivedDate || !termYears || !interestRate || !penaltyPercent) {
            showSnackbar('Заполните все поля', 'warning');
            return;
        }

        setLoading(true);
        try {
            await axios.post('/api/credits/create', {
                amount: parseFloat(amount),
                received_date: new Date(receivedDate).toISOString(),
                term_years: parseInt(termYears),
                annual_interest_rate: parseFloat(interestRate),
                penalty_percent: parseFloat(penaltyPercent),
            });

            showSnackbar('Кредит успешно создан');
            setCreateOpen(false);
            clearForm();
            loadCredits();
        } catch (err) {
            console.error(err);
            showSnackbar("Ошибка: " + parseError(err), 'error');
        } finally {
            setLoading(false);
        }
    };

    const clearForm = () => {
        setAmount('');
        setReceivedDate(new Date().toISOString().slice(0, 10));
        setTermYears('');
        setInterestRate('');
        setPenaltyPercent('');
    };

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="xl" sx={{ mt: 5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" color="#000">Кредиты</Typography>
                    <Tooltip title="Добавить кредит" placement="left">
                        <Button variant="contained" onClick={() => setCreateOpen(true)} sx={{ p: '6px', minWidth: '40px', borderRadius: '8px' }}>
                            <img src={PlusIcon} alt="Добавить" width={24} height={24} />
                        </Button>
                    </Tooltip>
                </Box>

                {/* Модалка */}
                <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle sx={{ bgcolor: '#1e1e1e', color: '#fff' }}>Добавить кредит</DialogTitle>
                    <DialogContent sx={{ bgcolor: '#1e1e1e', color: '#fff' }}>
                        <TextField label="Сумма кредита" type="number" fullWidth margin="dense" value={amount} onChange={e => setAmount(e.target.value)} required sx={inputStyle} />
                        <TextField label="Дата получения" type="date" fullWidth margin="dense" value={receivedDate} onChange={e => setReceivedDate(e.target.value)} InputLabelProps={{ shrink: true }} required sx={inputStyle} />
                        <TextField label="Срок (лет)" type="number" fullWidth margin="dense" value={termYears} onChange={e => setTermYears(e.target.value)} required sx={inputStyle} />
                        <TextField label="% годовых" type="number" fullWidth margin="dense" value={interestRate} onChange={e => setInterestRate(e.target.value)} required sx={inputStyle} />
                        <TextField label="% пени" type="number" fullWidth margin="dense" value={penaltyPercent} onChange={e => setPenaltyPercent(e.target.value)} required sx={inputStyle} />
                    </DialogContent>
                    <DialogActions sx={{ bgcolor: '#1e1e1e' }}>
                        <Button onClick={() => setCreateOpen(false)}>Отмена</Button>
                        <Button onClick={handleCreateCredit} variant="contained" disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : 'Создать'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Таблица */}
                <TableContainer component={Paper} sx={{ mb: 5 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {['ID', 'Сумма', 'Дата получения', 'Срок (лет)', '% годовых', '% пени', 'Выплаты'].map(h => (
                                    <TableCell key={h} sx={tableHeadCellStyle}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {credits.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ fontStyle: 'italic' }}>
                                        Нет кредитов
                                    </TableCell>
                                </TableRow>
                            ) : (
                                credits.map(c => (
                                    <TableRow key={c.id}>
                                        <TableCell sx={tableBodyCellStyle}>{c.id}</TableCell>
                                        <TableCell sx={tableBodyCellStyle}>{formatNumber(c.amount)}</TableCell>
                                        <TableCell sx={tableBodyCellStyle}>
                                            {new Date(c.received_date).toLocaleDateString('ru-RU')}
                                        </TableCell>

                                        <TableCell sx={tableBodyCellStyle}>{c.term_years}</TableCell>
                                        <TableCell sx={tableBodyCellStyle}>{formatNumber(c.annual_interest_rate)}</TableCell>
                                        <TableCell sx={tableBodyCellStyle}>{formatNumber(c.penalty_percent)}</TableCell>
                                        <TableCell sx={tableBodyCellStyle}>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => navigate(`/credits/${c.id}/payments`)}
                                            >
                                                Выплаты
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Уведомление */}
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
            </Container>
        </ThemeProvider>
    );
}
