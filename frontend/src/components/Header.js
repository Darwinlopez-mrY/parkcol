import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header style={styles.header}>
            <div style={styles.container}>
                <Link to="/" style={styles.logo}>
                    <span style={styles.logoIcon}>🚗</span> ParkCol
                </Link>
                
                <nav style={styles.nav}>
                    {usuario ? (
                        <>
                            <span style={styles.userName}>👤 {usuario.nombre}</span>
                            <button onClick={handleLogout} style={styles.logoutBtn}>
                                Cerrar sesión
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={styles.link}>Iniciar sesión</Link>
                            <Link to="/registro" style={styles.registerBtn}>Registrarse</Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

const styles = {
    header: {
        backgroundColor: '#2C3E50',
        padding: '1rem 0',
        color: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    logo: {
        fontSize: '1.8rem',
        fontWeight: 'bold',
        color: 'white',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
    },
    logoIcon: {
        fontSize: '2rem'
    },
    nav: {
        display: 'flex',
        gap: '20px',
        alignItems: 'center'
    },
    link: {
        color: 'white',
        textDecoration: 'none',
        fontSize: '1rem',
        padding: '8px 15px',
        borderRadius: '5px',
        transition: 'background 0.3s'
    },
    registerBtn: {
        backgroundColor: '#FF7E5F',
        color: 'white',
        textDecoration: 'none',
        padding: '8px 20px',
        borderRadius: '5px',
        fontWeight: 'bold',
        transition: 'background 0.3s'
    },
    userName: {
        color: '#FF7E5F',
        fontWeight: 'bold'
    },
    logoutBtn: {
        backgroundColor: 'transparent',
        color: '#FF7E5F',
        border: '1px solid #FF7E5F',
        padding: '5px 15px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '0.9rem'
    }
};

export default Header;