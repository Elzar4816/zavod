import React from 'react';
import {
    TextField, MenuItem, DialogContent, DialogActions,
    CircularProgress, Button, DialogTitle
} from '@mui/material';
import { inputStyle, selectWhiteStyle } from '@theme/uiStyles.js';

export default function RawMaterialForm({
                                            values,
                                            units,
                                            onChange,
                                            onSubmit,
                                            onCancel,
                                            loading,
                                            title = "Форма сырья"
                                        }) {
    return (
        <>
            <DialogTitle sx={{ bgcolor: "#1e1e1e", color: "#fff" }}>{title}</DialogTitle>
            <DialogContent sx={{ bgcolor: "#1e1e1e" }}>
                <TextField
                    fullWidth label="Название" margin="dense" name="name"
                    value={values.name} onChange={onChange} sx={inputStyle}
                />
                <TextField
                    fullWidth label="Количество" margin="dense" name="quantity" type="number"
                    value={values.quantity} onChange={onChange} sx={inputStyle}
                />
                <TextField
                    fullWidth label="Общая сумма" margin="dense" name="total_amount" type="number"
                    value={values.total_amount} onChange={onChange} sx={inputStyle}
                />
                <TextField
                    select fullWidth label="Единица" margin="dense" name="unit_id"
                    value={values.unit_id} onChange={onChange} sx={selectWhiteStyle}
                >
                    {units.map(u => (
                        <MenuItem key={u.id} value={u.id.toString()}>{u.name}</MenuItem>
                    ))}
                </TextField>
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