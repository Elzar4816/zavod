import React from 'react';
import {
    TextField, DialogContent, DialogActions,
    CircularProgress, Button, DialogTitle
} from '@mui/material';
import { inputStyle } from '@theme/uiStyles.js';

export default function UnitForm({
                                     title = "Форма единицы",
                                     value,
                                     onChange,
                                     onSubmit,
                                     onCancel,
                                     loading
                                 }) {
    return (
        <>
            <DialogTitle sx={{ bgcolor: "#1e1e1e", color: "#fff" }}>{title}</DialogTitle>
            <DialogContent sx={{ bgcolor: "#1e1e1e" }}>
                <TextField
                    fullWidth
                    margin="dense"
                    label="Название"
                    value={value}
                    onChange={onChange}
                    sx={inputStyle}
                />
            </DialogContent>
            <DialogActions sx={{ bgcolor: "#1e1e1e" }}>
                <Button onClick={onCancel}>Отмена</Button>
                <Button onClick={onSubmit} variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : "Сохранить"}
                </Button>
            </DialogActions>
        </>
    );
}
