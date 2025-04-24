import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import './styles/fonts.css';
import Home from "./pages/Home";
import Units from "./pages/Units";
import RawMaterials from "./pages/RawMaterials";
import FinishedGoods from "./pages/FinishedGoods";
import Ingredients from "./pages/Ingredients.jsx";
import Budget from "./pages/Budget.jsx";
import Production from "./pages/Production.jsx";
import Purchases from "./pages/Purchases.jsx"
import Salary from "./pages/Salary.jsx";
import SalesPage from "./pages/Sales.jsx";
function App() {
    const [sidebarOpen, setSidebarOpen] = useState(false); // Состояние для управления сайдбаром

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen); // Переключаем состояние сайдбара
    };

    return (
        <Router>
            <div style={{ display: "flex" }}>
                <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
                <div
                    style={{
                        marginLeft: sidebarOpen ? "300px" : "20vh", // Если сайдбар открыт, отодвигаем контент
                        padding: "20px",
                        transition: "margin-left 0.3s ease",
                        flex: 1,
                    }}
                >
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/units" element={<Units />} />
                        <Route path="/raw-materials" element={<RawMaterials />} />
                        <Route path="/finished-goods" element={<FinishedGoods />} />
                        <Route path="/ingredients" element={<Ingredients />} />
                        <Route path="/budgets" element={<Budget />} />
                        <Route path="/productions" element={<Production />} />
                        <Route path="/purchases" element={<Purchases />} />
                        <Route path="/salaries" element={<Salary />} />
                        <Route path="/sales" element={<SalesPage />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
