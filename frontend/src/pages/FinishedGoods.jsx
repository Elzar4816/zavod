import React, { useState, useEffect } from "react";
import {
    Box, Button, TextField, MenuItem, Typography,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Table, TableHead, TableRow, TableCell, TableBody,
    TableContainer, Paper, Tooltip, Snackbar, Alert,
    CircularProgress, ThemeProvider
} from "@mui/material";
import PlusIcon from "@assets/plus-svgrepo-com.svg";
import PenIcon from "@assets/pen-svgrepo-com.svg";
import TrashIcon from "@assets/trash-svgrepo-com.svg";
import { theme } from '@theme/theme.jsx';
import {
    inputStyle,
    selectWhiteStyle,
    tableHeadCellStyle,
    tableBodyCellStyle,
    glassTableStyle,
} from '@theme/uiStyles';
import { useApi } from '@hooks/useApi';
import { useNotifier } from '@hooks/useNotifier';
import { useFormWithLoading } from '@hooks/useFormWithLoading';

export default function FinishedGoodsPage() {
    const api = useApi();
    const { show, snackbarProps, alertProps } = useNotifier();
    const { loading, wrap } = useFormWithLoading();

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

    // Load data
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        await wrap(async () => {
            const [goodsData, unitsData] = await Promise.all([
                api.get("/api/finished-goods"),
                api.get("/api/units"),
            ]);
            setGoods(goodsData);
            setUnits(unitsData);
        });
    };

    // Handle form changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    // Create
    const handleCreate = async () => {
        const { name, quantity, total_amount, unit_id } = form;
        if (!name || !quantity || !total_amount || !unit_id) {
            show("Заполните все поля", "error");
            return;
        }

        await wrap(async () => {
            await api.post("/api/finished-good/create", {
                name,
                quantity: Number(quantity),
                total_amount: Number(total_amount),
                unit_id: Number(unit_id),
            });
            show("Успешно создано", "success");
            setForm({ name: "", quantity: "", total_amount: "", unit_id: "" });
            setCreateOpen(false);
            await loadData();
        });
    };

    // Edit
    const handleEdit = async () => {
        const { id, name, quantity, total_amount, unit_id } = current;
        if (!name || !quantity || !total_amount || !unit_id) {
            show("Заполните все поля", "error");
            return;
        }

        await wrap(async () => {
            await api.put(`/api/finished-good/update/${id}`, {
                name,
                quantity: Number(quantity),
                total_amount: Number(total_amount),
                unit_id: Number(unit_id),
            });
            show("Изменено", "success");
            setEditOpen(false);
            await loadData();
        });
    };

    // Delete
    const handleDelete = async () => {
        const { id } = current;
        await wrap(async () => {
            await api.del(`/api/finished-good/delete/${id}`);
            show("Удалено", "success");
            setDeleteOpen(false);
            await loadData();
        });
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ color: "#fff", mt: 5, px: 5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h4" color="#000">
                        Готовая продукция
                    </Typography>
                    <Tooltip title="Добавить" placement="right">
            <span>
              <Button
                  variant="contained"
                  onClick={() => setCreateOpen(true)}
                  disabled={loading}
                  sx={{ p: 1, minWidth: 40, borderRadius: 1 }}
              >
                <img src={PlusIcon} alt="Добавить" width={24} height={24} />
              </Button>
            </span>
                    </Tooltip>
                </Box>

                <TableContainer component={Paper} sx={glassTableStyle} elevation={10}>
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
                            {goods.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={tableBodyCellStyle}>
                                        Нет данных
                                    </TableCell>
                                </TableRow>
                            ) : (
                                goods.map((g) => (
                                    <TableRow key={g.id}>
                                        <TableCell sx={tableBodyCellStyle}>{g.name}</TableCell>
                                        <TableCell sx={tableBodyCellStyle}>{g.quantity}</TableCell>
                                        <TableCell sx={tableBodyCellStyle}>{g.total_amount.toFixed(2)}</TableCell>
                                        <TableCell sx={tableBodyCellStyle}>
                                            {units.find((u) => u.id === g.unit_id)?.name}
                                        </TableCell>
                                        <TableCell sx={tableBodyCellStyle}>
                                            <Tooltip title="Редактировать" placement="top">
                                                <Button
                                                    size="small"
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
                                            <Tooltip title="Удалить" placement="top">
                                                <Button
                                                    size="small"
                                                    color="error"
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
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Create Dialog */}
                <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle sx={{ bgcolor: "#1e1e1e", color: "#fff" }}>Создать запись</DialogTitle>
                    <DialogContent sx={{ bgcolor: "#1e1e1e" }}>

                        <TextField
                            fullWidth
                            margin="dense"
                            label="Название"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            sx={inputStyle}
                            required
                        />
                        <TextField
                            select
                            fullWidth
                            margin="dense"
                            label="Единица"
                            name="unit_id"
                            value={form.unit_id}
                            onChange={handleChange}
                            sx={selectWhiteStyle}
                            required
                        >
                            <MenuItem value="">-- выберите --</MenuItem>
                            {units.map((u) => (
                                <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            fullWidth
                            margin="dense"
                            label="Количество"
                            type="number"
                            name="quantity"
                            value={form.quantity}
                            onChange={handleChange}
                            sx={inputStyle}
                            required
                        />
                        <TextField
                            fullWidth
                            margin="dense"
                            label="Общая сумма"
                            type="number"
                            name="total_amount"
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

                {/* Edit Dialog */}
                <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle sx={{ bgcolor: "#1e1e1e", color: "#fff" }}>Редактировать</DialogTitle>
                    <DialogContent sx={{ bgcolor: "#1e1e1e" }}>
                        <TextField
                            fullWidth
                            margin="dense"
                            label="Название"
                            value={current?.name || ""}
                            onChange={(e) => setCurrent((c) => ({ ...c, name: e.target.value }))}
                            sx={inputStyle}
                        />
                        <TextField
                            fullWidth
                            margin="dense"
                            label="Количество"
                            type="number"
                            value={current?.quantity || ""}
                            onChange={(e) => setCurrent((c) => ({ ...c, quantity: e.target.value }))}
                            sx={inputStyle}
                        />
                        <TextField
                            fullWidth
                            margin="dense"
                            label="Общая сумма"
                            type="number"
                            value={current?.total_amount || ""}
                            onChange={(e) => setCurrent((c) => ({ ...c, total_amount: e.target.value }))}
                            sx={inputStyle}
                        />
                        <TextField
                            select
                            fullWidth
                            margin="dense"
                            label="Единица"
                            value={current?.unit_id || ""}
                            onChange={(e) => setCurrent((c) => ({ ...c, unit_id: e.target.value }))}
                            sx={selectWhiteStyle}
                        >
                            {units.map((u) => (
                                <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
                            ))}
                        </TextField>
                    </DialogContent>
                    <DialogActions sx={{ bgcolor: "#1e1e1e" }}>
                        <Button onClick={() => setEditOpen(false)}>Отмена</Button>
                        <Button onClick={handleEdit} variant="contained" disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : "Сохранить"}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Dialog */}
                <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} fullWidth maxWidth="xs">
                    <DialogTitle sx={{ bgcolor: "#1e1e1e", color: "#fff" }}>Удалить запись?</DialogTitle>
                    <DialogActions sx={{ bgcolor: "#1e1e1e" }}>
                        <Button color="error" onClick={handleDelete} disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : "Удалить"}
                        </Button>
                        <Button onClick={() => setDeleteOpen(false)}>Отмена</Button>
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
