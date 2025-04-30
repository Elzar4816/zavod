import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Units from "./pages/Units";
import RawMaterials from "./pages/RawMaterials";
import FinishedGoods from "./pages/FinishedGoods";
import Ingredients from "./pages/Ingredients.jsx";
import Budget from "./pages/Budget.jsx";
import Production from "./pages/Production.jsx";
import Purchases from "./pages/Purchases.jsx";
import Salary from "./pages/Salary.jsx";
import SalesPage from "./pages/Sales.jsx";
import CreditPage from "./pages/CreditPage.jsx";
import PaymentsPage from "./pages/PaymentsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import './styles/fonts.css';

// 🔥 Проверка, есть ли сессия
function isAuthenticated() {
    return document.cookie.includes('session_id');
}

// 🔒 Защита маршрутов — используем state из App
function ProtectedRoute({ children, authenticated }) {
    const location = useLocation();
    if (!authenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return children;
}


function App() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [authenticated, setAuthenticated] = useState(isAuthenticated());

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // Обновлять состояние аутентификации при изменении куки (например после логина)
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch("/api/session", {
                    credentials: "include",
                });
                setAuthenticated(res.ok);
            } catch {
                setAuthenticated(false);
            }
        };
        checkAuth();
    }, []); // ✅ только один раз при монтировании



    return (
        <Router>
            <div style={{ display: "flex" }}>
                {/* Показывать сайдбар только если авторизован */}
                {authenticated && (
                    <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
                )}
                <div
                    style={{
                        marginLeft: authenticated ? (sidebarOpen ? "300px" : "20vh") : "0",
                        padding: "20px",
                        transition: "margin-left 0.3s ease",
                        flex: 1,
                    }}
                >
                    <Routes>
                        <Route
                            path="/login"
                            element={
                                authenticated
                                    ? <Navigate to="/" replace />
                                    : <LoginPage onLoginSuccess={() => setAuthenticated(true)} />
                            }
                        />
                        <Route path="/" element={<ProtectedRoute authenticated={authenticated}><Home /></ProtectedRoute>} />
                        <Route path="/units" element={<ProtectedRoute authenticated={authenticated}><Units /></ProtectedRoute>} />
                        <Route path="/raw-materials" element={<ProtectedRoute authenticated={authenticated}><RawMaterials /></ProtectedRoute>} />
                        <Route path="/finished-goods" element={<ProtectedRoute authenticated={authenticated}><FinishedGoods /></ProtectedRoute>} />
                        <Route path="/ingredients" element={<ProtectedRoute authenticated={authenticated}><Ingredients /></ProtectedRoute>} />
                        <Route path="/budgets" element={<ProtectedRoute authenticated={authenticated}><Budget /></ProtectedRoute>} />
                        <Route path="/productions" element={<ProtectedRoute authenticated={authenticated}><Production /></ProtectedRoute>} />
                        <Route path="/purchases" element={<ProtectedRoute authenticated={authenticated}><Purchases /></ProtectedRoute>} />
                        <Route path="/salaries" element={<ProtectedRoute authenticated={authenticated}><Salary /></ProtectedRoute>} />
                        <Route path="/sales" element={<ProtectedRoute authenticated={authenticated}><SalesPage /></ProtectedRoute>} />
                        <Route path="/credits" element={<ProtectedRoute authenticated={authenticated}><CreditPage /></ProtectedRoute>} />
                        <Route path="/credits/:id/payments" element={<ProtectedRoute authenticated={authenticated}><PaymentsPage /></ProtectedRoute>} />
                    </Routes>


                </div>
            </div>
        </Router>
    );
}

export default App;
