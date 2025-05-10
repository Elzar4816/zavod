import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Box, TextField, Button, Typography,
    Snackbar, Alert, ThemeProvider, CssBaseline
} from "@mui/material";
import { loginTheme } from "../theme/loginTheme";

export default function LoginPage({ onLoginSuccess }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const from = location.state?.from?.pathname || "/";

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ login, password }),
                credentials: "include",
            });

            if (response.ok) {
                onLoginSuccess?.();
                navigate("/", {
                    state: { loginSuccess: true }
                });


            } else {
                const res = await response.json();
                setError(res.error || "Ошибка входа");
            }
        } catch (err) {
            setError("Ошибка соединения с сервером");
        }
    };

    // Убираем скролл и влиятельные стили
    useEffect(() => {
        const html = document.documentElement;
        const body = document.body;

        body.style.overflow = "hidden";
        html.style.overflow = "hidden";
        html.style.height = "100%";
        body.style.height = "100%";
        body.style.margin = "0";
        html.style.margin = "0";

        return () => {
            body.style.overflow = "";
            html.style.overflow = "";
            html.style.height = "";
            body.style.height = "";
            body.style.margin = "";
            html.style.margin = "";
        };
    }, []);

    return (
        <ThemeProvider theme={loginTheme}>
            <CssBaseline />
            <Box
                sx={{
                    height: "100vh",
                    width: "100vw",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "background.default",
                }}
            >
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        width: "90%",
                        maxWidth: 400,
                        p: 4,
                        backgroundColor: "primary.main",
                        borderRadius: 7,
                        boxShadow: 6,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        color: "text.primary",
                    }}
                >
                    <Typography variant="h4" align="center" sx={{ mb: 2 }}>
                        Вход в систему
                    </Typography>
                    <TextField
                        label="Логин"
                        fullWidth
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        required
                        InputProps={{
                            sx: { color: "#000" }
                        }}
                    />

                    <TextField
                        label="Пароль"
                        type="password"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        InputProps={{
                            sx: { color: "#000" }
                        }}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        color="secondary"
                        fullWidth
                        sx={{ mt: 1 }}
                    >
                        Войти
                    </Button>
                    <Snackbar
                        open={Boolean(error)}
                        autoHideDuration={6000}
                        onClose={() => setError("")}
                    >
                        <Alert onClose={() => setError("")} severity="error" sx={{ width: "100%" }}>
                            {error}
                        </Alert>
                    </Snackbar>
                </Box>
            </Box>
        </ThemeProvider>
    );
}
