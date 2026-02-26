import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUsuario, registrarUsuario } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Recuperar usuario del localStorage al iniciar
    useEffect(() => {
        const usuarioGuardado = localStorage.getItem('usuario');
        if (usuarioGuardado) {
            setUsuario(JSON.parse(usuarioGuardado));
        }
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