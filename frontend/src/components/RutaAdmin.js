import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RutaAdmin = ({ children }) => {
    const { usuario, cargando } = useAuth(); // 👈 Incluir 'cargando'

    // 👈 Mientras se recupera el usuario del localStorage, mostrar spinner
    if (cargando) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
                color: '#666'
            }}>
                <div style={{ fontSize: '2rem', marginBottom: '15px' }}>⏳</div>
                <p>Cargando...</p>
            </div>
        );
    }

    // Si no hay usuario → login
    if (!usuario) {
        return <Navigate to="/login" replace />;
    }

    // Si no es admin → inicio
    if (usuario.rol !== 'admin') {
        return <Navigate to="/" replace />;
    }

    // Es admin → renderiza el contenido
    return children;
};

export default RutaAdmin;