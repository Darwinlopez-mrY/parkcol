import axios from 'axios';

const API = axios.create({
    baseURL: process.env.NODE_ENV === 'production' 
        ? 'https://parkcol.onrender.com/api' 
        : 'http://localhost:5000/api'
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export const registrarUsuario = (datos) => API.post('/usuarios/registro', datos);
export const loginUsuario = (datos) => API.post('/usuarios/login', datos);

export default API;