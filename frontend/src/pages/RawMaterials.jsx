import React, { useState, useEffect } from "react";
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
    tableHeadCellStyle,
    tableBodyCellStyle, glassTableStyle
} from '../theme/uiStyles.js';

import { useApi } from '../hooks/useApi';
import { useNotifier } from '../hooks/useNotifier';
import { useFormWithLoading } from '../hooks/useFormWithLoading';
import RawMaterialForm from "../components/forms/RawMaterialForm.jsx";

export default function RawMaterialsPage() {
    const [rawMaterials, setRawMaterials] = useState([]);
    const [units, setUnits] = useState([]);

    const [form, setForm] = useState({
        name: "", quantity: "", total_amount: "", unit_id: ""
    });
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [current, setCurrent] = useState(null);

    const api = useApi();
    const { show, snackbarProps, alertProps } = useNotifier();
    const { loading, wrap } = useFormWithLoading();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        await wrap(async () => {
            const [raws, unitList] = await Promise.all([
                api.get("/api/raw-materials"),
                api.get("/api/units")
            ]);
            setRawMaterials(raws);
            setUnits(unitList);
        });
    };

    const handleFormChange = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleCreate = async () => {
        const { name, quantity, total_amount, unit_id } = form;
        if (!name || !quantity || !total_amount || !unit_id) {
            show("Заполните все поля", "error");
            return;
        }

        await wrap(async () => {
            await api.post("/api/raw-material/create", {
                name,
                quantity: +quantity,
                total_amount: +total_amount,
                unit_id: +unit_id
            });
            show("Сырьё добавлено");
            setCreateOpen(false);
            setForm({ name: "", quantity: "", total_amount: "", unit_id: "" });
            await loadData();
        });
    };

    const handleEdit = async () => {
        if (!current.name || !current.quantity || !current.total_amount || !current.unit_id) {
            show("Заполните все поля", "error");
            return;
        }

        await wrap(async () => {
            await api.put(`/api/raw-material/update/${current.id}`, {
                name: current.name,
                quantity: +current.quantity,
                total_amount: +current.total_amount,
                unit_id: +current.unit_id
            });
            show("Изменено");
            setEditOpen(false);
            await loadData();
        });
    };

    const handleDelete = async () => {
        await wrap(async () => {
            await api.del(`/api/raw-material/delete/${current.id}`);
            show("Удалено");
            setDeleteOpen(false);
            await loadData();
        });
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ color: "#fff", marginTop: "10%" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Typography variant="h4" color="#000">Сырьё</Typography>
                    <Tooltip title="Добавить сырьё" placement="right" slotProps={{
                        tooltip: {
                            sx: {
                                fontSize: 14, p: "10px 14px", bgcolor: "#2a2a2a",
                                color: "#fff", border: "1px solid #646cff", borderRadius: 1
                            }
                        }
                    }}>
                        <span>
                            <Button variant="contained" onClick={() => setCreateOpen(true)} disabled={loading}
                                    sx={{ p: 1, minWidth: 40, borderRadius: 1 }}>
                                <img src={PlusIcon} alt="Добавить" width={24} height={24} />
                            </Button>
                        </span>
                    </Tooltip>
                </Box>

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
                                    <TableCell colSpan={5} align="center" sx={tableBodyCellStyle}>Нет данных</TableCell>
                                </TableRow>
                            ) : rawMaterials.map(rm => (
                                <TableRow key={rm.id}>
                                    <TableCell sx={tableBodyCellStyle}>{rm.name}</TableCell>
                                    <TableCell sx={tableBodyCellStyle}>{rm.quantity}</TableCell>
                                    <TableCell sx={tableBodyCellStyle}>
                                        {rm.total_amount.toFixed(2)}
                                    </TableCell>                                    <TableCell sx={tableBodyCellStyle}>
                                        {units.find(u => u.id === rm.unit_id)?.name}
                                    </TableCell>
                                    <TableCell sx={tableBodyCellStyle}>
                                        <Tooltip title="Редактировать" placement="top" slotProps={{
                                            tooltip: {
                                                sx: {
                                                    fontSize: 14, p: "10px 14px", bgcolor: "#2a2a2a",
                                                    color: "#fff", border: "1px solid #646cff", borderRadius: 1
                                                }
                                            }
                                        }}>
                                            <Button size="small" sx={{ minWidth: 0, mr: 1 }}
                                                    onClick={() => {
                                                        setCurrent({
                                                            ...rm,
                                                            quantity: rm.quantity.toString(),
                                                            total_amount: rm.total_amount.toString(),
                                                            unit_id: rm.unit_id.toString()
                                                        });
                                                        setEditOpen(true);
                                                    }}>
                                                <img src={PenIcon} alt="Ред." width={20} height={20} />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title="Удалить" placement="top" slotProps={{
                                            tooltip: {
                                                sx: {
                                                    fontSize: 14, p: "10px 14px", bgcolor: "#2a2a2a",
                                                    color: "#fff", border: "1px solid #646cff", borderRadius: 1
                                                }
                                            }
                                        }}>
                                            <Button size="small" color="error" sx={{ minWidth: 0 }}
                                                    onClick={() => {
                                                        setCurrent(rm);
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

                {/* Создание */}
                <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
                    <RawMaterialForm
                        title="Создать сырьё"
                        values={form}
                        units={units}
                        onChange={handleFormChange}
                        onSubmit={handleCreate}
                        onCancel={() => setCreateOpen(false)}
                        loading={loading}
                    />
                </Dialog>


                {/* Редактирование */}
                <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
                    <RawMaterialForm
                        title="Редактировать сырьё"
                        values={current}
                        units={units}
                        onChange={e => setCurrent(c => ({ ...c, [e.target.name]: e.target.value }))}
                        onSubmit={handleEdit}
                        onCancel={() => setEditOpen(false)}
                        loading={loading}
                    />
                </Dialog>


                {/* Удаление */}
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
