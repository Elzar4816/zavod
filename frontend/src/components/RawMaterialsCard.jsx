import React, { useEffect, useState } from 'react';
import {
    Box, Paper, Typography, CircularProgress,
} from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';

const RawMaterialsCard = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/raw-materials')
            .then(res => res.json())
            .then(data => {
                setMaterials(data);
                setLoading(false);
            });
    }, []);

    const data = materials.map((item, index) => ({
        id: index,
        value: item.quantity || 0,
        label: item.name || 'Без названия',
    }));

    const total = data.reduce((sum, d) => sum + d.value, 0);

    return (
        <Paper sx={{ p: 3, borderRadius: 4, maxWidth: 400 }}>
            <Typography variant="h6" mb={2}>Сырьё на складе</Typography>

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
                            arcLabel: (item) => `${item.value}`,
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

export default RawMaterialsCard;
