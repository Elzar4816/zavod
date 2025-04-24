import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Tooltip } from "@mui/material";

import StraightenIcon from "@mui/icons-material/Straighten";
import CategoryIcon from "@mui/icons-material/Category";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import FactoryIcon from "@mui/icons-material/Factory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PaidIcon from "@mui/icons-material/Paid";
import HomeIcon from "@mui/icons-material/Home";

// стили самого сайдбара
const sidebarStyle = (isOpen) => ({
    position: "fixed",
    top: 0,
    left: 0,
    width: isOpen ? 250 : 50,
    height: "100%",
    backgroundColor: "#AF9164",
    transition: "width 0.3s ease",
    padding: "20px 10px",
    overflowX: "hidden",
    zIndex: 1000,
});

// стили “бургер-кнопки”
const burgerStyle = (isOpen) => ({
    position: "fixed",
    top: 20,
    left: isOpen ? 250 + 40 : 80 + 20,
    width: 30,
    height: 25,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    cursor: "pointer",
    zIndex: 1100,
    transition: "left 0.3s ease",
});

// стили полосок в бургер-кнопке
const barBase = {
    width: 30,
    height: 4,
    backgroundColor: "#000",
    borderRadius: 5,
    transition: "transform 0.3s ease, opacity 0.3s ease",
};
const bar1Open = { transform: "rotate(45deg) translate(10px,10px)" };
const bar2Open = { opacity: 0 };
const bar3Open = { transform: "rotate(-45deg) translate(5px,-5px)" };

// базовые стили для ссылок
const menuItemBase = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    margin: "16px 0",
    padding: "8px 12px",
    borderRadius: 8,
    textDecoration: "none",
    color: "#000",
    fontSize: "20px",
    transition: "all 0.2s ease-in-out",
};
const hoverStyle = {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
};

// кастомный линк в меню с тултипом
const SidebarLink = ({ to, icon: Icon, label, isOpen }) => {
    const [hover, setHover] = useState(false);

    return (
        <Tooltip
            title={label}
            placement="right"
            disableHoverListener={isOpen}
            slotProps={{
                tooltip: {
                    sx: {
                        fontSize: '14px',
                        padding: '10px 14px',
                        backgroundColor: '#DCCFB4',
                        color: '#323030',
                        borderRadius: '8px',
                    },
                },
            }}
        >
            <Link
                to={to}
                style={{
                    ...menuItemBase,
                    ...(hover ? hoverStyle : {}),
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                }}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                <Icon style={{ fontSize: 24, minWidth: 24 }} />
                <span
                    style={{
                        opacity: isOpen ? 1 : 0,
                        maxWidth: isOpen ? 200 : 0,
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        transition: "opacity 0.3s ease, max-width 0.3s ease",
                    }}
                >
          {label}
        </span>
            </Link>
        </Tooltip>
    );
};

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const navigate = useNavigate();

    const items = [
        { to: "/", icon: HomeIcon, label: "Главная" },
        { to: "/units", icon: StraightenIcon, label: "Единицы измерения" },
        { to: "/raw-materials", icon: CategoryIcon, label: "Сырьё" },
        { to: "/finished-goods", icon: Inventory2Icon, label: "Готовая продукция" },
        { to: "/ingredients", icon: LocalDiningIcon, label: "Ингредиенты" },
        { to: "/budgets", icon: AccountBalanceWalletIcon, label: "Бюджет" },
        { to: "/productions", icon: FactoryIcon, label: "Производство" },
        { to: "/purchases", icon: ShoppingCartIcon, label: "Закупка" },
        { to: "/salaries", icon: PaidIcon, label: "Зарплаты" },
        { to: "/sales", icon: PaidIcon, label: "Продажи" },
    ];

    return (
        <>
            {/* Бургер-кнопка */}
            <div style={burgerStyle(isOpen)} onClick={toggleSidebar}>
                <span style={{ ...barBase, ...(isOpen ? bar1Open : {}) }} />
                <span style={{ ...barBase, ...(isOpen ? bar2Open : {}) }} />
                <span style={{ ...barBase, ...(isOpen ? bar3Open : {}) }} />
            </div>

            {/* Сайдбар */}
            <div style={sidebarStyle(isOpen)}>
                {/* Заголовок */}
                <div
                    style={{
                        marginBottom: 20,
                        paddingLeft: isOpen ? 0 : 12,
                    }}
                >
                    <h1
                        style={{
                            fontSize: 24,
                            fontWeight: 700,
                            margin: 0,
                            opacity: isOpen ? 1 : 0,
                            transition: "opacity 0.3s ease",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            pl: 5,
                            pt:5,
                        }}
                    >
                        Меню
                    </h1>
                </div>

                {/* Ссылки */}
                <nav style={{ paddingTop: 5 }}>
                    {items.map(({ to, icon, label }) => (
                        <SidebarLink
                            key={to}
                            to={to}
                            icon={icon}
                            label={label}
                            isOpen={isOpen}
                        />
                    ))}
                </nav>
            </div>
        </>
    );
};

export default Sidebar;
