import React, { useEffect, useState } from "react";
import {
    Box, Button, Typography,
    Table, TableHead, TableRow, TableCell, TableBody,
    TableContainer, Paper, Dialog, DialogTitle,
    DialogActions, Tooltip,
    Snackbar, Alert, CircularProgress,
    ThemeProvider
} from "@mui/material";
import PlusIcon from "../assets/plus-svgrepo-com.svg";
import PenIcon from "../assets/pen-svgrepo-com.svg";
import TrashIcon from "../assets/trash-svgrepo-com.svg";
import { theme } from '../theme/theme.jsx';
import {tableHeadCellStyle, tableBodyCellStyle, glassTableStyle} from '../theme/uiStyles.js';
import { useApi } from '../hooks/useApi';
import { useNotifier } from '../hooks/useNotifier';
import { useFormWithLoading } from '../hooks/useFormWithLoading';
import UnitForm from "../components/forms/UnitForm.jsx";

export default function UnitsPage() {
    const [units, setUnits] = useState([]);
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [editId, setEditId] = useState(null);
    const [editName, setEditName] = useState("");

    const api = useApi();
    const { show, snackbarProps, alertProps } = useNotifier();
    const { loading, wrap } = useFormWithLoading();

    useEffect(() => {
        loadUnits();
    }, []);

    const loadUnits = async () => {
        await wrap(async () => {
            const data = await api.get("/api/units");
            setUnits(data);
        });
    };

    const handleCreate = async () => {
        if (!newName.trim()) {
            show("Введите название", "error");
            return;
        }
        await wrap(async () => {
            await api.post("/api/units/create", { name: newName });
            show("Единица создана");
            setNewName("");
            setCreateOpen(false);
            await loadUnits();
        });
    };

    const handleEdit = async () => {
        if (!editName.trim()) {
            show("Введите название", "error");
            return;
        }
        await wrap(async () => {
            await api.put(`/api/units/update/${editId}`, { name: editName });
            show("Изменено");
            setEditOpen(false);
            await loadUnits();
        });
    };

    const handleDelete = async () => {
        await wrap(async () => {
            await api.del(`/api/units/delete/${editId}`);
            show("Удалено");
            setDeleteOpen(false);
            await loadUnits();
        });
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ color: "#ffffff", marginTop: "10%" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h4" color="#000">Единицы измерения</Typography>
                    <Tooltip title="Добавить единицу" placement="right" slotProps={{
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
                        <span>
                            <Button variant="contained" onClick={() => setCreateOpen(true)} sx={{ p: 1, minWidth: 40, borderRadius: 1 }}>
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
                                <TableCell sx={tableHeadCellStyle}>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {units.length === 0 && !loading ? (
                                <TableRow>
                                    <TableCell colSpan={2} align="center" sx={tableBodyCellStyle}>Нет единиц</TableCell>
                                </TableRow>
                            ) : units.map(u => (
                                <TableRow key={u.id}>
                                    <TableCell sx={tableBodyCellStyle}>{u.name}</TableCell>
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
                                            <Button size="small" sx={{ minWidth: 0, mr: 1 }} onClick={() => {
                                                setEditId(u.id);
                                                setEditName(u.name);
                                                setEditOpen(true);
                                            }}>
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

                <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
                    <UnitForm
                        title="Создать единицу"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        onSubmit={handleCreate}
                        onCancel={() => setCreateOpen(false)}
                        loading={loading}
                    />
                </Dialog>

                <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
                    <UnitForm
                        title="Редактировать единицу"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onSubmit={handleEdit}
                        onCancel={() => setEditOpen(false)}
                        loading={loading}
                    />
                </Dialog>

                <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} fullWidth maxWidth="xs">
                    <DialogTitle sx={{ bgcolor: "#1e1e1e", color: "#fff" }}>Удалить единицу?</DialogTitle>
                    <DialogActions sx={{ bgcolor: "#1e1e1e" }}>
                        <Button color="error" onClick={handleDelete} disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : "Удалить"}
                        </Button>
                        <Button onClick={() => setDeleteOpen(false)}>Отмена</Button>
                    </DialogActions>
                </Dialog>

                <Snackbar {...snackbarProps}>
                    <Alert {...alertProps} onClose={snackbarProps.onClose}>
                        {alertProps.children}
                    </Alert>
                </Snackbar>
            </Box>
        </ThemeProvider>
    );
}