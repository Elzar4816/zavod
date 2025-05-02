// src/hooks/useNotifier.js

import { useState, useCallback } from 'react';

export function useNotifier() {
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState('');
    const [severity, setSeverity] = useState('success');

    const allowedSeverities = ['success', 'error', 'warning', 'info'];

    const show = useCallback((msg, sev = 'success') => {
        if (!allowedSeverities.includes(sev)) {
            sev = 'success';
        }
        setMsg(msg);
        setSeverity(sev);
        setOpen(true);
    }, []);

    return {
        snackbarProps: {
            open,
            onClose: () => setOpen(false),
            autoHideDuration: 6000,
            anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
        },
        alertProps: {
            severity,
            children: msg,
            sx: { width: '100%' },
        },
        show,
    };
}

