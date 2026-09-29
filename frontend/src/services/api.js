import axios from 'axios';

// ========================================
// Determinar la URL base de la API
// ========================================
// Prioridad:
// 1. Variable de entorno REACT_APP_API_URL (definida en .env)
// 2. Fallback según NODE_ENV
// ========================================

const getBaseURL = () => {
    // 1. Si existe la variable de entorno, usarla
    if (process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
    }

    // 2. Fallback según entorno
    if (process.env.NODE_ENV === 'production') {
        return 'https://parkcol.onrender.com/api';
    }

    // 3. Default desarrollo
    return 'http://localhost:5000/api';
};

const API = axios.create({
    baseURL: getBaseURL(),
    withCredentials: false // No enviamos cookies, usamos JWT en headers
});

// ========================================
// Interceptor: Agregar token JWT a cada petición
// ========================================
API.interceptors.request.use(
    (req) => {
        const token = localStorage.getItem('token');
        if (token) {
            req.headers.Authorization = `Bearer ${token}`;
        }
        return req;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ========================================
// Interceptor de respuesta: Manejar 401 (token expirado)
// ========================================
API.interceptors.response.use(
    (response) => response,
    (error) => {
        // Si el token expiró (401), limpiar y redirigir al login
        if (error.response && error.response.status === 401) {
            const rutaActual = window.location.pathname;
            // No redirigir si ya estamos en login/registro
            if (rutaActual !== '/login' && rutaActual !== '/registro') {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                // Opcional: redirigir al login
                // window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// ========================================
// Funciones helper
// ========================================
export const registrarUsuario = (datos) => API.post('/usuarios/registro', datos);
export const loginUsuario = (datos) => API.post('/usuarios/login', datos);

export default API;