import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    CircularProgress,
} from '@mui/material';

// Константы для стилей
const CARD_STYLES = {
    paper: {
        p: 4,
        borderRadius: 4,
        maxWidth: 500,
        minWidth: 300,
        backgroundColor: '#91685F', // Фон
        color: 'white', // Белый текст
        boxShadow: 3, // Тень для карточки
    },
    title: {
        variant: 'h6',
        mb: 2,
        color: '#ffffff',
    },
    amount: {
        align: 'center',
        variant: 'h4',
        color: 'secondary',
        fontSize: '2rem',
    },
    subtitle: {
        align: 'center',
        variant: 'body2',
        color: '#ffffff',
    },
    loadingBox: {
        display: 'flex',
        justifyContent: 'center',
        my: 4,
    },
};

const BudgetCard = () => {
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/budgets')
            .then(res => res.json())
            .then(data => {
                const totalAmount = data.reduce((sum, b) => sum + (b.total_amount || 0), 0);
                setTotal(totalAmount);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <Paper sx={CARD_STYLES.paper}>
            <Typography {...CARD_STYLES.title}>Бюджет</Typography>
            {loading ? (
                <Box sx={CARD_STYLES.loadingBox}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <Typography sx={CARD_STYLES.amount}>
                        {total.toLocaleString('ru-RU', {
                            style: 'currency',
                            currency: 'KGS',
                            minimumFractionDigits: 2,
                        })}
                    </Typography>
                    <Typography sx={CARD_STYLES.subtitle}>
                        всего доступно
                    </Typography>
                </>
            )}
        </Paper>
    );
};

export default BudgetCard;
