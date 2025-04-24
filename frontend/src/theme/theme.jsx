// src/theme.js
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    typography: { fontFamily: '"Tilda Sans", sans-serif' },
    components: {
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    color: '#fff',
                    backgroundColor: '#2a2a2a',
                    '&.Mui-selected': { backgroundColor: '#444' },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: { backgroundColor: '#B3B6B7' },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    color: '#fff',
                    backgroundColor: '#646cff',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        backgroundColor: '#7c7eff',
                        boxShadow: '0px 4px 12px rgba(100, 108, 255, 0.5)',
                        transform: 'translateY(-2px)',
                    },
                    '&.MuiButton-outlined': {
                        backgroundColor: 'transparent',
                        borderColor: '#646cff',
                        color: '#646cff',
                        '&:hover': { backgroundColor: 'rgba(100, 108, 255, 0.1)' },
                    },
                    '&.MuiButton-text': {
                        backgroundColor: 'transparent',
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                    },
                },
            },
        },
    },
});
