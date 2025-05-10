import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    ThemeProvider,
    Snackbar,
    Alert
} from '@mui/material';
import { theme } from '../theme/theme.jsx';
import SalesCard from '../components/cards/SalesCard.jsx';
import RawMaterialsCard from '../components/cards/RawMaterialsCard.jsx';
import BudgetCard from "../components/cards/BudgetCard.jsx";
import FinishedGoodsCard from "../components/cards/FinishedGoodsCard.jsx";
import { useLocation } from "react-router-dom";

const Home = () => {
    const location = useLocation();
    const [openSnackbar, setOpenSnackbar] = useState(false);

    useEffect(() => {
        console.log("location state:", location.state);
        if (location.state?.loginSuccess) {
            setOpenSnackbar(true);
            // удаляем loginSuccess, чтобы при F5 не всплывало снова
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ p: 4 }}>
                <Typography variant="h4" color={'#000000'} gutterBottom>
                    Добро пожаловать!
                </Typography>

                {/* ВСПЛЫВАЮЩЕЕ СООБЩЕНИЕ */}
                <Snackbar
                    open={openSnackbar}
                    autoHideDuration={3000}
                    onClose={() => setOpenSnackbar(false)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert onClose={() => setOpenSnackbar(false)} severity="success"     sx={{ width: 400, fontSize: '1.1rem', py: 2 }} >
                        Успешный вход!
                    </Alert>
                </Snackbar>

                <Box display="flex" flexDirection="column" gap={4}>
                    <Box sx={{ width: 400 }}>
                        <BudgetCard />
                    </Box>
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
