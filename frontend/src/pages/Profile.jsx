import React, { useEffect, useState } from "react";
import {
    Box, Paper, Typography, Divider, CircularProgress
} from "@mui/material";
import { theme } from "../theme/theme.jsx";
import { ThemeProvider } from "@mui/material";

export default function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/session", { credentials: "include" })
            .then(res => {
                if (!res.ok) throw new Error("Ошибка получения профиля");
                return res.json();
            })
            .then(setProfile)
            .catch(() => setProfile(null))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <Box sx={{ p: 4 }}><CircularProgress /></Box>;
    }

    if (!profile) {
        return <Box sx={{ p: 4 }}>Не удалось загрузить профиль</Box>;
    }

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ p: 4, maxWidth: 600 }}>
                <Typography variant="h4" gutterBottom>Профиль</Typography>
                <Paper elevation={6} sx={{ p: 3, background: "#1e1e1e", color: "#fff" }}>
                    <Typography variant="h6">ФИО: {profile.name}</Typography>
                    <Typography variant="h6">Должность: {profile.position}</Typography>
                    <Divider sx={{ my: 2, borderColor: "#444" }} />

                </Paper>
            </Box>
        </ThemeProvider>
    );
}
