import React from 'react';
import { Box, Typography, ThemeProvider } from '@mui/material';
import { theme } from '../theme/theme.jsx';
import SalesCard from '../components/cards/SalesCard.jsx';
import RawMaterialsCard from '../components/cards/RawMaterialsCard.jsx';
import BudgetCard from "../components/cards/BudgetCard.jsx";
import FinishedGoodsCard from "../components/cards/FinishedGoodsCard.jsx";

const Home = () => {
    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ p: 4 }}>
                <Typography variant="h4" color={'#000000'} gutterBottom>
                    Добро пожаловать!
                </Typography>
                <Box display="flex" flexDirection="column" gap={4}>
                    <Box sx={{ width: 400 }}>
                        <BudgetCard /> {/* Бюджет с ограниченной шириной */}
                    </Box>
                    {/* Контейнер для карточек, добавляем flexWrap */}
                    <Box display="flex" flexWrap="wrap" gap={4} justifyContent="flex-start">
                        <Box sx={{ width: { xs: '100%', sm: 400 } }}>
                            <SalesCard />
                        </Box>
                        <Box sx={{ width: { xs: '100%', sm: 400 } }}>
                            <RawMaterialsCard />
                        </Box>
                        <Box sx={{ width: { xs: '100%', sm: 400 } }}>
                            <FinishedGoodsCard />
                        </Box>
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default Home;
