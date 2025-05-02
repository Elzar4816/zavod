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

const RawMaterialsCard = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Загружаем список сырья (unit.name подтягивается с помощью Preload на бэке)
    useEffect(() => {
        fetch('/api/raw-materials')
            .then(res => res.json())
            .then(data => {
                setMaterials(data);
                setLoading(false);
            });
    }, []);

    // 2. Считаем итоги по каждой единице измерения
    const totalsByUnit = materials.reduce((acc, { quantity = 0, unit }) => {
        // если unit.name пустой — используем fallback по id
        const unitName = unit.name || `unit_id:${unit.id}`;
        acc[unitName] = (acc[unitName] || 0) + quantity;
        return acc;
    }, {});

    // 3. Перемешиваем цвета один раз
    const shuffledColors = useMemo(
        () => [...customColors].sort(() => Math.random() - 0.5),
        []
    );

    // 4. Готовим данные для PieChart
    const data = materials.map((item, index) => {
        const unitName = item.unit.name || `unit_id:${item.unit_id}`;
        return {
            id: index,
            value: item.quantity,
            // сразу показываем “Сахар — 442.7кг”
            label: `${item.name} — ${item.quantity} ${unitName}`,
            color: shuffledColors[index % shuffledColors.length],
        };
    });

    return (
        <Paper sx={{ p: 3, borderRadius: 4, maxWidth: 400 }}>
            <Typography variant="h6" mb={2}>
                Сырьё на складе
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

                    {/* 5. Итоги по unit */}
                    <Box mt={2}>
                        {Object.entries(totalsByUnit).map(([unitName, sum]) => (
                            <Typography
                                key={unitName}
                                align="center"
                                variant="body2"
                            >
                                Итого ({unitName}): {sum}
                            </Typography>
                        ))}
                    </Box>
                </>
            )}
        </Paper>
    );
};

export default RawMaterialsCard;
