import React from "react";
import { useAuth } from "./AuthContext.jsx";
import ForbiddenPage from "./ForbiddenPage";

const roleAccess = {
    admin: "*",
    technologist: ["/units", "/ingredients", "/productions", "/finished-goods","/raw-materials"],
    purchaser: ["/raw-materials", "/purchases"],
    seller: ["/sales"],
};

export default function RequireAccess({ path, children }) {
    const { user } = useAuth();
    const role = user?.position;

    const access = roleAccess[role];
    const allowed = access === "*" || access?.includes(path);

    return allowed ? children : <ForbiddenPage />;
}
