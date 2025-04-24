import React, {useEffect, useMemo, useState} from 'react';
import {
    Box, Paper, Typography, Select, MenuItem, CircularProgress,
} from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';

const customColors = ['#AF9164', '#C1AA84', '#F7F3E3', '#D5D5CD', '#B3B6B7', '#91685F', '#804133','#6F1A07','#4D1E10'];
const SalesCard = () => {
    const [sales, setSales] = useState([]);
    const [filter, setFilter] = useState('year');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/sales')
            .then(res => res.json())
            .then(data => {
                setSales(data);
                setLoading(false);
            });
    }, []);

    const filteredSales = sales.filter(sale => {
        const date = new Date(sale.sale_date);
        const now = new Date();
        if (filter === 'year') return date.getFullYear() === now.getFullYear();
        if (filter === 'month') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        return true;
    });

    const salesByProduct = filteredSales.reduce((acc, sale) => {
        const name = sale.product?.name || 'Неизвестно';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
    }, {});

    // внутри компонента SalesCard:
    const shuffledColors = useMemo(() => {
        return [...customColors].sort(() => Math.random() - 0.5);
    }, []); // перемешивается только один раз при монтировании компонента

    const data = Object.entries(salesByProduct).map(([label, value], i) => ({
        id: i,
        value,
        label,
        color: shuffledColors[i % shuffledColors.length],
    }));

    const total = data.reduce((sum, d) => sum + d.value, 0);

    return (
        <Paper sx={{ p: 3, borderRadius: 4, maxWidth: 400 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Продажи</Typography>
                <Select
                    size="small"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    sx={{ borderRadius: 2 }}
                >
                    <MenuItem value="year">За год</MenuItem>
                    <MenuItem value="month">За месяц</MenuItem>
                </Select>
            </Box>

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
                        продаж
                    </Typography>
                </>
            )}
        </Paper>
    );
};

export default SalesCard;
