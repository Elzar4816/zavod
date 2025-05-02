import React, { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    CircularProgress,
} from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';

const customColors = [
    '#AF9164', '#C1AA84', '#F7F3E3',
    '#D5D5CD', '#B3B6B7', '#91685F',
    '#804133', '#6F1A07', '#4D1E10'
];

const ProductionCard = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Загружаем готовую продукцию
    useEffect(() => {
        fetch('/api/finished-goods')
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setLoading(false);
            });
    }, []);

    // 2. Перемешиваем цвета один раз
    const shuffledColors = useMemo(
        () => [...customColors].sort(() => Math.random() - 0.5),
        []
    );

    // 3. Готовим данные для PieChart: только name и quantity
    const data = products.map((item, idx) => ({
        id: idx,
        value: item.quantity || 0,
        label: item.name || 'Без названия',
        color: shuffledColors[idx % shuffledColors.length],
    }));

    // 4. Общий total по количеству
    const total = data.reduce((sum, d) => sum + d.value, 0);

    return (
        <Paper sx={{ p: 3, borderRadius: 4, maxWidth: 400 }}>
            <Typography variant="h6" mb={2}>
                Продукция на складе
            </Typography>

            {loading ? (
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <PieChart
                        series={[{
                            data,
                            innerRadius: 40,
                            outerRadius: 70,
                        }]}
                        width={300}
                        height={200}
                    />
                    <Typography align="center" variant="h4" mt={1}>
                        {total}
                    </Typography>
                    <Typography align="center" variant="body2" color="text.secondary">
                        всего единиц
                    </Typography>
                </>
            )}
        </Paper>
    );
};

export default ProductionCard;
