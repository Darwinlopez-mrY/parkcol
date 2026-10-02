import API from './api';

// ========================================
// SERVICIO DE ADMINISTRACIÓN
// ========================================
// Centraliza todas las llamadas a /api/admin/*
// Todas las funciones requieren token de admin
// (el interceptor de api.js añade el token automáticamente)
// ========================================

// ============ ESTADÍSTICAS ============
export const obtenerEstadisticas = () => 
    API.get('/admin/estadisticas');

// ============ USUARIOS ============
export const listarUsuarios = (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.rol) params.append('rol', filtros.rol);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.q) params.append('q', filtros.q);
    if (filtros.page) params.append('page', filtros.page);
    if (filtros.limit) params.append('limit', filtros.limit);

    const query = params.toString();
    return API.get(`/admin/usuarios${query ? '?' + query : ''}`);
};

export const obtenerUsuario = (id) =>
    API.get(`/admin/usuarios/${id}`);

export const cambiarRolUsuario = (id, rol) =>
    API.put(`/admin/usuarios/${id}/rol`, { rol });

export const banearUsuario = (id, reason, durationDays = null) =>
    API.post(`/admin/usuarios/${id}/ban`, { reason, durationDays });

export const desbanearUsuario = (id) =>
    API.post(`/admin/usuarios/${id}/unban`);

export const eliminarUsuario = (id) =>
    API.delete(`/admin/usuarios/${id}`);

// ============ PARQUEADEROS ============
export const listarParqueaderos = (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.ciudad) params.append('ciudad', filtros.ciudad);
    if (filtros.q) params.append('q', filtros.q);
    if (filtros.page) params.append('page', filtros.page);
    if (filtros.limit) params.append('limit', filtros.limit);

    const query = params.toString();
    return API.get(`/admin/parqueaderos${query ? '?' + query : ''}`);
};

export const eliminarParqueadero = (id) =>
    API.delete(`/admin/parqueaderos/${id}`);

// ============ FOTOS DE PARQUEADEROS (ADMIN) ============
export const subirFotoAdmin = (parqueaderoId, archivo) => {
    const formData = new FormData();
    formData.append('foto', archivo);

    return API.post(
        `/admin/parqueaderos/${parqueaderoId}/fotos`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
    );
};

export const eliminarFotoAdmin = (parqueaderoId, fotoUrl) =>
    API.delete(`/admin/parqueaderos/${parqueaderoId}/fotos`, {
        data: { fotoUrl }
    });

export const obtenerParqueaderoAdmin = (id) =>
    API.get(`/admin/parqueaderos/${id}`);