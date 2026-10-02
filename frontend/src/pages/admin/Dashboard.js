import React, { useState, useEffect } from 'react';
import { obtenerEstadisticas } from '../../services/adminAPI';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        cargarEstadisticas();
    }, []);

    const cargarEstadisticas = async () => {
        try {
            setCargando(true);
            const response = await obtenerEstadisticas();
            setStats(response.data);
            setError('');
        } catch (err) {
            console.error('Error:', err);
            setError('Error al cargar estadísticas');
        } finally {
            setCargando(false);
        }
    };

    if (cargando) {
        return <div style={styles.loading}>📊 Cargando estadísticas...</div>;
    }

    if (error) {
        return <div style={styles.error}>❌ {error}</div>;
    }

    if (!stats) return null;

    return (
        <div>
            <h1 style={styles.title}>📊 Dashboard</h1>
            <p style={styles.subtitle}>Resumen general de ParkCol</p>

            {/* ============ TARJETAS DE USUARIOS ============ */}
            <h2 style={styles.sectionTitle}>👥 Usuarios</h2>
            <div style={styles.cardsGrid}>
                <div style={{...styles.card, borderTopColor: '#FF7E5F'}}>
                    <span style={styles.cardIcon}>👥</span>
                    <span style={styles.cardValue}>{stats.usuarios.total}</span>
                    <span style={styles.cardLabel}>Total usuarios</span>
                </div>
                <div style={{...styles.card, borderTopColor: '#4CAF50'}}>
                    <span style={styles.cardIcon}>🙋</span>
                    <span style={styles.cardValue}>{stats.usuarios.clientes}</span>
                    <span style={styles.cardLabel}>Clientes</span>
                </div>
                <div style={{...styles.card, borderTopColor: '#2196F3'}}>
                    <span style={styles.cardIcon}>🏢</span>
                    <span style={styles.cardValue}>{stats.usuarios.propietarios}</span>
                    <span style={styles.cardLabel}>Propietarios</span>
                </div>
                <div style={{...styles.card, borderTopColor: '#9C27B0'}}>
                    <span style={styles.cardIcon}>🔧</span>
                    <span style={styles.cardValue}>{stats.usuarios.admins}</span>
                    <span style={styles.cardLabel}>Admins</span>
                </div>
                {stats.usuarios.baneados > 0 && (
                    <div style={{...styles.card, borderTopColor: '#F44336'}}>
                        <span style={styles.cardIcon}>🚫</span>
                        <span style={styles.cardValue}>{stats.usuarios.baneados}</span>
                        <span style={styles.cardLabel}>Baneados</span>
                    </div>
                )}
            </div>

            {/* ============ TARJETAS DE PARQUEADEROS ============ */}
            <h2 style={styles.sectionTitle}>🅿️ Parqueaderos</h2>
            <div style={styles.cardsGrid}>
                <div style={{...styles.card, borderTopColor: '#FF7E5F'}}>
                    <span style={styles.cardIcon}>🅿️</span>
                    <span style={styles.cardValue}>{stats.parqueaderos.total}</span>
                    <span style={styles.cardLabel}>Total parqueaderos</span>
                </div>
                <div style={{...styles.card, borderTopColor: '#4CAF50'}}>
                    <span style={styles.cardIcon}>✅</span>
                    <span style={styles.cardValue}>{stats.parqueaderos.disponibles}</span>
                    <span style={styles.cardLabel}>Con espacios</span>
                </div>
                <div style={{...styles.card, borderTopColor: '#F44336'}}>
                    <span style={styles.cardIcon}>🔴</span>
                    <span style={styles.cardValue}>{stats.parqueaderos.noDisponibles}</span>
                    <span style={styles.cardLabel}>Sin espacios</span>
                </div>
            </div>

            {/* ============ DOS COLUMNAS: TOP CIUDADES + PROMEDIOS ============ */}
            <div style={styles.twoColumns}>
                {/* Top ciudades */}
                <div style={styles.box}>
                    <h2 style={styles.boxTitle}>🏙️ Top 5 ciudades</h2>
                    {stats.topCiudades && stats.topCiudades.length > 0 ? (
                        <div style={styles.ciudadesList}>
                            {stats.topCiudades.map((ciudad, i) => (
                                <div key={ciudad._id} style={styles.ciudadItem}>
                                    <span style={styles.ciudadRank}>#{i + 1}</span>
                                    <span style={styles.ciudadNombre}>{ciudad._id}</span>
                                    <span style={styles.ciudadTotal}>{ciudad.total} parq.</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={styles.empty}>No hay datos</p>
                    )}
                </div>

                {/* Promedios */}
                <div style={styles.box}>
                    <h2 style={styles.boxTitle}>📈 Promedios globales</h2>
                    <div style={styles.promediosList}>
                        <div style={styles.promedioItem}>
                            <span style={styles.promedioIcon}>💰</span>
                            <div>
                                <span style={styles.promedioValor}>
                                    ${Math.round(stats.promedios.precioPromedio || 0).toLocaleString('es-CO')}
                                </span>
                                <span style={styles.promedioLabel}>Precio promedio/hora</span>
                            </div>
                        </div>
                        <div style={styles.promedioItem}>
                            <span style={styles.promedioIcon}>⭐</span>
                            <div>
                                <span style={styles.promedioValor}>
                                    {(stats.promedios.ratingPromedio || 0).toFixed(1)}
                                </span>
                                <span style={styles.promedioLabel}>Rating promedio</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    title: {
        fontSize: '2rem',
        color: '#2C3E50',
        margin: '0 0 5px 0'
    },
    subtitle: {
        color: '#666',
        margin: '0 0 30px 0'
    },
    sectionTitle: {
        fontSize: '1.3rem',
        color: '#2C3E50',
        margin: '30px 0 15px 0'
    },
    cardsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '15px'
    },
    card: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        borderTop: '4px solid #FF7E5F',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
    },
    cardIcon: {
        fontSize: '1.8rem',
        marginBottom: '10px'
    },
    cardValue: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#2C3E50',
        lineHeight: 1
    },
    cardLabel: {
        fontSize: '0.85rem',
        color: '#666',
        marginTop: '5px'
    },
    twoColumns: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        marginTop: '30px'
    },
    box: {
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
    },
    boxTitle: {
        fontSize: '1.2rem',
        color: '#2C3E50',
        margin: '0 0 20px 0'
    },
    ciudadesList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    ciudadItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px',
        backgroundColor: '#F8FAFC',
        borderRadius: '6px'
    },
    ciudadRank: {
        fontWeight: 'bold',
        color: '#FF7E5F',
        fontSize: '1.1rem',
        minWidth: '35px'
    },
    ciudadNombre: {
        flex: 1,
        color: '#2C3E50',
        fontWeight: '500'
    },
    ciudadTotal: {
        color: '#666',
        fontSize: '0.9rem'
    },
    promediosList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    promedioItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
    },
    promedioIcon: {
        fontSize: '2rem',
        width: '50px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: '10px'
    },
    promedioValor: {
        display: 'block',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#2C3E50'
    },
    promedioLabel: {
        display: 'block',
        fontSize: '0.85rem',
        color: '#666',
        marginTop: '2px'
    },
    empty: {
        color: '#999',
        fontStyle: 'italic',
        textAlign: 'center',
        padding: '20px'
    },
    loading: {
        padding: '50px',
        textAlign: 'center',
        color: '#666',
        fontSize: '1.2rem'
    },
    error: {
        padding: '20px',
        backgroundColor: '#ffebee',
        color: '#c62828',
        borderRadius: '8px',
        textAlign: 'center'
    }
};

export default Dashboard;