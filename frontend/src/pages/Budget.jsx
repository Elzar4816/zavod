import React, { useState, useEffect } from "react";
import {
    Box, Button, TextField, Typography,
    Table, TableHead, TableRow, TableCell, TableBody,
    TableContainer, Paper, Dialog, DialogTitle,
    DialogContent, DialogActions, Tooltip,
    Snackbar, Alert, CircularProgress, ThemeProvider
} from "@mui/material";
import PenIcon from "@assets/pen-svgrepo-com.svg";
import { theme } from '@theme/theme.jsx';
import {
    inputStyle,
    tableHeadCellStyle,
    tableBodyCellStyle,
    glassTableStyle,
} from '@theme/uiStyles.js';
import { useApi } from '@hooks/useApi';
import { useNotifier } from '@hooks/useNotifier';
import { useFormWithLoading } from '@hooks/useFormWithLoading';

export default function BudgetPage() {
    const api = useApi();
    const { show, snackbarProps, alertProps } = useNotifier();
    const { loading, wrap } = useFormWithLoading();

    const [budget, setBudget] = useState(null);
    const [form, setForm] = useState({
        total_amount: "",
        markup_percentage: "",
        bonus_percentage: "",
        id: null,
    });
    const [editOpen, setEditOpen] = useState(false);

    useEffect(() => {
        loadBudget();
    }, []);

    const loadBudget = async () => {
        await wrap(async () => {
            const data = await api.get("/api/budgets", null, "Ошибка загрузки бюджета");
            if (Array.isArray(data) && data.length > 0) {
                const b = data[0];
                setBudget(b);
                setForm({
                    total_amount: b.total_amount.toString(),
                    markup_percentage: b.markup_percentage.toString(),
                    bonus_percentage: b.bonus_percentage.toString(),
                    id: b.id,
                });
            } else {
                setBudget(null);
            }
        });
    };

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleSave = async () => {
        const { total_amount, markup_percentage, bonus_percentage, id } = form;
        if (!total_amount || !markup_percentage || !bonus_percentage) {
            show("Заполните все поля", "error");
            return;
        }
        await wrap(async () => {
            const payload = {
                total_amount: parseFloat(total_amount),
                markup_percentage: parseFloat(markup_percentage),
                bonus_percentage: parseFloat(bonus_percentage),
            };
            const updated = await api.put(
                `/api/budget/update/${id}`,
                payload,
                res => show("Сохранено", "success"),
                "Ошибка при сохранении"
            );
            setBudget(updated);
            setForm({
                total_amount: updated.total_amount.toString(),
                markup_percentage: updated.markup_percentage.toString(),
                bonus_percentage: updated.bonus_percentage.toString(),
                id: updated.id,
            });
            setEditOpen(false);
        });
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ color: "#fff", mt: 5, pl: 5 }}>
                <Typography variant="h4" color="#000" sx={{ mb: 2 }}>
                    Бюджет
                </Typography>

                <TableContainer component={Paper} sx={glassTableStyle}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={tableHeadCellStyle}>Сумма</TableCell>
                                <TableCell sx={tableHeadCellStyle}>Наценка (%)</TableCell>
                                <TableCell sx={tableHeadCellStyle}>Бонус (%)</TableCell>
                                <TableCell sx={tableHeadCellStyle}>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {!budget && !loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={tableBodyCellStyle}>
                                        Нет данных
                                    </TableCell>
                                </TableRow>
                            ) : (
                                budget && (
                                    <TableRow key={budget.id}>
                                        <TableCell sx={tableBodyCellStyle}>
                                            {budget.total_amount.toLocaleString("ru-RU", { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell sx={tableBodyCellStyle}>{budget.markup_percentage}%</TableCell>
                                        <TableCell sx={tableBodyCellStyle}>{budget.bonus_percentage}%</TableCell>
                                        <TableCell sx={tableBodyCellStyle}>
                                            <Tooltip title="Редактировать" placement="top">
                                                <Button
                                                    size="small"
                                                    sx={{ minWidth: 0 }}
                                                    onClick={() => setEditOpen(true)}
                                                    disabled={loading}
                                                >
                                                    {loading ? (
                                                        <CircularProgress size={20} />
                                                    ) : (
                                                        <img src={PenIcon} alt="Ред." width={20} height={20} />
                                                    )}
                                                </Button>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                )
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Edit Dialog */}
                <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle sx={{ bgcolor: "#1e1e1e", color: "#fff" }}>
                        Редактировать бюджет
                    </DialogTitle>
                    <DialogContent sx={{ bgcolor: "#1e1e1e" }}>
                        <TextField
                            fullWidth
                            margin="dense"
                            label="Сумма"
                            name="total_amount"
                            value={form.total_amount}
                            onChange={handleChange}
                            sx={inputStyle}
                        />
                        <TextField
                            fullWidth
                            margin="dense"
                            label="Наценка (%)"
                            name="markup_percentage"
                            value={form.markup_percentage}
                            onChange={handleChange}
                            sx={inputStyle}
                        />
                        <TextField
                            fullWidth
                            margin="dense"
                            label="Бонус (%)"
                            name="bonus_percentage"
                            value={form.bonus_percentage}
                            onChange={handleChange}
                            sx={inputStyle}
                        />
                    </DialogContent>
                    <DialogActions sx={{ bgcolor: "#1e1e1e" }}>
                        <Button onClick={() => setEditOpen(false)}>Отмена</Button>
                        <Button onClick={handleSave} variant="contained" disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : "Сохранить"}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar */}
                <Snackbar {...snackbarProps}>
                    <Alert {...alertProps} onClose={snackbarProps.onClose}>
                        {alertProps.children}
                    </Alert>
                </Snackbar>
            </Box>
        </ThemeProvider>
    );
}
