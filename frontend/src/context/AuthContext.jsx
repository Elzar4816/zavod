//..src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const fetchSession = async () => {
        try {
            const res = await fetch("/api/session", { credentials: "include" });
            const data = res.ok ? await res.json() : null;
            setUser(data);
            return data;
        } catch {
            setUser(null);
        }
    };

    useEffect(() => {
        fetchSession();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, fetchSession }}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => useContext(AuthContext);
