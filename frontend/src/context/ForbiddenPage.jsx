import React from "react";
import { Box, Typography } from "@mui/material";

export default function ForbiddenPage() {
    return (
        <Box sx={{ mt: 10, textAlign: "center", color: "#ccc" }}>
            <Typography variant="h2">403</Typography>
            <Typography variant="h5" sx={{ mt: 2 }}>
                У вас нет доступа к этой странице
            </Typography>
        </Box>
    );
}
