import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    listarParqueaderos,
    eliminarParqueadero
} from '../../services/adminAPI';

const Parqueaderos = () => {
    // ============ ESTADOS ============
    const navigate = useNavigate();
    const [parqueaderos, setParqueaderos] = useState([]);
    const [paginacion, setPaginacion] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    // Filtros
    const [filtros, setFiltros] = useState({
        ciudad: '',
        q: '',
        page: 1,
        limit: 10
    });

    // ============ CARGAR PARQUEADEROS ============
    // Usamos un ref para controlar que solo cargue una vez al montar
    const montadoRef = useRef(false);

    const cargarConFiltros = useCallback(async (filtrosAUsar) => {
        try {
            setCargando(true);
            setError('');
            const response = await listarParqueaderos(filtrosAUsar);
            setParqueaderos(response.data.parqueaderos);
            setPaginacion(response.data.paginacion);
        } catch (err) {
            console.error('Error cargando parqueaderos:', err);
            setError('Error al cargar parqueaderos');
        } finally {
            setCargando(false);
        }
    }, []);

    // Carga inicial (solo una vez, incluso con StrictMode)
    useEffect(() => {
        if (montadoRef.current) return;  // 👈 Ignorar la segunda llamada del StrictMode
        montadoRef.current = true;
        
        cargarConFiltros({ ciudad: '', q: '', page: 1, limit: 10 });
    }, [cargarConFiltros]);

        // Carga inicial
        useEffect(() => {
            cargarConFiltros({ ciudad: '', q: '', page: 1, limit: 10 });
        }, [cargarConFiltros]);

    // ============ HANDLERS ============
    const handleFiltroChange = (key, value) => {
        const nuevosFiltros = { ...filtros, [key]: value, page: 1 };
        setFiltros(nuevosFiltros);
        cargarConFiltros(nuevosFiltros);
    };

    const handleCambiarPagina = (nuevaPagina) => {
        const nuevosFiltros = { ...filtros, page: nuevaPagina };
        setFiltros(nuevosFiltros);
        cargarConFiltros(nuevosFiltros);
    };

    const handleBuscar = (e) => {
        e.preventDefault();
        cargarConFiltros(filtros);
    };

    // ============ ELIMINAR PARQUEADERO ============
    const handleEliminar = async (parqueadero) => {
        const mensaje = `⚠️ ¿Eliminar el parqueadero "${parqueadero.nombre}"?\n\n` +
            `Ubicación: ${parqueadero.direccion}, ${parqueadero.ciudad}\n` +
            `Propietario: ${parqueadero.propietario_id?.nombre || 'N/A'}\n\n` +
            `Esta acción NO se puede deshacer.`;
        
        if (!window.confirm(mensaje)) return;

        try {
            await eliminarParqueadero(parqueadero._id);
            cargarConFiltros(filtros);
            alert('✅ Parqueadero eliminado');
        } catch (err) {
            alert(`❌ ${err.response?.data?.mensaje || 'Error al eliminar'}`);
        }
    };

    // ============ HELPERS ============
    const formatearPrecio = (precio) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(precio);
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
            <h1 style={styles.title}>🅿️ Parqueaderos</h1>
            <p style={styles.subtitle}>
                {paginacion && paginacion.total !== undefined 
                    ? `${paginacion.total} parqueaderos registrados en total`
                    : `cargando (paginacion=${String(paginacion)})`
                }
            </p>

            {/* FILTROS */}
            <div style={styles.filters}>
                <input
                    type="text"
                    placeholder="🔍 Buscar por nombre o dirección..."
                    value={filtros.q}
                    onChange={(e) => setFiltros(prev => ({ ...prev, q: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleBuscar(e)}
                    style={styles.searchInput}
                />
                <select
                    value={filtros.ciudad}
                    onChange={(e) => handleFiltroChange('ciudad', e.target.value)}
                    style={styles.filterSelect}
                >
                    <option value="">Todas las ciudades</option>
                    <option value="Bogotá">Bogotá</option>
                    <option value="Medellín">Medellín</option>
                    <option value="Cali">Cali</option>
                    <option value="Barranquilla">Barranquilla</option>
                    <option value="Cartagena">Cartagena</option>
                    <option value="Bucaramanga">Bucaramanga</option>
                    <option value="Pereira">Pereira</option>
                    <option value="Manizales">Manizales</option>
                    <option value="Cúcuta">Cúcuta</option>
                    <option value="Santa Marta">Santa Marta</option>
                    <option value="Ibagué">Ibagué</option>
                    <option value="Villavicencio">Villavicencio</option>
                    <option value="Pasto">Pasto</option>
                    <option value="Montería">Montería</option>
                    <option value="Neiva">Neiva</option>
                </select>
                <button onClick={handleBuscar} style={styles.searchBtn}>
                    🔍 Buscar
                </button>
            </div>

            {/* TABLA */}
            {cargando ? (
                <div style={styles.loading}>⏳ Cargando parqueaderos...</div>
            ) : error ? (
                <div style={styles.error}>❌ {error}</div>
            ) : parqueaderos.length === 0 ? (
                <div style={styles.empty}>📭 No se encontraron parqueaderos</div>
            ) : (
                <>
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHeader}>
                                    <th style={styles.th}>Nombre</th>
                                    <th style={styles.th}>Ciudad</th>
                                    <th style={styles.th}>Precio</th>
                                    <th style={styles.th}>Espacios</th>
                                    <th style={styles.th}>Rating</th>
                                    <th style={styles.th}>Propietario</th>
                                    <th style={styles.th}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parqueaderos.map(p => {
                                    const propietarioBaneado = p.propietario_id?.banned;
                                    
                                    return (
                                        <tr key={p._id} style={styles.tableRow}>
                                            <td style={styles.td}>
                                                <strong>{p.nombre}</strong>
                                                <br />
                                                <small style={{color: '#666'}}>
                                                    📍 {p.direccion}
                                                </small>
                                            </td>
                                            <td style={styles.td}>🌆 {p.ciudad}</td>
                                            <td style={styles.td}>
                                                <strong style={{color: '#FF7E5F'}}>
                                                    {formatearPrecio(p.precio)}
                                                </strong>
                                                <br />
                                                <small style={{color: '#666'}}>por hora</small>
                                            </td>
                                            <td style={styles.td}>
                                                {p.disponible && p.espacios > 0 ? (
                                                    <span style={{...styles.badge, backgroundColor: '#4CAF50'}}>
                                                        ✅ {p.espacios}
                                                    </span>
                                                ) : (
                                                    <span style={{...styles.badge, backgroundColor: '#F44336'}}>
                                                        🔴 Lleno
                                                    </span>
                                                )}
                                            </td>
                                            <td style={styles.td}>
                                                ⭐ {p.rating?.toFixed(1) || '0.0'}
                                                <br />
                                                <small style={{color: '#666'}}>
                                                    ({p.reseñas || 0} reseñas)
                                                </small>
                                            </td>
                                            <td style={styles.td}>
                                                <div>
                                                    <strong>
                                                        {p.propietario_id?.nombre || 'N/A'}
                                                    </strong>
                                                    <br />
                                                    <small style={{color: '#666'}}>
                                                        {p.propietario_id?.email || ''}
                                                    </small>
                                                    {propietarioBaneado && (
                                                        <div style={{
                                                            ...styles.badge,
                                                            backgroundColor: '#F44336',
                                                            marginTop: '5px',
                                                            display: 'inline-block'
                                                        }}>
                                                            🚫 Propietario baneado
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={styles.actions}>
                                                    <button
                                                        onClick={() => navigate(`/parqueadero/${p._id}`, { 
                                                            state: { volverA: '/admin/parqueaderos' } 
                                                        })}
                                                        style={{...styles.actionBtn, backgroundColor: '#2196F3'}}
                                                        title="Ver detalle público"
                                                    >
                                                        👁️
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/admin/parqueaderos/${p._id}/fotos`)}
                                                        style={{...styles.actionBtn, backgroundColor: '#9C27B0'}}
                                                        title="Administrar fotos"
                                                    >
                                                        📸
                                                    </button>
                                                    <button
                                                        onClick={() => handleEliminar(p)}
                                                        style={{...styles.actionBtn, backgroundColor: '#F44336'}}
                                                        title="Eliminar"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
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
    td: { padding: '15px', fontSize: '0.9rem', color: '#2C3E50', verticalAlign: 'top' },
    badge: { display: 'inline-block', padding: '4px 10px', borderRadius: '12px', color: 'white', fontSize: '0.75rem', fontWeight: 'bold', whiteSpace: 'nowrap' },
    actions: { display: 'flex', gap: '5px' },
    actionBtn: { width: '35px', height: '35px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' },
    pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '25px' },
    pageBtn: { padding: '8px 15px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', color: '#2C3E50' },
    pageBtnDisabled: { padding: '8px 15px', backgroundColor: '#f5f5f5', border: '1px solid #eee', borderRadius: '6px', cursor: 'not-allowed', color: '#bbb' },
    pageInfo: { color: '#666', fontSize: '0.9rem' },
    loading: { textAlign: 'center', padding: '50px', color: '#666' },
    error: { padding: '20px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '8px', textAlign: 'center' },
    empty: { textAlign: 'center', padding: '60px 20px', color: '#999', fontSize: '1.1rem', backgroundColor: 'white', borderRadius: '10px' }
};

export default Parqueaderos;