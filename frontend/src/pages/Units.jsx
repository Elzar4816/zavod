// src/pages/UnitsPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
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
import TrashIcon from "../assets/trash-svgrepo-com.svg";
import { theme } from '../theme/theme.jsx';
import {
    inputStyle,
    tableHeadCellStyle,
    tableBodyCellStyle,
    glassTableStyle
} from '../theme/uiStyles.js';


function parseError(err) {
    const error = err.response?.data?.error;
    return {
        code: typeof error === "object" ? error.code : null,
        message: typeof error === "string" ? error : error?.message || err.message,
    };
}


export default function UnitsPage() {
    // данные
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(false);

    // модалки
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    // формы
    const [newName, setNewName] = useState("");
    const [editId, setEditId] = useState(null);
    const [editName, setEditName] = useState("");

    // уведомления
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const showSnackbar = (msg, sev = "success") => {
        setSnackbarMsg(msg);
        setSnackbarSeverity(sev);
        setSnackbarOpen(true);
    };

    // загрузка
    useEffect(() => {
        loadUnits();
    }, []);

    const loadUnits = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/units");
            setUnits(res.data);
        } catch (err) {
            showSnackbar("Ошибка загрузки: " + err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    // CRUD
    const handleCreate = async () => {
        if (!newName.trim()) {
            showSnackbar("Введите название", "error");
            return;
        }
        setLoading(true);
        try {
            await axios.post("/api/units/create", { name: newName });
            showSnackbar("Единица создана");
            setNewName("");
            setCreateOpen(false);
            await loadUnits();
        } catch (err) {
             const { code, message } = parseError(err);
             showSnackbar("Ошибка: " + message, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        if (!editName.trim()) {
            showSnackbar("Введите название", "error");
            return;
        }
        setLoading(true);
        try {
            await axios.put(`/api/units/update/${editId}`, { name: editName });
            showSnackbar("Изменено");
            setEditOpen(false);
            await loadUnits();
        } catch (err) {
             const { code, message } = parseError(err);
             showSnackbar("Ошибка: " + message, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await axios.delete(`/api/units/delete/${editId}`);
            showSnackbar("Удалено");
            setDeleteOpen(false);
            await loadUnits();
        } catch (err) {
             const { code, message } = parseError(err);
             showSnackbar("Ошибка: " + message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ color: "#ffffff", marginTop: "10%" }}>
                {/* Заголовок + кнопка */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h4" color="#000">Единицы измерения</Typography>
                    <Tooltip title="Добавить единицу" placement="right" slotProps={{
                        tooltip: { sx: { fontSize: 14, p: "10px 14px", bgcolor: "#2a2a2a", color: "#fff", border: "1px solid #646cff", borderRadius: 1 } }
                    }}>
            <span>
              <Button
                  variant="contained"
                  onClick={() => setCreateOpen(true)}
                  sx={{ p: 1, minWidth: 40, borderRadius: 1 }}
              >
                <img src={PlusIcon} alt="Добавить" width={24} height={24} />
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
                                <TableCell sx={tableHeadCellStyle}>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {units.length === 0 && !loading ? (
                                <TableRow>
                                    <TableCell colSpan={2} align="center" sx={tableBodyCellStyle}>
                                        Нет единиц
                                    </TableCell>
                                </TableRow>
                            ) : units.map(u => (
                                <TableRow key={u.id}>
                                    <TableCell sx={tableBodyCellStyle}>{u.name}</TableCell>
                                    <TableCell sx={tableBodyCellStyle}>
                                        <Tooltip title="Редактировать" placement="top" slotProps={{
                                            tooltip: { sx: { fontSize: 14, p: "10px 14px", bgcolor: "#2a2a2a", color: "#fff", border: "1px solid #646cff", borderRadius: 1 } }
                                        }}>
                                            <Button size="small" sx={{ minWidth: 0, mr: 1 }} onClick={() => {
                                                setEditId(u.id);
                                                setEditName(u.name);
                                                setEditOpen(true);
                                            }}>
                                                <img src={PenIcon} alt="Ред." width={20} height={20} />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title="Удалить" placement="top" slotProps={{
                                            tooltip: { sx: { fontSize: 14, p: "10px 14px", bgcolor: "#2a2a2a", color: "#fff", border: "1px solid #646cff", borderRadius: 1 } }
                                        }}>
                                            <Button size="small" color="error" sx={{ minWidth: 0 }} onClick={() => {
                                                setEditId(u.id);
                                                setDeleteOpen(true);
                                            }}>
                                                <img src={TrashIcon} alt="Del" width={20} height={20} />
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
                    <DialogTitle sx={{ bgcolor: "#1e1e1e", color: "#fff" }}>Создать единицу</DialogTitle>
                    <DialogContent sx={{ bgcolor: "#1e1e1e" }}>
                        <TextField
                            fullWidth margin="dense" label="Название"
                            value={newName} onChange={e => setNewName(e.target.value)}
                            sx={inputStyle}
                        />
                    </DialogContent>
                    <DialogActions sx={{ bgcolor: "#1e1e1e" }}>
                        <Button onClick={() => setCreateOpen(false)}>Отмена</Button>
                        <Button onClick={handleCreate} variant="contained" disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : "Создать"}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Диалог Редактировать */}
                <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle sx={{ bgcolor: "#1e1e1e", color: "#fff" }}>Редактировать единицу</DialogTitle>
                    <DialogContent sx={{ bgcolor: "#1e1e1e" }}>
                        <TextField
                            fullWidth margin="dense" label="Название"
                            value={editName} onChange={e => setEditName(e.target.value)}
                            sx={inputStyle}
                        />
                    </DialogContent>
                    <DialogActions sx={{ bgcolor: "#1e1e1e" }}>
                        <Button onClick={() => setEditOpen(false)}>Отмена</Button>
                        <Button onClick={handleEdit} variant="contained" disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : "Сохранить"}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Диалог Удалить */}
                <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} fullWidth maxWidth="xs">
                    <DialogTitle sx={{ bgcolor: "#1e1e1e", color: "#fff" }}>Удалить единицу?</DialogTitle>
                    <DialogActions sx={{ bgcolor: "#1e1e1e" }}>
                        <Button color="error" onClick={handleDelete} disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : "Удалить"}
                        </Button>
                        <Button onClick={() => setDeleteOpen(false)}>Отмена</Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar */}
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={() => setSnackbarOpen(false)}
                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                >
                    <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>
                        {snackbarMsg}
                    </Alert>
                </Snackbar>
            </Box>
        </ThemeProvider>
    );
}
