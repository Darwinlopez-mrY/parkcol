import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUsuario, registrarUsuario } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true); // 👈 NUEVO: estado de carga inicial
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Recuperar usuario del localStorage al iniciar
    useEffect(() => {
        const usuarioGuardado = localStorage.getItem('usuario');
        if (usuarioGuardado) {
            try {
                setUsuario(JSON.parse(usuarioGuardado));
            } catch (e) {
                // Si el localStorage está corrupto, limpiar
                localStorage.removeItem('usuario');
                localStorage.removeItem('token');
            }
        }
        // 👈 Importante: marcar como terminado DESPUÉS de cargar
        setCargando(false);
    }, []);

    // Registrar
    const registro = async (datos) => {
        setLoading(true);
        setError('');
        try {
            const response = await registrarUsuario(datos);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
            setUsuario(response.data.usuario);
            return { success: true };
        } catch (error) {
            setError(error.response?.data?.mensaje || 'Error al registrar');
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    // Login
    const login = async (datos) => {
        setLoading(true);
        setError('');
        try {
            const response = await loginUsuario(datos);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
            setUsuario(response.data.usuario);
            return { success: true };
        } catch (error) {
            setError(error.response?.data?.mensaje || 'Error al iniciar sesión');
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    // Logout
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setUsuario(null);
    };

    return (
        <AuthContext.Provider value={{
            usuario,
            cargando,  // 👈 NUEVO: exponer el estado
            loading,
            error,
            registro,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};