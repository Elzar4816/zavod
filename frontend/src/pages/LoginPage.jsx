import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Container, Box, TextField, Button, Typography, Snackbar, Alert } from "@mui/material";

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
                navigate(from, { replace: true });
            } else {
                const res = await response.json();
                setError(res.error || "Ошибка входа");
            }
        } catch (err) {
            setError("Ошибка соединения с сервером");
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#F7F3E3", // фон всей страницы, как в карточках
            }}
        >
            <Container maxWidth="xs">
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        p: 4,
                        backgroundColor: "#91685F", // цвет карточки
                        borderRadius: 4,
                        boxShadow: 6,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        color: "#fff",
                    }}
                >
                    <Typography variant="h4" align="center" sx={{ mb: 2, color: "#fff" }}>
                        Вход в систему
                    </Typography>
                    <TextField
                        label="Логин"
                        fullWidth
                        variant="filled"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        required
                        InputProps={{ style: { backgroundColor: "#F7F3E3" } }}
                    />
                    <TextField
                        label="Пароль"
                        type="password"
                        fullWidth
                        variant="filled"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        InputProps={{ style: { backgroundColor: "#F7F3E3" } }}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="secondary"
                        fullWidth
                        sx={{ mt: 1, backgroundColor: "#AF9164", ":hover": { backgroundColor: "#C1AA84" } }}
                    >
                        Войти
                    </Button>
                </Box>
                <Snackbar
                    open={Boolean(error)}
                    autoHideDuration={6000}
                    onClose={() => setError("")}
                >
                    <Alert onClose={() => setError("")} severity="error" sx={{ width: "100%" }}>
                        {error}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
}
