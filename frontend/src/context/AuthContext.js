import React, { createContext, useState, useContext } from 'react';
import { loginUsuario, registrarUsuario } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Registrar
    const registro = async (datos) => {
        setLoading(true);
        setError('');
        try {
            const response = await registrarUsuario(datos);
            localStorage.setItem('token', response.data.token);
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