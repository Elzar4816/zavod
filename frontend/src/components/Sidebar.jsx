import React, { useState } from "react";
import { Link } from "react-router-dom";
import StraightenIcon from '@mui/icons-material/Straighten'; // Единицы измерения
import CategoryIcon from '@mui/icons-material/Category'; // Сырьё
import Inventory2Icon from '@mui/icons-material/Inventory2'; // Готовая продукция
import LocalDiningIcon from '@mui/icons-material/LocalDining'; // Ингредиенты
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'; // Бюджет
import FactoryIcon from '@mui/icons-material/Factory'; // Производство
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'; // Закупка
import PaidIcon from '@mui/icons-material/Paid'; // Зарплаты
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';

// 📦 Стили
const sidebarStyle = (isOpen) => ({
    position: 'fixed',
    top: 0,
    left: isOpen ? 0 : '-250px',
    width: '250px',
    height: '100%',
    backgroundColor: '#AF9164',
    color: '#000000',
    transition: 'left 0.3s ease',
    padding: '20px',
    zIndex: 1000,
});

const hamburgerStyle = {
    position: 'absolute',
    top: '20px',
    right: '-50px',
    width: '30px',
    height: '25px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    cursor: 'pointer',
    zIndex: 1050,
};

const barStyle = {
    width: '30px',
    height: '4px',
    backgroundColor: '#000000',
    borderRadius: '5px',
    transition: 'transform 0.3s ease, opacity 0.3s ease',
};

const bar1Open = {
    transform: 'rotate(45deg) translate(10px, 10px)',
};
const bar2Open = {
    opacity: 0,
};
const bar3Open = {
    transform: 'rotate(-45deg) translate(5px, -5px)',
};

const menuItemBaseStyle = {
    margin: '20px 0',
    fontWeight: 400,
    fontSize: '20px',
    transition: 'all 0.2s ease-in-out',
    borderRadius: '8px',
    padding: '8px 12px',
};

const menuItemHoverStyle = {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
};

const linkStyle = {
    color: '#000000',
    textDecoration: 'none',
    display: 'block',
    width: '100%',
    fontWeight: 400
};
const homeIconContainerStyle = {
    display: 'inline-block',
    marginRight: '10px',
    cursor: 'pointer',
    transition: 'transform 0.2s ease-in-out',
};

const homeIconHoverStyle = {
    transform: 'translateY(-2px)',
};

// 🌟 Кастомный компонент
const SidebarLink = ({ to, icon: IconComponent, children }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Link
            to={to}
            style={{
                ...menuItemBaseStyle,
                ...(isHovered ? menuItemHoverStyle : {}),
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#000000',
                textDecoration: 'none',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <IconComponent style={{ color: '#000000' }} />
            <span>{children}</span>
        </Link>
    );
};



const Sidebar = ({ isOpen, toggleSidebar }) => {
    const [homeHovered, setHomeHovered] = useState(false);
    const navigate = useNavigate();

    return (
        <div style={sidebarStyle(isOpen)}>
            <div style={hamburgerStyle} onClick={toggleSidebar}>
                <span style={{ ...barStyle, ...(isOpen ? bar1Open : {}) }}></span>
                <span style={{ ...barStyle, ...(isOpen ? bar2Open : {}) }}></span>
                <span style={{ ...barStyle, ...(isOpen ? bar3Open : {}) }}></span>
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginTop: '50px',
            }}>
                <button
                    onClick={() => navigate('/')}
                    onMouseEnter={() => setHomeHovered(true)}
                    onMouseLeave={() => setHomeHovered(false)}
                    style={{
                        ...menuItemBaseStyle,
                        padding: '4px',
                        margin: 0,
                        borderRadius: '8px',
                        ...(homeHovered ? menuItemHoverStyle : {}),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                >
                    <HomeIcon style={{color: '#000000', fontSize: '24px'}}/>
                </button>
                <h1 style={{fontWeight: 700, fontSize: '24px', margin: 0}}>Меню</h1>
            </div>


            <ul style={{listStyle: 'none', padding: 0}}>
                <SidebarLink to="/units" icon={StraightenIcon}>Единицы измерения</SidebarLink>
                <SidebarLink to="/raw-materials" icon={CategoryIcon}>Сырьё</SidebarLink>
                <SidebarLink to="/finished-goods" icon={Inventory2Icon}>Готовая продукция</SidebarLink>
                <SidebarLink to="/ingredients" icon={LocalDiningIcon}>Ингредиенты</SidebarLink>
                <SidebarLink to="/budgets" icon={AccountBalanceWalletIcon}>Бюджет</SidebarLink>
                <SidebarLink to="/productions" icon={FactoryIcon}>Производство</SidebarLink>
                <SidebarLink to="/purchases" icon={ShoppingCartIcon}>Закупка</SidebarLink>
                <SidebarLink to="/salaries" icon={PaidIcon}>Зарплаты</SidebarLink>
                <SidebarLink to="/sales" icon={PaidIcon}>Продажи</SidebarLink>
            </ul>
        </div>
    );
};


export default Sidebar;
