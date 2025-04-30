// src/pages/RawMaterialsPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Box, Button, TextField, MenuItem, Typography,
    Table, TableHead, TableRow, TableCell, TableBody,
    TableContainer, Paper, Dialog, DialogTitle, DialogContent,
    DialogActions, Tooltip, Snackbar, Alert, CircularProgress,
    ThemeProvider
} from "@mui/material";
import PlusIcon from "../assets/plus-svgrepo-com.svg";
import PenIcon from "../assets/pen-svgrepo-com.svg";
import TrashIcon from "../assets/trash-svgrepo-com.svg";
import { theme } from '../theme/theme.jsx';
import {
    inputStyle,
    selectWhiteStyle,
    tableHeadCellStyle,
    tableBodyCellStyle,
    glassTableStyle,
} from '../theme/uiStyles.js';

export default function RawMaterialsPage() {
    const [rawMaterials, setRawMaterials] = useState([]);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "", quantity: "", total_amount: "", unit_id: ""
    });
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [current, setCurrent] = useState(null);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const showSnackbar = (msg, sev = "success") => {
        setSnackbarMsg(msg);
        setSnackbarSeverity(sev);
        setSnackbarOpen(true);
    };

    // 💡 утилита
    function parseError(err) {
        const error = err.response?.data?.error;
        return typeof error === "string" ? error : error?.message || err.message;
    }

// загрузка
    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const [rmRes, uRes] = await Promise.all([
                axios.get("/api/raw-materials"),
                axios.get("/api/units")
            ]);
            setRawMaterials(rmRes.data);
            setUnits(uRes.data);
        } catch (err) {
            const msg = parseError(err);
            showSnackbar("Ошибка загрузки: " + msg, "error");
        } finally {
            setLoading(false);
        }
    }

    const handleFormChange = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

// создать
    const handleCreate = async () => {
        const { name, quantity, total_amount, unit_id } = form;
        if (!name || !quantity || !total_amount || !unit_id) {
            showSnackbar("Заполните все поля", "error");
            return;
        }
        setLoading(true);
        try {
            await axios.post("/api/raw-material/create", {
                name,
                quantity: +quantity,
                total_amount: +total_amount,
                unit_id: +unit_id
            });
            showSnackbar("Сырьё добавлено");
            setCreateOpen(false);
            setForm({ name: "", quantity: "", total_amount: "", unit_id: "" });
            await loadData();
        } catch (err) {
            const msg = parseError(err);
            showSnackbar("Ошибка: " + msg, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        if (!current.name || !current.quantity || !current.total_amount || !current.unit_id) {
            showSnackbar("Заполните все поля", "error");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: current.name,
                quantity: Number(current.quantity),
                total_amount: Number(current.total_amount),
                unit_id: Number(current.unit_id),
            };

            await axios.put(`/api/raw-material/update/${current.id}`, payload);

            showSnackbar("Изменено");
            setEditOpen(false);
            await loadData();
        } catch (err) {
            const msg = parseError(err);
            showSnackbar("Ошибка: " + msg, "error");
        } finally {
            setLoading(false);
        }
    };

// удалить
    const handleDelete = async () => {
        setLoading(true);
        try {
            await axios.delete(`/api/raw-material/delete/${current.id}`);
            showSnackbar("Удалено");
            setDeleteOpen(false);
            await loadData();
        } catch (err) {
            const msg = parseError(err);
            showSnackbar("Ошибка: " + msg, "error");
        } finally {
            setLoading(false);
        }
    };


    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ color: "#fff", marginTop: "10%" }}>
                {/* Заголовок + кнопка */}
                <Box sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2
                }}>
                    <Typography variant="h4" color="#000">Сырьё</Typography>
                    <Tooltip title="Добавить сырьё" placement="right" slotProps={{
                        tooltip: { sx: { fontSize:14,p:"10px 14px",bgcolor:"#2a2a2a",color:"#fff",border:"1px solid #646cff",borderRadius:1 }}
                    }}>
            <span>
              <Button
                  variant="contained"
                  onClick={() => setCreateOpen(true)}
                  disabled={loading}
                  sx={{ p:1, minWidth:40, borderRadius:1 }}
              >
                <img src={PlusIcon} alt="Добавить" width={24} height={24}/>
              </Button>
            </span>
                    </Tooltip>
                </Box>

                {/* Таблица */}
                <TableContainer component={Paper} elevation={10} sx={glassTableStyle}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={tableHeadCellStyle}>Название</TableCell>
                                <TableCell sx={tableHeadCellStyle}>Количество</TableCell>
                                <TableCell sx={tableHeadCellStyle}>Общая сумма</TableCell>
                                <TableCell sx={tableHeadCellStyle}>Единица</TableCell>
                                <TableCell sx={tableHeadCellStyle}>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rawMaterials.length === 0 && !loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={tableBodyCellStyle}>
                                        Нет данных
                                    </TableCell>
                                </TableRow>
                            ) : rawMaterials.map(rm => (
                                <TableRow key={rm.id}>
                                    <TableCell sx={tableBodyCellStyle}>{rm.name}</TableCell>
                                    <TableCell sx={tableBodyCellStyle}>{rm.quantity}</TableCell>
                                    <TableCell sx={tableBodyCellStyle}>{rm.total_amount}</TableCell>
                                    <TableCell sx={tableBodyCellStyle}>
                                        {units.find(u => u.id === rm.unit_id)?.name}
                                    </TableCell>
                                    <TableCell sx={tableBodyCellStyle}>
                                        <Tooltip title="Редактировать" placement="top" slotProps={{
                                            tooltip: { sx: { fontSize:14,p:"10px 14px",bgcolor:"#2a2a2a",color:"#fff",border:"1px solid #646cff",borderRadius:1 }}
                                        }}>
                                            <Button
                                                size="small"
                                                sx={{ minWidth:0, mr:1 }}
                                                onClick={() => {
                                                    setCurrent({
                                                        ...rm,
                                                        unit_id: rm.unit_id.toString(),
                                                        quantity: rm.quantity.toString(),
                                                        total_amount: rm.total_amount.toString()
                                                    });
                                                    setEditOpen(true);
                                                }}
                                            >
                                                <img src={PenIcon} alt="Ред." width={20} height={20}/>
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title="Удалить" placement="top" slotProps={{
                                            tooltip: { sx: { fontSize:14,p:"10px 14px",bgcolor:"#2a2a2a",color:"#fff",border:"1px solid #646cff",borderRadius:1 }}
                                        }}>
                                            <Button
                                                size="small"
                                                color="error"
                                                sx={{ minWidth:0 }}
                                                onClick={() => {
                                                    setCurrent(rm);
                                                    setDeleteOpen(true);
                                                }}
                                            >
                                                <img src={TrashIcon} alt="Del" width={20} height={20}/>
                                            </Button>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Диалог Создать */}
                <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle sx={{ bgcolor:"#1e1e1e", color:"#fff" }}>Создать сырьё</DialogTitle>
                    <DialogContent sx={{ bgcolor:"#1e1e1e" }}>
                        <TextField
                            fullWidth margin="dense" label="Название" name="name"
                            value={form.name} onChange={handleFormChange} sx={inputStyle}
                        />
                        <TextField
                            fullWidth margin="dense" label="Количество" name="quantity" type="number"
                            value={form.quantity} onChange={handleFormChange} sx={inputStyle}
                        />
                        <TextField
                            fullWidth margin="dense" label="Общая сумма" name="total_amount" type="number"
                            value={form.total_amount} onChange={handleFormChange} sx={inputStyle}
                        />
                        <TextField
                            select fullWidth margin="dense" label="Единица" name="unit_id"
                            value={form.unit_id} onChange={handleFormChange} sx={selectWhiteStyle}
                        >
                            {units.map(u => (
                                <MenuItem key={u.id} value={u.id.toString()}>{u.name}</MenuItem>
                            ))}
                        </TextField>
                    </DialogContent>
                    <DialogActions sx={{ bgcolor:"#1e1e1e" }}>
                        <Button onClick={() => setCreateOpen(false)}>Отмена</Button>
                        <Button onClick={handleCreate} variant="contained" disabled={loading}>
                            {loading ? <CircularProgress size={24}/> : "Создать"}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Диалог Редактировать */}
                <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle sx={{ bgcolor:"#1e1e1e", color:"#fff" }}>Редактировать сырьё</DialogTitle>
                    <DialogContent sx={{ bgcolor:"#1e1e1e" }}>
                        <TextField
                            fullWidth margin="dense" label="Название"
                            value={current?.name || ""} onChange={e => setCurrent(c => ({ ...c, name: e.target.value }))}
                            sx={inputStyle}
                        />
                        <TextField
                            fullWidth margin="dense" label="Количество" type="number"
                            value={current?.quantity || ""} onChange={e => setCurrent(c => ({ ...c, quantity: +e.target.value }))}
                            sx={inputStyle}
                        />
                        <TextField
                            fullWidth margin="dense" label="Общая сумма" type="number"
                            value={current?.total_amount || ""} onChange={e => setCurrent(c => ({ ...c, total_amount: +e.target.value }))}
                            sx={inputStyle}
                        />
                        <TextField
                            select fullWidth margin="dense" label="Единица"
                            value={current?.unit_id?.toString() || ""} onChange={e => setCurrent(c => ({ ...c, unit_id: +e.target.value }))}
                            sx={selectWhiteStyle}
                        >
                            {units.map(u => (
                                <MenuItem key={u.id} value={u.id.toString()}>{u.name}</MenuItem>
                            ))}
                        </TextField>
                    </DialogContent>
                    <DialogActions sx={{ bgcolor:"#1e1e1e" }}>
                        <Button onClick={() => setEditOpen(false)}>Отмена</Button>
                        <Button onClick={handleEdit} variant="contained" disabled={loading}>
                            {loading ? <CircularProgress size={24}/> : "Сохранить"}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Диалог Удалить */}
                <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} fullWidth maxWidth="xs">
                    <DialogTitle sx={{ bgcolor:"#1e1e1e", color:"#fff" }}>Удалить запись?</DialogTitle>
                    <DialogActions sx={{ bgcolor:"#1e1e1e" }}>
                        <Button color="error" onClick={handleDelete} disabled={loading}>
                            {loading ? <CircularProgress size={24}/> : "Удалить"}
                        </Button>
                        <Button onClick={() => setDeleteOpen(false)}>Отмена</Button>
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
