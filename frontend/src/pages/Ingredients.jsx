import React, { useState, useEffect } from "react";
import {
    Box, Button, TextField, MenuItem, Typography,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Table, TableHead, TableRow, TableCell, TableBody,
    TableContainer, Paper, Tooltip, Snackbar, Alert,
    CircularProgress, ThemeProvider
} from "@mui/material";
import PenIcon from "@assets/pen-svgrepo-com.svg";
import TrashIcon from "@assets/trash-svgrepo-com.svg";
import PlusIcon from "@assets/plus-svgrepo-com.svg";
import { theme } from '@theme/theme.jsx';
import {
    inputStyle, selectWhiteStyle, tableHeadCellStyle, tableBodyCellStyle,
    glassTableStyle, selectWhiteStyleForDropper, modalStyle
} from '@theme/uiStyles.js';
import { useApi } from '@hooks/useApi';
import { useNotifier } from '@hooks/useNotifier';
import { useFormWithLoading } from '@hooks/useFormWithLoading';

export default function IngredientsPage() {
    const [ingredients, setIngredients] = useState([]);
    const [products, setProducts] = useState([]);
    const [rawMaterials, setRawMaterials] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState("");
    const [availableMaterials, setAvailableMaterials] = useState([]);

    const [form, setForm] = useState({ product_id: "", raw_material_id: "", quantity: "" });
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [currentEdit, setCurrentEdit] = useState(null);

    const api = useApi();
    const { show, snackbarProps, alertProps } = useNotifier();
    const { loading, wrap } = useFormWithLoading();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        await wrap(async () => {
            const data = await api.get("/api/ingredients");
            setProducts(data.finishedGoods);
            setIngredients(data.ingredients);
            setRawMaterials(data.rawMaterials);
            if (data.finishedGoods.length) {
                const firstId = data.finishedGoods[0].id;
                setSelectedProduct(firstId);
                setForm(f => ({ ...f, product_id: firstId }));
            }
        });
    };

    useEffect(() => {
        setForm(f => ({ ...f, product_id: selectedProduct }));
        const used = ingredients.filter(i => i.product_id === selectedProduct).map(i => i.raw_material_id);
        setAvailableMaterials(rawMaterials.filter(rm => !used.includes(rm.id)));
    }, [selectedProduct, ingredients, rawMaterials]);

    const handleFormChange = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleCreate = async () => {
        if (!form.raw_material_id || !form.quantity) {
            show("Заполните все поля", "error");
            return;
        }
        await wrap(async () => {
            await api.post("/api/ingredient/create", {
                product_id: +form.product_id,
                raw_material_id: +form.raw_material_id,
                quantity: +form.quantity,
            });
            show("Ингредиент добавлен");
            setCreateOpen(false);
            setForm(f => ({ ...f, raw_material_id: "", quantity: "" }));
            await loadData();
        });
    };

    const handleEditSave = async () => {
        await wrap(async () => {
            await api.put(`/api/ingredient/update/${currentEdit.id}`, {
                quantity: +currentEdit.quantity
            });
            show("Изменено");
            setEditOpen(false);
            await loadData();
        });
    };

    const handleDelete = async () => {
        await wrap(async () => {
            await api.del(`/api/ingredient/delete/${currentEdit.id}`);
            show("Удалено");
            setDeleteOpen(false);
            await loadData();
        });
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ color: "#fff", pt: 5, pl: 5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" color="#000">Ингредиенты</Typography>
                </Box>

                {/* Фильтр по продукту */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
                    <TextField
                        select label="Продукт"
                        value={selectedProduct ?? ""}
                        onChange={e => setSelectedProduct(+e.target.value)}
                        sx={{ ...selectWhiteStyleForDropper, minWidth: 200 }}
                    >
                        {products.map(p => (
                            <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                        ))}
                    </TextField>
                    <Tooltip
                        title={availableMaterials.length === 0 ? "Все ингредиенты добавлены" : "Добавить ингредиент"}
                        placement="right"
                        slotProps={{ tooltip: { sx: { fontSize: 14, p: "10px 14px", bgcolor: "#2a2a2a", color: "#fff", border: "1px solid #646cff", borderRadius: 1 } } }}
                    >
                        <span>
                            <Button
                                variant="contained"
                                onClick={() => setCreateOpen(true)}
                                disabled={availableMaterials.length === 0}
                                sx={{ p: 1, minWidth: 40, borderRadius: 1 }}
                            >
                                <img src={PlusIcon} alt="Добавить" width={24} height={24} />
                            </Button>
                        </span>
                    </Tooltip>
                </Box>

                {/* Таблица */}
                <TableContainer component={Paper} sx={glassTableStyle} elevation={10}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={tableHeadCellStyle}>Сырьё</TableCell>
                                <TableCell sx={tableHeadCellStyle}>Количество</TableCell>
                                <TableCell sx={tableHeadCellStyle}>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {ingredients.filter(i => i.product_id === selectedProduct).map(i => (
                                <TableRow key={i.id}>
                                    <TableCell sx={tableBodyCellStyle}>{i.raw_material.name}</TableCell>
                                    <TableCell sx={tableBodyCellStyle}>{i.quantity}</TableCell>
                                    <TableCell sx={tableBodyCellStyle}>
                                        <Tooltip title="Редактировать" placement="top" slotProps={{
                                            tooltip: {
                                                sx: {
                                                    fontSize: 14,
                                                    p: "10px 14px",
                                                    bgcolor: "#2a2a2a",
                                                    color: "#fff",
                                                    border: "1px solid #646cff",
                                                    borderRadius: 1
                                                }
                                            }
                                        }}>
                                            <Button
                                                variant="text" size="small" sx={{ minWidth: 0, mr: 1 }}
                                                onClick={() => {
                                                    setCurrentEdit({ id: i.id, quantity: i.quantity.toString() });
                                                    setEditOpen(true);
                                                }}
                                            >
                                                <img src={PenIcon} alt="Ред." width={20} height={20} />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title="Удалить" placement="top" slotProps={{
                                            tooltip: {
                                                sx: {
                                                    fontSize: 14,
                                                    p: "10px 14px",
                                                    bgcolor: "#2a2a2a",
                                                    color: "#fff",
                                                    border: "1px solid #646cff",
                                                    borderRadius: 1
                                                }
                                            }
                                        }}>
                                            <Button
                                                variant="text" size="small" color="error" sx={{ minWidth: 0 }}
                                                onClick={() => {
                                                    setCurrentEdit(i);
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

                {/* CREATE */}
                <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle sx={modalStyle}>Добавить ингредиент</DialogTitle>
                    <DialogContent sx={{ bgcolor: "#1e1e1e" }}>
                        <TextField
                            select fullWidth margin="dense" label="Сырьё"
                            name="raw_material_id"
                            value={form.raw_material_id}
                            onChange={handleFormChange}
                            sx={selectWhiteStyle}
                        >
                            {availableMaterials.map(rm => (
                                <MenuItem key={rm.id} value={rm.id}>{rm.name}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            fullWidth margin="dense" label="Количество" type="number"
                            name="quantity"
                            value={form.quantity}
                            onChange={handleFormChange}
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

                {/* EDIT */}
                <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle sx={{ bgcolor: "#1e1e1e", color: "#fff" }}>Редактировать количество</DialogTitle>
                    <DialogContent sx={{ bgcolor: "#1e1e1e" }}>
                        <TextField
                            fullWidth margin="dense" label="Количество" type="number"
                            value={currentEdit?.quantity || ""}
                            onChange={e => setCurrentEdit(c => ({ ...c, quantity: e.target.value }))}
                            sx={inputStyle}
                        />
                    </DialogContent>
                    <DialogActions sx={{ bgcolor: "#1e1e1e" }}>
                        <Button onClick={() => setEditOpen(false)}>Отмена</Button>
                        <Button onClick={handleEditSave} variant="contained" disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : "Сохранить"}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* DELETE */}
                <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} fullWidth maxWidth="xs">
                    <DialogTitle sx={{ bgcolor: "#1e1e1e", color: "#fff" }}>Удалить запись?</DialogTitle>
                    <DialogActions sx={{ bgcolor: "#1e1e1e" }}>
                        <Button color="error" onClick={handleDelete} disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : "Удалить"}
                        </Button>
                        <Button onClick={() => setDeleteOpen(false)}>Отмена</Button>
                    </DialogActions>
                </Dialog>

                {/* SNACKBAR */}
                <Snackbar {...snackbarProps}>
                    <Alert {...alertProps} onClose={snackbarProps.onClose}>
                        {alertProps.children}
                    </Alert>
                </Snackbar>
            </Box>
        </ThemeProvider>
    );
}
