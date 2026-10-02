import React, { useState, useEffect, useCallback } from 'react';
import {
    listarUsuarios,
    cambiarRolUsuario,
    banearUsuario,
    desbanearUsuario,
    eliminarUsuario
} from '../../services/adminAPI';

const Usuarios = () => {
    // ============ ESTADOS ============
    const [usuarios, setUsuarios] = useState([]);
    const [paginacion, setPaginacion] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    // Filtros
    const [filtros, setFiltros] = useState({
        rol: '',
        estado: '',
        q: '',
        page: 1,
        limit: 10
    });

    // Modales
    const [modalBan, setModalBan] = useState(null);
    const [modalRol, setModalRol] = useState(null);
    const [banReason, setBanReason] = useState('');
    const [banDuration, setBanDuration] = useState('');

    // ============ CARGAR USUARIOS ============
    // Esta función recibe los filtros como parámetro
    // para evitar problemas de closure/race conditions
    const cargarConFiltros = useCallback(async (filtrosAUsar) => {
        try {
            setCargando(true);
            setError('');
            const response = await listarUsuarios(filtrosAUsar);
            setUsuarios(response.data.usuarios);
            setPaginacion(response.data.paginacion);
        } catch (err) {
            console.error('Error cargando usuarios:', err);
            setError('Error al cargar usuarios');
        } finally {
            setCargando(false);
        }
    }, []);

    // Carga inicial (una sola vez)
    useEffect(() => {
        cargarConFiltros({ rol: '', estado: '', q: '', page: 1, limit: 10 });
    }, [cargarConFiltros]);

    // ============ HANDLERS ============
    // Cambiar un filtro (resetea a página 1)
    const handleFiltroChange = (key, value) => {
        const nuevosFiltros = { ...filtros, [key]: value, page: 1 };
        setFiltros(nuevosFiltros);
        cargarConFiltros(nuevosFiltros);
    };

    // Cambiar de página
    const handleCambiarPagina = (nuevaPagina) => {
        const nuevosFiltros = { ...filtros, page: nuevaPagina };
        setFiltros(nuevosFiltros);
        cargarConFiltros(nuevosFiltros);
    };

    // Botón "Buscar"
    const handleBuscar = (e) => {
        e.preventDefault();
        cargarConFiltros(filtros);
    };

    // ============ ACCIONES ============
    const handleCambiarRol = async (nuevoRol) => {
        if (!modalRol) return;
        try {
            await cambiarRolUsuario(modalRol._id, nuevoRol);
            setModalRol(null);
            cargarConFiltros(filtros);
            alert(`✅ Rol cambiado a "${nuevoRol}"`);
        } catch (err) {
            alert(`❌ ${err.response?.data?.mensaje || 'Error al cambiar rol'}`);
        }
    };

    const handleBanear = async () => {
        if (!banReason.trim() || banReason.trim().length < 5) {
            alert('❌ La razón debe tener al menos 5 caracteres');
            return;
        }
        try {
            const duracion = banDuration === '' ? null : parseInt(banDuration);
            await banearUsuario(modalBan._id, banReason, duracion);
            setModalBan(null);
            setBanReason('');
            setBanDuration('');
            cargarConFiltros(filtros);
            alert('✅ Usuario baneado');
        } catch (err) {
            alert(`❌ ${err.response?.data?.mensaje || 'Error al banear'}`);
        }
    };

    const handleDesbanear = async (usuario) => {
        if (!window.confirm(`¿Desbanear a ${usuario.nombre}?`)) return;
        try {
            await desbanearUsuario(usuario._id);
            cargarConFiltros(filtros);
            alert('✅ Usuario desbaneado');
        } catch (err) {
            alert(`❌ ${err.response?.data?.mensaje || 'Error al desbanear'}`);
        }
    };

    const handleEliminar = async (usuario) => {
        const mensaje = `⚠️ ¿Eliminar PERMANENTEMENTE a ${usuario.nombre}?\n\n` +
            `Esto NO se puede deshacer.` +
            (usuario.rol === 'propietario'
                ? '\n\nTambién se eliminarán TODOS sus parqueaderos.'
                : '');
        if (!window.confirm(mensaje)) return;
        try {
            await eliminarUsuario(usuario._id);
            cargarConFiltros(filtros);
            alert('✅ Usuario eliminado');
        } catch (err) {
            alert(`❌ ${err.response?.data?.mensaje || 'Error al eliminar'}`);
        }
    };

    // ============ HELPERS ============
    const getRolColor = (rol) => {
        const colores = {
            cliente: '#4CAF50',
            propietario: '#2196F3',
            admin: '#9C27B0'
        };
        return colores[rol] || '#999';
    };

    const getRolLabel = (rol) => {
        const labels = {
            cliente: '🙋 Cliente',
            propietario: '🏢 Propietario',
            admin: '🔧 Admin'
        };
        return labels[rol] || rol;
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return 'N/A';
        return new Date(fecha).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // ============ RENDER ============
    return (
        <div>
            <h1 style={styles.title}>👥 Usuarios</h1>
            <p style={styles.subtitle}>
                {paginacion?.total || 0} usuarios registrados en total
            </p>

            {/* FILTROS */}
            <div style={styles.filters}>
                <input
                    type="text"
                    placeholder="🔍 Buscar por nombre, email o teléfono..."
                    value={filtros.q}
                    onChange={(e) => setFiltros(prev => ({ ...prev, q: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleBuscar(e)}
                    style={styles.searchInput}
                />
                <select
                    value={filtros.rol}
                    onChange={(e) => handleFiltroChange('rol', e.target.value)}
                    style={styles.filterSelect}
                >
                    <option value="">Todos los roles</option>
                    <option value="cliente">Clientes</option>
                    <option value="propietario">Propietarios</option>
                    <option value="admin">Admins</option>
                </select>
                <select
                    value={filtros.estado}
                    onChange={(e) => handleFiltroChange('estado', e.target.value)}
                    style={styles.filterSelect}
                >
                    <option value="">Todos los estados</option>
                    <option value="activo">Activos</option>
                    <option value="baneado">Baneados</option>
                </select>
                <button onClick={handleBuscar} style={styles.searchBtn}>
                    🔍 Buscar
                </button>
            </div>

            {/* TABLA */}
            {cargando ? (
                <div style={styles.loading}>⏳ Cargando usuarios...</div>
            ) : error ? (
                <div style={styles.error}>❌ {error}</div>
            ) : usuarios.length === 0 ? (
                <div style={styles.empty}>📭 No se encontraron usuarios</div>
            ) : (
                <>
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHeader}>
                                    <th style={styles.th}>Nombre</th>
                                    <th style={styles.th}>Email</th>
                                    <th style={styles.th}>Teléfono</th>
                                    <th style={styles.th}>Rol</th>
                                    <th style={styles.th}>Estado</th>
                                    <th style={styles.th}>Registro</th>
                                    <th style={styles.th}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map(u => (
                                    <tr key={u._id} style={styles.tableRow}>
                                        <td style={styles.td}><strong>{u.nombre}</strong></td>
                                        <td style={styles.td}>{u.email}</td>
                                        <td style={styles.td}>{u.telefono}</td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.badge,
                                                backgroundColor: getRolColor(u.rol)
                                            }}>
                                                {getRolLabel(u.rol)}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            {u.estaBaneadoActual ? (
                                                <span style={{...styles.badge, backgroundColor: '#F44336'}}>
                                                    🚫 Baneado
                                                </span>
                                            ) : (
                                                <span style={{...styles.badge, backgroundColor: '#4CAF50'}}>
                                                    ✅ Activo
                                                </span>
                                            )}
                                        </td>
                                        <td style={styles.td}>{formatearFecha(u.createdAt)}</td>
                                        <td style={styles.td}>
                                            <div style={styles.actions}>
                                                {u.rol !== 'admin' && (
                                                    <>
                                                        <button
                                                            onClick={() => setModalRol(u)}
                                                            style={styles.actionBtn}
                                                            title="Cambiar rol"
                                                        >
                                                            🔄
                                                        </button>
                                                        {u.estaBaneadoActual ? (
                                                            <button
                                                                onClick={() => handleDesbanear(u)}
                                                                style={{...styles.actionBtn, backgroundColor: '#4CAF50'}}
                                                                title="Desbanear"
                                                            >
                                                                ✅
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => setModalBan(u)}
                                                                style={{...styles.actionBtn, backgroundColor: '#FF9800'}}
                                                                title="Banear"
                                                            >
                                                                🚫
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleEliminar(u)}
                                                            style={{...styles.actionBtn, backgroundColor: '#F44336'}}
                                                            title="Eliminar"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINACIÓN */}
                    {paginacion && paginacion.totalPaginas > 1 && (
                        <div style={styles.pagination}>
                            <button
                                onClick={() => handleCambiarPagina(filtros.page - 1)}
                                disabled={filtros.page === 1}
                                style={filtros.page === 1 ? styles.pageBtnDisabled : styles.pageBtn}
                            >
                                ← Anterior
                            </button>
                            <span style={styles.pageInfo}>
                                Página {paginacion.pagina} de {paginacion.totalPaginas}
                            </span>
                            <button
                                onClick={() => handleCambiarPagina(filtros.page + 1)}
                                disabled={filtros.page >= paginacion.totalPaginas}
                                style={filtros.page >= paginacion.totalPaginas ? styles.pageBtnDisabled : styles.pageBtn}
                            >
                                Siguiente →
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* MODAL BAN */}
            {modalBan && (
                <div style={styles.modalOverlay} onClick={() => setModalBan(null)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2 style={styles.modalTitle}>🚫 Banear usuario</h2>
                        <p style={styles.modalText}>
                            <strong>{modalBan.nombre}</strong><br />
                            <span style={{color: '#666'}}>{modalBan.email}</span>
                        </p>
                        <label style={styles.label}>Razón del ban *</label>
                        <textarea
                            value={banReason}
                            onChange={(e) => setBanReason(e.target.value)}
                            placeholder="Ej: Uso indebido de la plataforma..."
                            style={styles.textarea}
                            rows={3}
                        />
                        <label style={styles.label}>Duración (días)</label>
                        <input
                            type="number"
                            value={banDuration}
                            onChange={(e) => setBanDuration(e.target.value)}
                            placeholder="Vacío = ban permanente"
                            style={styles.input}
                            min="0"
                        />
                        <small style={styles.hint}>💡 Vacío o 0 = ban permanente</small>
                        <div style={styles.modalActions}>
                            <button onClick={() => setModalBan(null)} style={styles.cancelBtn}>
                                Cancelar
                            </button>
                            <button onClick={handleBanear} style={styles.dangerBtn}>
                                🚫 Banear
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL CAMBIO DE ROL */}
            {modalRol && (
                <div style={styles.modalOverlay} onClick={() => setModalRol(null)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2 style={styles.modalTitle}>🔄 Cambiar rol</h2>
                        <p style={styles.modalText}>
                            <strong>{modalRol.nombre}</strong><br />
                            <span style={{color: '#666'}}>Rol actual: {getRolLabel(modalRol.rol)}</span>
                        </p>
                        <div style={styles.rolBtns}>
                            <button onClick={() => handleCambiarRol('cliente')} style={{...styles.rolBtn, backgroundColor: '#4CAF50'}}>
                                🙋 Cliente
                            </button>
                            <button onClick={() => handleCambiarRol('propietario')} style={{...styles.rolBtn, backgroundColor: '#2196F3'}}>
                                🏢 Propietario
                            </button>
                            <button onClick={() => handleCambiarRol('admin')} style={{...styles.rolBtn, backgroundColor: '#9C27B0'}}>
                                🔧 Admin
                            </button>
                        </div>
                        <div style={styles.modalActions}>
                            <button onClick={() => setModalRol(null)} style={styles.cancelBtn}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    title: { fontSize: '2rem', color: '#2C3E50', margin: '0 0 5px 0' },
    subtitle: { color: '#666', margin: '0 0 25px 0' },
    filters: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
    searchInput: { flex: 1, minWidth: '250px', padding: '10px 15px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.95rem' },
    filterSelect: { padding: '10px 15px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.95rem', cursor: 'pointer', backgroundColor: 'white' },
    searchBtn: { padding: '10px 20px', backgroundColor: '#FF7E5F', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem' },
    tableContainer: { backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: '#F8FAFC' },
    th: { padding: '15px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 'bold', color: '#2C3E50', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #E2E8F0' },
    tableRow: { borderBottom: '1px solid #F1F5F9' },
    td: { padding: '15px', fontSize: '0.9rem', color: '#2C3E50' },
    badge: { display: 'inline-block', padding: '4px 10px', borderRadius: '12px', color: 'white', fontSize: '0.75rem', fontWeight: 'bold', whiteSpace: 'nowrap' },
    actions: { display: 'flex', gap: '5px' },
    actionBtn: { width: '35px', height: '35px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', backgroundColor: '#E2E8F0' },
    pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '25px' },
    pageBtn: { padding: '8px 15px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', color: '#2C3E50' },
    pageBtnDisabled: { padding: '8px 15px', backgroundColor: '#f5f5f5', border: '1px solid #eee', borderRadius: '6px', cursor: 'not-allowed', color: '#bbb' },
    pageInfo: { color: '#666', fontSize: '0.9rem' },
    loading: { textAlign: 'center', padding: '50px', color: '#666' },
    error: { padding: '20px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '8px', textAlign: 'center' },
    empty: { textAlign: 'center', padding: '60px 20px', color: '#999', fontSize: '1.1rem', backgroundColor: 'white', borderRadius: '10px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' },
    modal: { backgroundColor: 'white', padding: '30px', borderRadius: '10px', maxWidth: '450px', width: '100%', maxHeight: '90vh', overflowY: 'auto' },
    modalTitle: { fontSize: '1.3rem', color: '#2C3E50', margin: '0 0 15px 0' },
    modalText: { marginBottom: '20px', lineHeight: '1.5' },
    label: { display: 'block', marginBottom: '6px', marginTop: '12px', fontWeight: '600', fontSize: '0.9rem', color: '#2C3E50' },
    input: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.95rem', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.95rem', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' },
    hint: { display: 'block', marginTop: '5px', color: '#666', fontSize: '0.8rem', fontStyle: 'italic' },
    modalActions: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '25px' },
    cancelBtn: { padding: '10px 20px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', color: '#666' },
    dangerBtn: { padding: '10px 20px', backgroundColor: '#F44336', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
    rolBtns: { display: 'flex', flexDirection: 'column', gap: '10px' },
    rolBtn: { padding: '12px', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }
};

export default Usuarios;