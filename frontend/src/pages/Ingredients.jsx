// src/pages/IngredientsPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { theme } from '../theme/theme.jsx';
import {
    Box, Button, TextField, MenuItem, Typography,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Table, TableHead, TableRow, TableCell, TableBody,
    TableContainer, Paper, Tooltip, Snackbar, Alert,
    CircularProgress, ThemeProvider
} from "@mui/material";
import PenIcon from "../assets/pen-svgrepo-com.svg";
import TrashIcon from "../assets/trash-svgrepo-com.svg";
import PlusIcon from "../assets/plus-svgrepo-com.svg";

// 🎨 Стили
const modalStyle = {
    position: "absolute", top: "50%", left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "#1e1e1e", color: "#fff",
    boxShadow: 24, p: 4, borderRadius: 2, minWidth: 300,
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

const selectWhiteStyleForDropper = {
    "& label": { color: "#000000" },
    "& label.Mui-focused": { color: "#646cff" },
    "& .MuiOutlinedInput-root": {
        backgroundColor: "none",
        "& fieldset": { borderColor: "#ccc" },
        "&:hover fieldset": { borderColor: "#888" },
        "&.Mui-focused fieldset": { borderColor: "#646cff" },
        "& .MuiSelect-select": { color: "#000000" },
        "& .MuiSvgIcon-root": { color: "#fff" },
    },
};
const selectWhiteStyle = {
    "& label": { color: "#ffffff" },
    "& label.Mui-focused": { color: "#646cff" },
    "& .MuiOutlinedInput-root": {
        backgroundColor: "none",
        "& fieldset": { borderColor: "#ccc" },
        "&:hover fieldset": { borderColor: "#888" },
        "&.Mui-focused fieldset": { borderColor: "#646cff" },
        "& .MuiSelect-select": { color: "#ffffff" },
        "& .MuiSvgIcon-root": { color: "#fff" },
    },
};

const tableHeadCellStyle = {
    color: "#fff", backgroundColor: "#6F1A07", fontSize: "20px"
};

const tableBodyCellStyle = {
    color: "#3d3d3d", fontSize: "20px", backgroundColor: "#B3B6B7"
};

const glowColorPrimary = "rgba(182,186,241,0.24)";
const glowColorSecondary = "#646cff1a";
const glassTableStyle = {
    backgroundColor: "rgba(0,0,0,0.05)",
    backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
    boxShadow: `0 0 20px ${glowColorPrimary}, 0 0 60px ${glowColorSecondary}`,
    borderRadius: "12px", overflow: "hidden",
};



export default function IngredientsPage() {
    const [ingredients, setIngredients] = useState([]);
    const [products, setProducts] = useState([]);
    const [rawMaterials, setRawMaterials] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState("");
    const [availableMaterials, setAvailableMaterials] = useState([]);

    const [form, setForm] = useState({
        product_id: "", raw_material_id: "", quantity: ""
    });
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [currentEdit, setCurrentEdit] = useState(null);

    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    const showSnackbar = (msg, sev = "success") => {
        setSnackbarMsg(msg);
        setSnackbarSeverity(sev);
        setSnackbarOpen(true);
    };

    // Загрузка данных
    useEffect(() => {
        setLoading(true);
        axios.get("/api/ingredients")
            .then(r => {
                const { finishedGoods, ingredients, rawMaterials } = r.data;
                setProducts(finishedGoods);
                setIngredients(ingredients);
                setRawMaterials(rawMaterials);
                if (finishedGoods.length) {
                    setSelectedProduct(finishedGoods[0].id);
                    setForm(f => ({ ...f, product_id: finishedGoods[0].id }));
                }
            })
            .catch(e => showSnackbar("Ошибка загрузки: " + e.message, "error"))
            .finally(() => setLoading(false));
    }, []);

    // Смена продукта
    useEffect(() => {
        setForm(f => ({ ...f, product_id: selectedProduct }));
        const used = ingredients
            .filter(i => i.product_id === selectedProduct)
            .map(i => i.raw_material_id);
        setAvailableMaterials(
            rawMaterials.filter(rm => !used.includes(rm.id))
        );
    }, [selectedProduct, ingredients, rawMaterials]);

    const handleFormChange = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    // Создать
    const handleCreate = async () => {
        if (!form.raw_material_id || !form.quantity) {
            return showSnackbar("Заполните все поля", "error");
        }
        setLoading(true);
        try {
            await axios.post("/api/ingredient/create", {
                product_id: +form.product_id,
                raw_material_id: +form.raw_material_id,
                quantity: +form.quantity,
            });
            // обновляем список
            const r = await axios.get("/api/ingredients");
            setIngredients(r.data.ingredients);
            setRawMaterials(r.data.rawMaterials);
            setProducts(r.data.finishedGoods);
            setForm(f => ({ ...f, raw_material_id: "", quantity: "" }));
            setCreateOpen(false);
            showSnackbar("Ингредиент добавлен");
        } catch (e) {
            showSnackbar("Ошибка: " + e.message, "error");
        } finally {
            setLoading(false);
        }
    };

    // Сохранить редактирование
    const handleEditSave = () => {
        setLoading(true);
        axios.put(`/api/ingredient/update/${currentEdit.id}`, {
            quantity: +currentEdit.quantity
        })
            .then(r => {
                setIngredients(prev =>
                    prev.map(i => i.id === r.data.id ? r.data : i)
                );
                setEditOpen(false);
                showSnackbar("Изменено");
            })
            .catch(e => showSnackbar("Ошибка: " + e.message, "error"))
            .finally(() => setLoading(false));
    };

    // Удалить
    const handleDelete = () => {
        setLoading(true);
        axios.delete(`/api/ingredient/delete/${currentEdit.id}`)
            .then(() => {
                setIngredients(prev =>
                    prev.filter(i => i.id !== currentEdit.id)
                );
                setDeleteOpen(false);
                showSnackbar("Удалено");
            })
            .catch(e => showSnackbar("Ошибка: " + e.message, "error"))
            .finally(() => setLoading(false));
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ color: "#fff",pt:5,pl:5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between',alignItems:'center', mb: 2   }}>
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
                    <Box sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2
                    }}>

                        <Tooltip
                            title={
                                availableMaterials.length === 0
                                    ? "Все возможные ингредиенты уже добавлены"
                                    : "Добавить ингредиент"
                            }
                            placement="right"
                            slotProps={{
                                tooltip: {
                                    sx: {
                                        fontSize: 14, p: "10px 14px", bgcolor: "#2a2a2a",
                                        color: "#fff", border: "1px solid #646cff", borderRadius: 1
                                    }
                                }
                            }}
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
                            {ingredients.filter(i => i.product_id === selectedProduct)
                                .map(i => (
                                    <TableRow key={i.id}>
                                        <TableCell sx={tableBodyCellStyle}>
                                            {i.raw_material.name}
                                        </TableCell>
                                        <TableCell sx={tableBodyCellStyle}>{i.quantity}</TableCell>
                                        <TableCell sx={tableBodyCellStyle}>
                                            <Tooltip title="Редактировать" placement="top"
                                                     slotProps={{ tooltip: { sx: { fontSize: 14, p: "10px 14px", bgcolor: "#2a2a2a", color: "#fff", border: "1px solid #646cff", borderRadius: 1 } } }}
                                            >
                                                <Button
                                                    variant="text" size="small"
                                                    sx={{ minWidth: 0, mr: 1 }}
                                                    onClick={() => {
                                                        setCurrentEdit({
                                                            id: i.id,
                                                            quantity: i.quantity.toString()
                                                        });
                                                        setEditOpen(true);
                                                    }}
                                                >
                                                    <img src={PenIcon} alt="Ред." width={20} height={20} />
                                                </Button>
                                            </Tooltip>
                                            <Tooltip title="Удалить" placement="top"
                                                     slotProps={{ tooltip: { sx: { fontSize: 14, p: "10px 14px", bgcolor: "#2a2a2a", color: "#fff", border: "1px solid #646cff", borderRadius: 1 } } }}
                                            >
                                                <Button
                                                    variant="text" size="small" color="error"
                                                    sx={{ minWidth: 0 }}
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
                                ))
                            }
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* CREATE */}
                <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle sx={modalStyle}>Добавить ингредиент</DialogTitle>
                    <DialogContent sx={{ bgcolor: "#1e1e1e", color: "#fff" }}>
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
                    <DialogTitle sx={modalStyle}>Редактировать количество</DialogTitle>
                    <DialogContent sx={{ bgcolor: "#1e1e1e", color: "#fff" }}>
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
                    <DialogTitle sx={modalStyle}>Удалить запись?</DialogTitle>
                    <DialogActions sx={{ bgcolor: "#1e1e1e" }}>
                        <Button color="error" onClick={handleDelete} disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : "Удалить"}
                        </Button>
                        <Button onClick={() => setDeleteOpen(false)}>Отмена</Button>
                    </DialogActions>
                </Dialog>

                {/* SNACKBAR */}
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
