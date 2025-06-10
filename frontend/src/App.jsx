import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation} from "react-router-dom";
import Sidebar from "@components/Sidebar";
import Home from "@pages/Home";
import Units from "@pages/Units";
import RawMaterials from "@pages/RawMaterials";
import FinishedGoods from "@pages/FinishedGoods";
import Ingredients from "@pages/Ingredients.jsx";
import Budget from "@pages/Budget.jsx";
import Production from "@pages/Production.jsx";
import Purchases from "@pages/Purchases.jsx";
import Salary from "@pages/Salary.jsx";
import SalesPage from "@pages/Sales.jsx";
import CreditPage from "@pages/CreditPage.jsx";
import PaymentsPage from "@pages/PaymentsPage.jsx";
import LoginPage from "@pages/LoginPage.jsx";
import './styles/fonts.css';
import UserToolbar from "@components/UserToolbar.jsx";
import ProfilePage from "@pages/Profile.jsx";
import RequireAccess from "./context/RequireAccess.jsx";
import { useAuth } from "./context/AuthContext";
import ReportPage from "@pages/Reports.jsx";


// 🔒 Защита маршрутов — используем state из App
function ProtectedRoute({ children, authenticated }) {
    const location = useLocation();
    if (!authenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return children;
}


function App() {
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        const saved = localStorage.getItem("sidebarOpen");
        return saved === null ? false : saved === "true";
    });

    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true); // <--- новое состояние

    const toggleSidebar = () => {
        setSidebarOpen((prev) => {
            const next = !prev;
            localStorage.setItem("sidebarOpen", next);
            return next;
        });
    };
    const { user, setUser } = useAuth();
    const { fetchSession } = useAuth();


    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch("/api/session", {
                    credentials: "include",
                });
                setAuthenticated(res.ok);
            } catch {
                setAuthenticated(false);
            } finally {
                setLoading(false); // <--- только после ответа от сервера
            }
        };
        checkAuth();
    }, []);

    if (loading) {
        // можно вернуть любой индикатор загрузки
        return <div>Загрузка...</div>;
    }

    return (
        <Router>
            <div style={{ display: "flex" }}>
                {authenticated  && user !== null && <Sidebar key={user?.id || "guest"}   isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />}
                <div style={{
                    marginLeft: authenticated ? (sidebarOpen ? "300px" : "20vh") : "0",
                    padding: "20px",
                    transition: "margin-left 0.3s ease",
                    flex: 1,
                }}>
                    <Routes>
                        <Route
                            path="/login"
                            element={
                                authenticated
                                    ? <Navigate to="/" replace state={{ loginSuccess: true }} />
                                    : <LoginPage onLoginSuccess={async () => {
                                        const user = await fetchSession();
                                        if (user) setAuthenticated(true);
                                    }} />
                            }
                        />

                        <Route path="/" element={<ProtectedRoute authenticated={authenticated}><Home /></ProtectedRoute>} />

                        <Route path="/units" element={
                            <ProtectedRoute authenticated={authenticated}>
                                <RequireAccess path="/units">
                                    <Units />
                                </RequireAccess>
                            </ProtectedRoute>
                        } />

                        <Route path="/raw-materials" element={
                            <ProtectedRoute authenticated={authenticated}>
                                <RequireAccess path="/raw-materials">
                                    <RawMaterials />
                                </RequireAccess>
                            </ProtectedRoute>
                        } />

                        <Route path="/finished-goods" element={
                            <ProtectedRoute authenticated={authenticated}>
                                <RequireAccess path="/finished-goods">
                                    <FinishedGoods />
                                </RequireAccess>
                            </ProtectedRoute>
                        } />

                        <Route path="/ingredients" element={
                            <ProtectedRoute authenticated={authenticated}>
                                <RequireAccess path="/ingredients">
                                    <Ingredients />
                                </RequireAccess>
                            </ProtectedRoute>
                        } />

                        <Route path="/budgets" element={
                            <ProtectedRoute authenticated={authenticated}>
                                <RequireAccess path="/budgets">
                                    <Budget />
                                </RequireAccess>
                            </ProtectedRoute>
                        } />

                        <Route path="/productions" element={
                            <ProtectedRoute authenticated={authenticated}>
                                <RequireAccess path="/productions">
                                    <Production />
                                </RequireAccess>
                            </ProtectedRoute>
                        } />

                        <Route path="/purchases" element={
                            <ProtectedRoute authenticated={authenticated}>
                                <RequireAccess path="/purchases">
                                    <Purchases />
                                </RequireAccess>
                            </ProtectedRoute>
                        } />

                        <Route path="/salaries" element={
                            <ProtectedRoute authenticated={authenticated}>
                                <RequireAccess path="/salaries">
                                    <Salary />
                                </RequireAccess>
                            </ProtectedRoute>
                        } />

                        <Route path="/sales" element={
                            <ProtectedRoute authenticated={authenticated}>
                                <RequireAccess path="/sales">
                                    <SalesPage />
                                </RequireAccess>
                            </ProtectedRoute>
                        } />

                        <Route path="/credits" element={
                            <ProtectedRoute authenticated={authenticated}>
                                <RequireAccess path="/credits">
                                    <CreditPage />
                                </RequireAccess>
                            </ProtectedRoute>
                        } />

                        <Route path="/credits/:id/payments" element={
                            <ProtectedRoute authenticated={authenticated}>
                                <RequireAccess path="/credits">
                                    <PaymentsPage />
                                </RequireAccess>
                            </ProtectedRoute>
                        } />

                        <Route path="/profile" element={
                            <ProtectedRoute authenticated={authenticated}>
                                <ProfilePage />
                            </ProtectedRoute>
                        } />
                        <Route path="/report" element={
                            <RequireAccess path="/report">
                                <ReportPage />
                            </RequireAccess>
                        } />


                    </Routes>
                </div>
            </div>

            {authenticated && (
                <UserToolbar
                    onLogout={() => {
                        fetch("/api/logout", {
                            method: "POST",
                            credentials: "include",
                        }).finally(() => {
                            setAuthenticated(false);
                            setUser(null);
                            window.location.href = "/login"; // 👈 добавляем редирект
                        });
                    }}

                />
            )}
        </Router>
    );

}


export default App;
