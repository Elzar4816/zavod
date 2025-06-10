import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Tooltip, Collapse } from "@mui/material";
import { useAuth } from "../context/AuthContext"; // 👈 обязательно


import StraightenIcon from "@mui/icons-material/Straighten";
import CategoryIcon from "@mui/icons-material/Category";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
    import FactoryIcon from "@mui/icons-material/Factory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import LogoutIcon from "@mui/icons-material/Logout"; // 👈 импорт иконки выхода
import AccountBalanceIcon from "@mui/icons-material/AccountBalance"; // Бюджет
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";       // Зарплаты
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";       // Продажи
import CreditScoreIcon from "@mui/icons-material/CreditScore";       // Кредиты
import BarChartIcon from "@mui/icons-material/CreditScore";       // Кредиты

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
    left: isOpen ? 290 : 100,
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
    whiteSpace: "nowrap",
};

// hover-стиль для ссылок
const hoverStyle = {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
};

// компонент ссылки с тултипом и эффектами
    const SidebarLink = ({ to, icon: Icon, label, isOpen }) => {
        const [hover, setHover] = useState(false);
        const [pressed, setPressed] = useState(false);

        let transformValue;
        if (pressed) transformValue = "scale(0.95)";
        else if (hover) transformValue = "translateY(-2px)";

        return (
            <Tooltip
                title={label}
                placement="right"
                disableHoverListener={isOpen}
                disableFocusListener={isOpen}
                enterDelay={1000}
                slotProps={{
                    tooltip: {
                        sx: {
                            fontSize: "14px",
                            padding: "10px 14px",
                            backgroundColor: "#DCCFB4",
                            color: "#323030",
                            borderRadius: "8px",
                        },
                    },
                }}
            >
                <Link
                    to={to}
                    style={{
                        ...menuItemBase,
                        ...(hover ? hoverStyle : {}),
                        transform: transformValue,
                        transition: "transform 0.1s ease-in-out, box-shadow 0.2s ease-in-out",
                    }}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => {
                        setHover(false);
                        setPressed(false);
                    }}
                    onMouseDown={() => setPressed(true)}
                    onMouseUp={() => setPressed(false)}
                    onTouchStart={() => setPressed(true)}
                    onTouchEnd={() => setPressed(false)}
                >
                    <Icon style={{ fontSize: 24, minWidth: 24 }} />
                    <span
                        style={{
                            opacity: isOpen ? 1 : 0,
                            maxWidth: isOpen ? 200 : 0,
                            overflow: "hidden",
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
    const [budgetOpen, setBudgetOpen] = useState(false);
    const [budgetHover, setBudgetHover] = useState(false);
    const [budgetPressed, setBudgetPressed] = useState(false);
    const [logoutHover, setLogoutHover] = useState(false);
    const [logoutPressed, setLogoutPressed] = useState(false);
    let logoutTransform = "";
    if (logoutPressed) logoutTransform = "scale(0.95)";
    else if (logoutHover) logoutTransform = "translateY(-2px)";
    const navigate = useNavigate();





    // рассчитываем анимацию для «Бюджет»
    let budgetTransform = "";
    if (budgetPressed) budgetTransform = "scale(0.95)";
    else if (budgetHover) budgetTransform = "translateY(-2px)";

    const budgetStyle = {
        ...menuItemBase,
        justifyContent: "space-between",
        cursor: "pointer",
        ...(budgetHover ? hoverStyle : {}),
        transform: budgetTransform,
        transition: "transform 0.1s ease-in-out, box-shadow 0.2s ease-in-out",
    };

    const { user } = useAuth();
    const role = user?.position;

    const roleAccess = {
        admin: "*",
        technologist: ["/", "/units", "/ingredients", "/productions", "/finished-goods","/raw-materials","/reports"],
        manager: ["/", "/raw-materials", "/purchases", "/sales", "/sale_product","/reports"],
        accountant: ["/budgets", "/salaries", "/credits","/reports"],
    };

    const items = [
        { to: "/", icon: HomeIcon, label: "Главная" },
        { to: "/units", icon: StraightenIcon, label: "Единицы измерения" },
        { to: "/raw-materials", icon: CategoryIcon, label: "Сырьё" },
        { to: "/finished-goods", icon: Inventory2Icon, label: "Готовая продукция" },
        { to: "/ingredients", icon: LocalDiningIcon, label: "Ингредиенты" },
        { to: "/productions", icon: FactoryIcon, label: "Производство" },
        { to: "/purchases", icon: ShoppingCartIcon, label: "Закупка" },
        { to: "/sales", icon: PointOfSaleIcon, label: "Продажи" }, // 👈 добавлено

    ];


    const accessibleItems = items.filter(({ to }) => {
        if (!role) return false;
        const access = roleAccess[role];
        return access === "*" || access.includes(to);
    });

    return (
        <>
            {/* Бургер-кнопка */}
            <button
                type="button"
                onClick={toggleSidebar}
                style={{
                    ...burgerStyle(isOpen),
                    background: "none",
                    border: "none",
                    padding: 0,
                    outline: "none",
                }}
            >
                <span style={{...barBase, ...(isOpen ? bar1Open : {})}}/>
                <span style={{...barBase, ...(isOpen ? bar2Open : {})}}/>
                <span style={{...barBase, ...(isOpen ? bar3Open : {})}}/>
            </button>


            {/* Сайдбар */}
            <div style={sidebarStyle(isOpen)}>
                {/* Заголовок */}
                <div style={{marginBottom: 20, paddingLeft: isOpen ? 0 : 12}}>
                    <h1
                        style={{
                            fontSize: 24,
                            fontWeight: 700,
                            margin: 0,
                            opacity: isOpen ? 1 : 0,
                            transition: "opacity 0.3s ease",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                        }}
                    >
                        Меню
                    </h1>
                </div>

                {/* Ссылки */}
                <nav style={{paddingTop: 5}}>
                    {accessibleItems.map(({to, icon, label}) => (
                        <SidebarLink
                            key={to}
                            to={to}
                            icon={icon}
                            label={label}
                            isOpen={isOpen}
                        />
                    ))}
                    {(roleAccess[role] === "*" || roleAccess[role]?.includes("/budgets")) && (
                        <>
                            {/* Пункт «Бюджет» с тултипом, анимацией и дропдаун-стрелкой */}
                            <Tooltip
                                title="Бюджет"
                                placement="right"
                                disableHoverListener={isOpen}
                                disableFocusListener={isOpen}
                                enterDelay={1000}
                                slotProps={{
                                    tooltip: {
                                        sx: {
                                            fontSize: "14px",
                                            padding: "10px 14px",
                                            backgroundColor: "#DCCFB4",
                                            color: "#323030",
                                            borderRadius: "8px",
                                        },
                                    },
                                }}
                            >
                                <button
                                    type="button"
                                    style={{
                                        ...budgetStyle,
                                        background: "none",
                                        border: "none",
                                        textAlign: "left",
                                        width: "100%",
                                    }}
                                    onClick={() => navigate("/budgets")}
                                    onMouseEnter={() => setBudgetHover(true)}
                                    onMouseLeave={() => {
                                        setBudgetHover(false);
                                        setBudgetPressed(false);
                                    }}
                                    onMouseDown={() => setBudgetPressed(true)}
                                    onMouseUp={() => setBudgetPressed(false)}
                                    onTouchStart={() => setBudgetPressed(true)}
                                    onTouchEnd={() => setBudgetPressed(false)}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <AccountBalanceIcon style={{ fontSize: 24, minWidth: 24 }} />
                                        <span
                                            style={{
                                                opacity: isOpen ? 1 : 0,
                                                maxWidth: isOpen ? 200 : 0,
                                                overflow: "hidden",
                                                transition: "opacity 0.3s, max-width 0.3s",
                                            }}
                                        >Бюджет</span>
                                    </div>
                                    {isOpen &&
                                        (budgetOpen ? (
                                            <ExpandLessIcon
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setBudgetOpen(false);
                                                }}
                                            />
                                        ) : (
                                            <ExpandMoreIcon
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setBudgetOpen(true);
                                                }}
                                            />
                                        ))}
                                </button>
                            </Tooltip>


                            {/* Подпункты «Зарплаты» и «Продажи» */}
                            <Collapse in={budgetOpen && isOpen} timeout="auto" unmountOnExit>
                                <div style={{marginLeft: 32}}>
                                    <SidebarLink
                                        to="/salaries"
                                        icon={AttachMoneyIcon}
                                        label="Зарплаты"
                                        isOpen={isOpen}
                                    />
                                    <SidebarLink
                                        to="/sales"
                                        icon={PointOfSaleIcon}
                                        label="Продажи"
                                        isOpen={isOpen}
                                    />
                                    <SidebarLink
                                        to="/credits"
                                        icon={CreditScoreIcon}
                                        label="Кредиты"
                                        isOpen={isOpen}
                                    />
                                </div>
                            </Collapse>
                        </>
                    )}
                    {(roleAccess[role] === "*" || roleAccess[role]?.includes("/reports")) && (
                        <SidebarLink
                            to="/report"
                            icon={BarChartIcon}
                            label="Отчёты"
                            isOpen={isOpen}
                        />
                    )}



                </nav>
            </div>
        </>
    );
};

export default Sidebar;
