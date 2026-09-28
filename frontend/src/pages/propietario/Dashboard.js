import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

const DashboardPropietario = () => {
    const navigate = useNavigate();
    const [parqueaderos, setParqueaderos] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        visitas: 0,
        calificacionPromedio: 0,
        espaciosDisponibles: 0
    });
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [parqRes, statsRes] = await Promise.all([
                API.get('/propietario/mis-parqueaderos'),
                API.get('/propietario/estadisticas')
            ]);
            setParqueaderos(parqRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setCargando(false);
        }
    };

    const eliminarParqueadero = async (id) => {
        if (!window.confirm('¿Eliminar este parqueadero?')) return;
        
        try {
            await API.delete(`/propietario/parqueaderos/${id}`);
            cargarDatos(); // Recargar lista
        } catch (error) {
            console.error('Error:', error);
        }
    };

    if (cargando) return <div style={styles.loading}>Cargando panel...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Panel de Propietario</h1>
                <button 
                    onClick={() => navigate('/propietario/crear')}
                    style={styles.addButton}
                >
                    + Nuevo parqueadero
                </button>
            </div>

            {/* Tarjetas de estadísticas */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <span style={styles.statValue}>{stats.total}</span>
                    <span style={styles.statLabel}>Parqueaderos</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statValue}>{stats.visitas}</span>
                    <span style={styles.statLabel}>Visitas</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statValue}>{stats.calificacionPromedio} ⭐</span>
                    <span style={styles.statLabel}>Calificación</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statValue}>{stats.espaciosDisponibles}</span>
                    <span style={styles.statLabel}>Espacios</span>
                </div>
            </div>

            {/* Lista de parqueaderos */}
            <h2 style={styles.subtitle}>Mis parqueaderos</h2>
            
            {parqueaderos.length === 0 ? (
                <div style={styles.empty}>
                    <p>No tienes parqueaderos registrados</p>
                    <button 
                        onClick={() => navigate('/propietario/crear')}
                        style={styles.emptyButton}
                    >
                        Crear el primero
                    </button>
                </div>
            ) : (
                <div style={styles.parqueaderosGrid}>
                    {parqueaderos.map(p => (
                        <div key={p._id} style={styles.card}>
                            {p.fotos?.length > 0 && (
                                <img 
                                    src={p.fotos[0]} 
                                    alt={p.nombre}
                                    style={styles.cardImage}
                                />
                            )}
                            <div style={styles.cardContent}>
                                <h3 style={styles.cardTitle}>{p.nombre}</h3>
                                <p style={styles.cardInfo}>📍 {p.direccion}</p>
                                <p style={styles.cardInfo}>⭐ {p.rating || 0} · 💰 ${p.precio}/h · 🅿️ {p.espacios}</p>
                                
                                <div style={styles.cardActions}>
                                    <button 
                                        onClick={() => navigate(`/propietario/editar/${p._id}`)}
                                        style={styles.editButton}
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button 
                                        onClick={() => navigate(`/propietario/fotos/${p._id}`)}
                                        style={styles.photoButton}
                                    >
                                        📸 Fotos
                                    </button>
                                    <button 
                                        onClick={() => eliminarParqueadero(p._id)}
                                        style={styles.deleteButton}
                                    >
                                        🗑️ Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
    },
    title: {
        fontSize: '2rem',
        color: '#2C3E50',
        margin: 0
    },
    addButton: {
        backgroundColor: '#FF7E5F',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '5px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.3s'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
    },
    statCard: {
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '10px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        textAlign: 'center',
        transition: 'transform 0.3s'
    },
    statValue: {
        display: 'block',
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: '#FF7E5F',
        marginBottom: '5px'
    },
    statLabel: {
        color: '#666',
        fontSize: '0.9rem',
        textTransform: 'uppercase',
        letterSpacing: '1px'
    },
    subtitle: {
        fontSize: '1.5rem',
        color: '#2C3E50',
        marginBottom: '20px'
    },
    empty: {
        textAlign: 'center',
        padding: '60px 20px',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    emptyButton: {
        backgroundColor: '#FF7E5F',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '5px',
        marginTop: '15px',
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    parqueaderosGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '20px'
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        transition: 'transform 0.3s, box-shadow 0.3s'
    },
    cardImage: {
        width: '100%',
        height: '200px',
        objectFit: 'cover'
    },
    cardContent: {
        padding: '20px'
    },
    cardTitle: {
        fontSize: '1.2rem',
        color: '#2C3E50',
        margin: '0 0 10px 0'
    },
    cardInfo: {
        color: '#666',
        fontSize: '0.9rem',
        margin: '5px 0'
    },
    cardActions: {
        display: 'flex',
        gap: '10px',
        marginTop: '15px',
        flexWrap: 'wrap'
    },
    editButton: {
        backgroundColor: '#2C3E50',
        color: 'white',
        border: 'none',
        padding: '8px 15px',
        borderRadius: '5px',
        cursor: 'pointer',
        flex: 1
    },
    photoButton: {
        backgroundColor: '#00C9A7',
        color: 'white',
        border: 'none',
        padding: '8px 15px',
        borderRadius: '5px',
        cursor: 'pointer',
        flex: 1
    },
    deleteButton: {
        backgroundColor: '#F44336',
        color: 'white',
        border: 'none',
        padding: '8px 15px',
        borderRadius: '5px',
        cursor: 'pointer',
        flex: 1
    },
    loading: {
        textAlign: 'center',
        padding: '50px',
        color: '#666',
        fontSize: '1.2rem'
    }
};

export default DashboardPropietario;