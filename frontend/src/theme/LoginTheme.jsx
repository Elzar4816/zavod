// src/theme/loginTheme.jsx
import { createTheme } from "@mui/material/styles";

export const loginTheme = createTheme({
    palette: {
        background: {
            default: "#F7F3E3",
        },
        primary: {
            main: "#91685F",
        },
        secondary: {
            main: "#AF9164",
        },
        text: {
            primary: "#ffffff",
        },
    },
    typography: {
        fontFamily: "Tilda Sans, sans-serif",
    },
    components: {
        MuiTextField: {
            defaultProps: {
                variant: "filled",
            },
            styleOverrides: {
                root: {
                    backgroundColor: "#F7F3E3",
                    borderRadius: 6,
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                },
            },
        },
    },
});
