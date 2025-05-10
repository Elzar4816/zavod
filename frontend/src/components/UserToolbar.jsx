import React, { useState } from "react";
import {
    Avatar,
    Box,
    IconButton,
    Typography
} from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import {useNavigate} from "react-router-dom";

export default function UserToolbar({ onLogout }) {
    const [hovered, setHovered] = useState(false);
    const navigate = useNavigate(); // 👈 добавить

    return (
        <Box
            sx={{
                position: "fixed",
                top: 16,
                right: 16,
                zIndex: 1300,
                display: "flex",
                alignItems: "center",
                gap: 1,
                transition: "all 0.3s ease",
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Слайдер-панель с профилем и кнопкой "выйти" */}
            <Box
                sx={{
                    width: 40,
                    height: 40,
                    bgcolor: "white",
                    borderRadius: "50%",
                    boxShadow: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: hovered ? "translateX(0)" : "translateX(100%)",
                    opacity: hovered ? 1 : 0,
                    pointerEvents: hovered ? "auto" : "none",
                    transition: "all 0.3s ease",
                }}
            >
                <IconButton onClick={onLogout} size="small" color="error">
                    <LogoutIcon fontSize="small" />
                </IconButton>
            </Box>


            {/* Кнопка перехода в профиль */}
            <IconButton onClick={() => navigate("/profile")}>
                <Avatar alt="User" />
            </IconButton>
        </Box>
    );
}
