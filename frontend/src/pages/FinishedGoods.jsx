// src/pages/FinishedGoodsPage.jsx
import React, { useEffect, useState } from "react";
import { theme } from '../theme/theme.jsx';
import {
    Box, Button, TextField, MenuItem, Typography,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Table, TableHead, TableRow, TableCell, TableBody,
    TableContainer, Paper, Tooltip,
    Snackbar, Alert, CircularProgress,
    ThemeProvider
} from "@mui/material";
import PlusIcon from "../assets/plus-svgrepo-com.svg";
import PenIcon from "../assets/pen-svgrepo-com.svg";
import TrashIcon from "../assets/trash-svgrepo-com.svg";
import axios from "axios";

// 🎨 Стили
const modalStyle = {
    position: "absolute",
    top: "50%", left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "#1e1e1e",
    color: "#fff",
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    minWidth: 300,
};

const inputStyle = {
    input: { color: "#fff" },
    label: { color: "#fff" },
    "& .MuiOutlinedInput-root": {
        "& fieldset": { borderColor: "#555" },
        "&:hover fieldset": { borderColor: "#fff" },
        "&.Mui-focused fieldset": { borderColor: "#646cff" },
        backgroundColor: "#2a2a2a",
    },
};

const selectWhiteStyle = {
    "& label": { color: "#fff" },
    "& label.Mui-focused": { color: "#646cff" },
    "& .MuiOutlinedInput-root": {
        backgroundColor: "none",
        "& fieldset": { borderColor: "#ccc" },
        "&:hover fieldset": { borderColor: "#888" },
        "&.Mui-focused fieldset": { borderColor: "#646cff" },
        "& .MuiSelect-select": { color: "#fff" },
        "& .MuiSvgIcon-root": { color: "#fff" },
    },
};

const tableHeadCellStyle = {
    color: "#fff",
    backgroundColor: "#6F1A07",
    fontSize: "20px",
};

const tableBodyCellStyle = {
    color: "#3d3d3d",
    fontSize: "20px",
    backgroundColor: "#B3B6B7",
};

const glowColorPrimary = "rgba(182,186,241,0.24)";
const glowColorSecondary = "#646cff1a";
const glassTableStyle = {
    backgroundColor: "rgba(0,0,0,0.05)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    boxShadow: `0 0 20px ${glowColorPrimary}, 0 0 60px ${glowColorSecondary}`,
    borderRadius: "12px",
    overflow: "hidden",
};

export default function FinishedGoodsPage() {
    const [goods, setGoods] = useState([]);
    const [units, setUnits] = useState([]);

    const [form, setForm] = useState({
        name: "",
        quantity: "",
        total_amount: "",
        unit_id: "",
    });

    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [current, setCurrent] = useState(null);

    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    const showSnackbar = (msg, sev = "success") => {
        setSnackbarMsg(msg);
        setSnackbarSeverity(sev);
        setSnackbarOpen(true);
    };

    useEffect(() => {
        setLoading(true);
        Promise.all([
            axios.get("/api/finished-goods"),
            axios.get("/api/units"),
        ])
            .then(([gRes, uRes]) => {
                setGoods(gRes.data);
                setUnits(uRes.data);
            })
            .catch(err => showSnackbar("Ошибка загрузки: " + err.message, "error"))
            .finally(() => setLoading(false));
    }, []);

    const handleChange = e =>
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleCreate = () => {
        if (!form.name || !form.quantity || !form.total_amount || !form.unit_id) {
            return showSnackbar("Заполните все поля", "error");
        }
        setLoading(true);
        axios
            .post("/api/finished-good/create", {
                ...form,
                quantity: +form.quantity,
                total_amount: +form.total_amount,
                unit_id: +form.unit_id,
            })
            .then(r => {
                setGoods(prev => [...prev, r.data]);
                setForm({ name: "", quantity: "", total_amount: "", unit_id: "" });
                setCreateOpen(false);
                showSnackbar("Успешно создано");
            })
            .catch(err => showSnackbar("Ошибка: " + err.message, "error"))
            .finally(() => setLoading(false));
    };

    const handleEdit = () => {
        setLoading(true);
        axios
            .put(`/api/finished-good/update/${current.id}`, {
                ...current,
                quantity: +current.quantity,
                total_amount: +current.total_amount,
                unit_id: +current.unit_id,
            })
            .then(r => {
                setGoods(g => g.map(x => (x.id === r.data.id ? r.data : x)));
                setEditOpen(false);
                showSnackbar("Изменено");
            })
            .catch(err => showSnackbar("Ошибка: " + err.message, "error"))
            .finally(() => setLoading(false));
    };

    const handleDelete = () => {
        setLoading(true);
        axios
            .delete(`/api/finished-good/delete/${current.id}`)
            .then(() => {
                setGoods(g => g.filter(x => x.id !== current.id));
                setDeleteOpen(false);
                showSnackbar("Удалено");
            })
            .catch(err => showSnackbar("Ошибка: " + err.message, "error"))
            .finally(() => setLoading(false));
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ color: "#ffffff", marginTop: "10%" }}>
                {/* Заголовок и кнопка */}
                <Box sx={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center", mb: 2
                }}>
                    <Typography variant="h4" color="#000">Готовая продукция</Typography>
                    <Tooltip
                        title="Добавить"
                        placement="right"
                        slotProps={{ tooltip: { sx: { fontSize: 14, p: "10px 14px", bgcolor: "#2a2a2a", color: "#fff", border: "1px solid #646cff", borderRadius: 1 } } }}
                    >
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
                                <TableCell sx={tableHeadCellStyle}>Количество</TableCell>
                                <TableCell sx={tableHeadCellStyle}>Общая сумма</TableCell>
                                <TableCell sx={tableHeadCellStyle}>Единица</TableCell>
                                <TableCell sx={tableHeadCellStyle}>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {goods.length === 0 && !loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={tableBodyCellStyle}>
                                        Нет данных
                                    </TableCell>
                                </TableRow>
                            ) : goods.map(g => (
                                <TableRow key={g.id}>
                                    <TableCell sx={tableBodyCellStyle}>{g.name}</TableCell>
                                    <TableCell sx={tableBodyCellStyle}>{g.quantity}</TableCell>
                                    <TableCell sx={tableBodyCellStyle}>{g.total_amount}</TableCell>
                                    <TableCell sx={tableBodyCellStyle}>
                                        {units.find(u => u.id === g.unit_id)?.name}
                                    </TableCell>
                                    <TableCell sx={tableBodyCellStyle}>
                                        <Tooltip title="Редактировать" placement="top" slotProps={{
                                            tooltip: { sx: { fontSize: 14, p: "10px 14px", bgcolor: "#2a2a2a", color: "#fff", border: "1px solid #646cff", borderRadius: 1 } }
                                        }}>
                                            <Button
                                                variant="text" size="small"
                                                sx={{ minWidth: 0, mr: 1 }}
                                                onClick={() => {
                                                    setCurrent({
                                                        id: g.id,
                                                        name: g.name,
                                                        quantity: g.quantity.toString(),
                                                        total_amount: g.total_amount.toString(),
                                                        unit_id: g.unit_id.toString(),
                                                    });
                                                    setEditOpen(true);
                                                }}
                                            >
                                                <img src={PenIcon} alt="Ред." width={20} height={20} />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title="Удалить" placement="top" slotProps={{
                                            tooltip: { sx: { fontSize: 14, p: "10px 14px", bgcolor: "#2a2a2a", color: "#fff", border: "1px solid #646cff", borderRadius: 1 } }
                                        }}>
                                            <Button
                                                variant="text" size="small" color="error"
                                                sx={{ minWidth: 0 }}
                                                onClick={() => {
                                                    setCurrent(g);
                                                    setDeleteOpen(true);
                                                }}
                                            >
                                                <img src={TrashIcon} alt="Del" width={20} height={20} />
                                            </Button>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Создать */}
                <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle sx={{ bgcolor: "#1e1e1e", color: "#fff" }}>Создать запись</DialogTitle>
                    <DialogContent sx={{ bgcolor: "#1e1e1e", color: "#fff" }}>
                        <TextField
                            fullWidth select margin="dense" label="Единица"
                            name="unit_id"
                            value={form.unit_id}
                            onChange={handleChange}
                            sx={selectWhiteStyle}
                            required
                        >
                            <MenuItem value="">-- выберите --</MenuItem>
                            {units.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
                        </TextField>
                        <TextField
                            fullWidth margin="dense" label="Название"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            sx={inputStyle}
                            required
                        />
                        <TextField
                            fullWidth margin="dense" label="Количество"
                            name="quantity" type="number"
                            value={form.quantity}
                            onChange={handleChange}
                            sx={inputStyle}
                            required
                        />
                        <TextField
                            fullWidth margin="dense" label="Общая сумма"
                            name="total_amount" type="number"
                            value={form.total_amount}
                            onChange={handleChange}
                            sx={inputStyle}
                            required
                        />
                    </DialogContent>
                    <DialogActions sx={{ bgcolor: "#1e1e1e" }}>
                        <Button onClick={() => setCreateOpen(false)}>Отмена</Button>
                        <Button onClick={handleCreate} variant="contained" disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : "Создать"}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Редактировать */}
                <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle sx={{ bgcolor: "#1e1e1e", color: "#fff" }}>Редактировать</DialogTitle>
                    <DialogContent sx={{ bgcolor: "#1e1e1e", color: "#fff" }}>
                        <TextField
                            fullWidth margin="dense" label="Название"
                            value={current?.name || ""}
                            onChange={e => setCurrent(c => ({ ...c, name: e.target.value }))}
                            sx={inputStyle}
                        />
                        <TextField
                            fullWidth margin="dense" label="Количество" type="number"
                            value={current?.quantity || ""}
                            onChange={e => setCurrent(c => ({ ...c, quantity: e.target.value }))}
                            sx={inputStyle}
                        />
                        <TextField
                            fullWidth margin="dense" label="Общая сумма" type="number"
                            value={current?.total_amount || ""}
                            onChange={e => setCurrent(c => ({ ...c, total_amount: e.target.value }))}
                            sx={inputStyle}
                        />
                        <TextField
                            fullWidth select margin="dense" label="Единица"
                            value={current?.unit_id || ""}
                            onChange={e => setCurrent(c => ({ ...c, unit_id: e.target.value }))}
                            sx={selectWhiteStyle}
                        >
                            {units.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
                        </TextField>
                    </DialogContent>
                    <DialogActions sx={{ bgcolor: "#1e1e1e" }}>
                        <Button onClick={() => setEditOpen(false)}>Отмена</Button>
                        <Button onClick={handleEdit} variant="contained" disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : "Сохранить"}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Удалить */}
                <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} fullWidth maxWidth="xs">
                    <DialogTitle sx={{ bgcolor: "#1e1e1e", color: "#fff" }}>Удалить запись?</DialogTitle>
                    <DialogActions sx={{ bgcolor: "#1e1e1e" }}>
                        <Button color="error" onClick={handleDelete}>Удалить</Button>
                        <Button onClick={() => setDeleteOpen(false)}>Отмена</Button>
                    </DialogActions>
                </Dialog>

                {/* Уведомления */}
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
