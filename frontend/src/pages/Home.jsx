import React from 'react';
import { Box, Typography, ThemeProvider } from '@mui/material';
import { theme } from '../theme/theme.jsx';
import SalesCard from '../components/SalesCard';
import RawMaterialsCard from '../components/RawMaterialsCard';

const Home = () => {
    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ p: 4 }}>
                <Typography variant="h4" color={'#000000'} gutterBottom>
                    Добро пожаловать!
                </Typography>
                <Box display="flex" gap={4} flexWrap="wrap">
                    <SalesCard />
                    <RawMaterialsCard />
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default Home;
