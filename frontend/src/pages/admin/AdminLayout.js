import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div style={styles.container}>
            {/* ============ SIDEBAR ============ */}
            <aside style={styles.sidebar}>
                <div style={styles.sidebarHeader}>
                    <h2 style={styles.sidebarTitle}>🔧 Admin</h2>
                    <p style={styles.sidebarSubtitle}>ParkCol</p>
                </div>

                <nav style={styles.nav}>
                    <NavLink
                        to="/admin"
                        end
                        style={({ isActive }) => isActive ? styles.navActive : styles.navItem}
                    >
                        📊 Dashboard
                    </NavLink>

                    <NavLink
                        to="/admin/usuarios"
                        style={({ isActive }) => isActive ? styles.navActive : styles.navItem}
                    >
                        👥 Usuarios
                    </NavLink>

                    <NavLink
                        to="/admin/parqueaderos"
                        style={({ isActive }) => isActive ? styles.navActive : styles.navItem}
                    >
                        🅿️ Parqueaderos
                    </NavLink>
                </nav>

                <div style={styles.sidebarFooter}>
                    <div style={styles.userInfo}>
                        <span style={styles.userName}>👤 {usuario?.nombre}</span>
                        <span style={styles.userRol}>{usuario?.rol}</span>
                    </div>
                    <button onClick={handleLogout} style={styles.logoutBtn}>
                        Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* ============ CONTENIDO ============ */}
            <main style={styles.main}>
                <div style={styles.mainHeader}>
                    <button 
                        onClick={() => navigate('/')} 
                        style={styles.backHomeBtn}
                    >
                        ← Volver a ParkCol
                    </button>
                </div>
                <Outlet />
            </main>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#F8FAFC'
    },
    // ============ SIDEBAR ============
    sidebar: {
        width: '260px',
        backgroundColor: '#2C3E50',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh'
    },
    sidebarHeader: {
        padding: '25px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
    },
    sidebarTitle: {
        fontSize: '1.4rem',
        margin: 0,
        color: '#FF7E5F'
    },
    sidebarSubtitle: {
        fontSize: '0.85rem',
        margin: '5px 0 0 0',
        opacity: 0.7
    },
    nav: {
        flex: 1,
        padding: '20px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    navItem: {
        padding: '12px 20px',
        color: 'rgba(255,255,255,0.8)',
        textDecoration: 'none',
        fontSize: '1rem',
        transition: 'background 0.2s',
        borderLeft: '3px solid transparent'
    },
    navActive: {
        padding: '12px 20px',
        color: 'white',
        textDecoration: 'none',
        fontSize: '1rem',
        backgroundColor: 'rgba(255,126,95,0.15)',
        borderLeft: '3px solid #FF7E5F',
        fontWeight: 'bold'
    },
    sidebarFooter: {
        padding: '20px',
        borderTop: '1px solid rgba(255,255,255,0.1)'
    },
    userInfo: {
        marginBottom: '12px'
    },
    userName: {
        display: 'block',
        fontSize: '0.9rem',
        marginBottom: '4px'
    },
    userRol: {
        display: 'inline-block',
        backgroundColor: '#FF7E5F',
        color: 'white',
        padding: '2px 8px',
        borderRadius: '10px',
        fontSize: '0.7rem',
        textTransform: 'uppercase',
        fontWeight: 'bold'
    },
    logoutBtn: {
        width: '100%',
        backgroundColor: 'transparent',
        color: '#FF7E5F',
        border: '1px solid #FF7E5F',
        padding: '8px 15px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        transition: 'background 0.2s'
    },
    // ============ CONTENIDO ============
    main: {
        flex: 1,
        padding: '30px 40px',
        maxWidth: 'calc(100vw - 260px)',
        overflowX: 'hidden'
    },
    mainHeader: {
        marginBottom: '20px'
    },
    backHomeBtn: {
        backgroundColor: 'transparent',
        border: '1px solid #ddd',
        padding: '8px 15px',
        borderRadius: '5px',
        cursor: 'pointer',
        color: '#2C3E50',
        fontSize: '0.9rem'
    }
};

export default AdminLayout;