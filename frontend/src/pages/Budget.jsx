// src/pages/BudgetPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { theme } from '../theme/theme.jsx';
import {
    Box, Button, TextField, Typography,
    Table, TableHead, TableRow, TableCell, TableBody,
    TableContainer, Paper, Dialog, DialogTitle,
    DialogContent, DialogActions, Tooltip,
    Snackbar, Alert, CircularProgress,
    ThemeProvider
} from "@mui/material";
import PlusIcon from "../assets/plus-svgrepo-com.svg";
import PenIcon from "../assets/pen-svgrepo-com.svg";
import {
    inputStyle,
    tableHeadCellStyle,
    tableBodyCellStyle,
    glassTableStyle,
} from '../theme/uiStyles.js';

export default function BudgetPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        total_amount: "", markup_percentage: "", bonus_percentage: "", id: null
    });
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const showSnackbar = (msg, sev = "success") => {
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
        loadBudget();
    }, []);

    async function loadBudget() {
        setLoading(true);
        try {
            await axios.get("/api/check-budget");
            const res = await axios.get("/api/budgets");
            setItems(res.data);
        } catch (err) {
            setItems([]);
            showSnackbar("Ошибка загрузки: " + parseError(err), "error");
        } finally {
            setLoading(false);
        }
    }

    const handleFormChange = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleCreate = async () => {
        const { total_amount, markup_percentage, bonus_percentage } = form;
        if (!total_amount || markup_percentage === "" || bonus_percentage === "") {
            showSnackbar("Заполните все поля", "error");
            return;
        }
        setLoading(true);
        try {
            const payload = {
                total_amount: parseFloat(total_amount),
                markup_percentage: parseFloat(markup_percentage),
                bonus_percentage: parseFloat(bonus_percentage),
            };
            await axios.post("/api/budget/create", payload);
            showSnackbar("Добавлено");
            setCreateOpen(false);
            setForm({ total_amount: "", markup_percentage: "", bonus_percentage: "", id: null });
            await loadBudget();
        } catch (err) {
            showSnackbar("Ошибка: " + parseError(err), "error");
        } finally {
            setLoading(false);
        }
    };

    const openEdit = item => {
        setForm({
            total_amount: item.total_amount.toString(),
            markup_percentage: item.markup_percentage.toString(),
            bonus_percentage: item.bonus_percentage.toString(),
            id: item.id
        });
        setEditOpen(true);
    };

    const handleSaveEdit = async () => {
        const { total_amount, markup_percentage, bonus_percentage, id } = form;
        if (!total_amount || markup_percentage === "" || bonus_percentage === "") {
            showSnackbar("Заполните все поля", "error");
            return;
        }
        setLoading(true);
        try {
            const payload = {
                total_amount: parseFloat(total_amount),
                markup_percentage: parseFloat(markup_percentage),
                bonus_percentage: parseFloat(bonus_percentage),
            };
            const res = await axios.put(`/api/budget/update/${id}`, payload);
            showSnackbar("Сохранено");
            setEditOpen(false);
            setForm({ total_amount: "", markup_percentage: "", bonus_percentage: "", id: null });
            setItems(it =>
                it.map(i => (i.id === id ? { ...i, ...res.data } : i))
            );
        } catch (err) {
            showSnackbar("Ошибка: " + parseError(err), "error");
        } finally {
            setLoading(false);
        }
    };


    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ color: "#fff", mt: "10%" }}>
                <Box sx={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center", mb: 2
                }}>
                    <Typography variant="h4" color="#000">Бюджет</Typography>
                    <Tooltip title="Добавить статью" placement="right" slotProps={{
                        tooltip: { sx: { fontSize:14,p:"10px 14px",bgcolor:"#2a2a2a",color:"#fff",border:"1px solid #646cff",borderRadius:1 }}
                    }}>
            <span>
              <Button
                  variant="contained"
                  onClick={() => setCreateOpen(true)}
                  disabled={items.length > 0 || loading}
                  sx={{ p:1,minWidth:40,borderRadius:1 }}
              >
                <img src={PlusIcon} alt="Добавить" width={24} height={24}/>
              </Button>
            </span>
                    </Tooltip>
                </Box>

                <TableContainer component={Paper} elevation={10} sx={glassTableStyle}>
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
                            {(!items.length && !loading) ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={tableBodyCellStyle}>
                                        Нет данных
                                    </TableCell>
                                </TableRow>
                            ) : items.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell sx={tableBodyCellStyle}>
                                        {item.total_amount.toLocaleString("ru-RU", { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell sx={tableBodyCellStyle}>{item.markup_percentage}%</TableCell>
                                    <TableCell sx={tableBodyCellStyle}>{item.bonus_percentage}%</TableCell>
                                    <TableCell sx={tableBodyCellStyle}>
                                        <Tooltip title="Редактировать" placement="top" slotProps={{
                                            tooltip: { sx: { fontSize:14,p:"10px 14px",bgcolor:"#2a2a2a",color:"#fff",border:"1px solid #646cff",borderRadius:1 }}
                                        }}>
                                            <Button size="small" sx={{ minWidth:0,p:1 }} onClick={() => openEdit(item)}>
                                                <img src={PenIcon} alt="Редактировать" width={20} height={20}/>
                                            </Button>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Create Dialog */}
                <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle sx={{ bgcolor:"#1e1e1e", color:"#fff" }}>Добавить статью бюджета</DialogTitle>
                    <DialogContent sx={{ bgcolor:"#1e1e1e" }}>
                        <TextField
                            fullWidth margin="dense" label="Сумма" name="total_amount"
                            value={form.total_amount} onChange={handleFormChange} sx={inputStyle}
                        />
                        <TextField
                            fullWidth margin="dense" label="Наценка (%)" name="markup_percentage"
                            value={form.markup_percentage} onChange={handleFormChange} sx={inputStyle}
                        />
                        <TextField
                            fullWidth margin="dense" label="Бонус (%)" name="bonus_percentage"
                            value={form.bonus_percentage} onChange={handleFormChange} sx={inputStyle}
                        />
                    </DialogContent>
                    <DialogActions sx={{ bgcolor:"#1e1e1e" }}>
                        <Button onClick={() => setCreateOpen(false)}>Отмена</Button>
                        <Button onClick={handleCreate} variant="contained" disabled={loading}>
                            {loading ? <CircularProgress size={24}/> : "Создать"}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Edit Dialog */}
                <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle sx={{ bgcolor:"#1e1e1e", color:"#fff" }}>Редактировать статью бюджета</DialogTitle>
                    <DialogContent sx={{ bgcolor:"#1e1e1e" }}>
                        <TextField
                            fullWidth margin="dense" label="Сумма" name="total_amount"
                            value={form.total_amount} onChange={handleFormChange} sx={inputStyle}
                        />
                        <TextField
                            fullWidth margin="dense" label="Наценка (%)" name="markup_percentage"
                            value={form.markup_percentage} onChange={handleFormChange} sx={inputStyle}
                        />
                        <TextField
                            fullWidth margin="dense" label="Бонус (%)" name="bonus_percentage"
                            value={form.bonus_percentage} onChange={handleFormChange} sx={inputStyle}
                        />
                    </DialogContent>
                    <DialogActions sx={{ bgcolor:"#1e1e1e" }}>
                        <Button onClick={() => setEditOpen(false)}>Отмена</Button>
                        <Button onClick={handleSaveEdit} variant="contained" disabled={loading}>
                            {loading ? <CircularProgress size={24}/> : "Сохранить"}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar */}
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={() => setSnackbarOpen(false)}
                    anchorOrigin={{ vertical:"bottom", horizontal:"center" }}
                >
                    <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width:"100%" }}>
                        {snackbarMsg}
                    </Alert>
                </Snackbar>
            </Box>
        </ThemeProvider>
    );
}
