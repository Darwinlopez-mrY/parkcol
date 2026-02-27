import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSeguimiento } from '../context/SeguimientoContext';
import API from '../services/api';
import SolicitarViaje from '../components/SolicitarViaje';

const ParqueaderoDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { usuario } = useAuth();
    const { viajeActivo } = useSeguimiento();
    const [parqueadero, setParqueadero] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [mostrarSolicitud, setMostrarSolicitud] = useState(false);

    const cargarParqueadero = useCallback(async () => {
        try {
            setCargando(true);
            const response = await API.get(`/parqueaderos/${id}`);
            setParqueadero(response.data);
            setError('');
        } catch (error) {
            console.error('Error cargando parqueadero:', error);
            setError('No se pudo cargar la información del parqueadero');
        } finally {
            setCargando(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            cargarParqueadero();
        }
    }, [id, cargarParqueadero]);

    if (cargando) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>Cargando información del parqueadero...</div>
            </div>
        );
    }

    if (error || !parqueadero) {
        return (
            <div style={styles.container}>
                <div style={styles.error}>
                    <p>{error || 'Parqueadero no encontrado'}</p>
                    <button onClick={() => navigate(-1)} style={styles.backButton}>
                        ← Volver
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Encabezado con botón volver */}
            <div style={styles.header}>
                <button onClick={() => navigate(-1)} style={styles.backButton}>
                    ← Volver
                </button>
                <h1 style={styles.title}>{parqueadero.nombre}</h1>
                <div style={styles.rating}>
                    ⭐ {parqueadero.rating?.toFixed(1) || 'Nuevo'} ({parqueadero.reseñas || 0} reseñas)
                </div>
            </div>

            {/* Fotos del parqueadero */}
            <div style={styles.seccion}>
                <h2 style={styles.subtitulo}>📸 Fotos</h2>
                {parqueadero.fotos?.length > 0 ? (
                    <div style={styles.galeria}>
                        {parqueadero.fotos.map((foto, index) => (
                            <img 
                                key={index}
                                src={foto}
                                alt={`${parqueadero.nombre} - Foto ${index + 1}`}
                                style={styles.foto}
                                onClick={() => window.open(foto, '_blank')}
                            />
                        ))}
                    </div>
                ) : (
                    <div style={styles.sinFotos}>
                        <p>Este parqueadero aún no tiene fotos</p>
                        {usuario?.rol === 'propietario' && usuario?.id === parqueadero.propietario_id && (
                            <button 
                                onClick={() => navigate(`/propietario/fotos/${parqueadero._id}`)}
                                style={styles.subirFotosBtn}
                            >
                                📸 Subir fotos
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Información básica */}
            <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                    <strong>📍 Dirección:</strong> {parqueadero.direccion}
                </div>
                <div style={styles.infoItem}>
                    <strong>📞 Teléfono:</strong> {parqueadero.telefono || 'No disponible'}
                </div>
                <div style={styles.infoItem}>
                    <strong>🕐 Horario:</strong> {parqueadero.horario || 'No especificado'}
                </div>
                <div style={styles.infoItem}>
                    <strong>💰 Precio por hora:</strong> ${parqueadero.precio?.toLocaleString() || 'N/A'}
                </div>
                <div style={styles.infoItem}>
                    <strong>🚗 Capacidad:</strong> {parqueadero.capacidadTotal || parqueadero.espacios || 'N/A'} espacios
                </div>
            </div>

            {/* Disponibilidad */}
            <div style={styles.disponibilidad}>
                <h3>Disponibilidad</h3>
                <div style={styles.barraProgreso}>
                    <div style={{
                        ...styles.barraLlena,
                        width: `${(parqueadero.espacios / (parqueadero.capacidadTotal || parqueadero.espacios || 1)) * 100}%`,
                        backgroundColor: parqueadero.disponible 
                            ? (parqueadero.espacios < 5 ? '#FF9800' : '#4CAF50') 
                            : '#F44336'
                    }} />
                </div>
                <p style={{
                    color: parqueadero.disponible 
                        ? (parqueadero.espacios < 5 ? '#FF9800' : '#4CAF50') 
                        : '#F44336',
                    fontWeight: 'bold'
                }}>
                    {parqueadero.disponible 
                        ? `🟢 ${parqueadero.espacios} espacios disponibles` 
                        : '🔴 Completamente lleno'}
                </p>
            </div>

            {/* Servicios */}
            {parqueadero.servicios?.length > 0 && (
                <div style={styles.servicios}>
                    <h3>Servicios</h3>
                    <div style={styles.serviciosGrid}>
                        {parqueadero.servicios.map((servicio, index) => (
                            <span key={index} style={styles.servicioTag}>
                                ✓ {servicio}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* TRES BOTONES DE ACCIÓN */}
            <div style={styles.acciones}>
                {/* Botón 1: Llamar */}
                <a 
                    href={`tel:${parqueadero.telefono}`}
                    style={styles.btnLlamar}
                >
                    📞 Llamar
                </a>
                
                {/* Botón 2: Cómo llegar (dentro de ParkCol con ruta) */}
                <button 
                    onClick={() => navigate(`/buscar?destinoLat=${parqueadero.lat}&destinoLng=${parqueadero.lng}&destinoNombre=${encodeURIComponent(parqueadero.nombre)}`)}
                    style={styles.btnLlegar}
                >
                    🗺️ Cómo llegar
                </button>
                
                {/* Botón 3: Ver en mapa (sin ruta, solo centrado) */}
                <button 
                    onClick={() => navigate(`/buscar?lat=${parqueadero.lat}&lng=${parqueadero.lng}&nombre=${encodeURIComponent(parqueadero.nombre)}`)}
                    style={styles.btnMapa}
                >
                    📍 Ver en mapa
                </button>
            </div>

            {/* Botón de solicitar servicio (visible solo para usuarios normales) */}
            {usuario?.rol !== 'propietario' && (
                <button 
                    onClick={() => setMostrarSolicitud(true)}
                    style={styles.btnSolicitar}
                >
                    🚗 Solicitar servicio al parqueadero
                </button>
            )}

            {/* Estado del viaje activo (si existe) */}
            {viajeActivo && (
                <div style={styles.viajeActivo}>
                    <h3>🟢 Viaje activo</h3>
                    <p>Estado: {viajeActivo.estado}</p>
                    {viajeActivo.estado === 'aceptado' && (
                        <button 
                            onClick={() => navigate('/buscar?modo=seguimiento')}
                            style={styles.btnSeguir}
                        >
                            Ver seguimiento en mapa
                        </button>
                    )}
                </div>
            )}

            {/* Modal de solicitud */}
            {mostrarSolicitud && (
                <SolicitarViaje 
                    parqueadero={parqueadero}
                    onCerrar={() => setMostrarSolicitud(false)}
                />
            )}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '20px'
    },
    header: {
        marginBottom: '30px'
    },
    backButton: {
        backgroundColor: 'transparent',
        border: '1px solid #ddd',
        padding: '8px 15px',
        borderRadius: '5px',
        cursor: 'pointer',
        marginBottom: '15px',
        fontSize: '1rem',
        transition: 'background 0.3s',
        ':hover': {
            backgroundColor: '#f0f0f0'
        }
    },
    title: {
        fontSize: '2rem',
        color: '#2C3E50',
        marginBottom: '10px'
    },
    rating: {
        fontSize: '1.2rem',
        color: '#FFC107'
    },
    seccion: {
        marginBottom: '30px'
    },
    subtitulo: {
        fontSize: '1.5rem',
        color: '#2C3E50',
        marginBottom: '15px'
    },
    galeria: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
    },
    foto: {
        width: '100%',
        height: '150px',
        objectFit: 'cover',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'transform 0.3s',
        ':hover': {
            transform: 'scale(1.05)'
        }
    },
    sinFotos: {
        textAlign: 'center',
        padding: '40px',
        backgroundColor: '#f9f9f9',
        borderRadius: '10px',
        marginBottom: '20px',
        color: '#666'
    },
    subirFotosBtn: {
        backgroundColor: '#FF7E5F',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '5px',
        marginTop: '15px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background 0.3s',
        ':hover': {
            backgroundColor: '#E54E2A'
        }
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '15px',
        marginBottom: '30px',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    infoItem: {
        fontSize: '1rem',
        color: '#2C3E50'
    },
    disponibilidad: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '30px'
    },
    barraProgreso: {
        height: '20px',
        backgroundColor: '#f0f0f0',
        borderRadius: '10px',
        overflow: 'hidden',
        margin: '10px 0'
    },
    barraLlena: {
        height: '100%',
        transition: 'width 0.3s'
    },
    servicios: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '30px'
    },
    serviciosGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        marginTop: '15px'
    },
    servicioTag: {
        backgroundColor: '#f0f0f0',
        padding: '5px 12px',
        borderRadius: '20px',
        fontSize: '0.9rem',
        color: '#2C3E50'
    },
    acciones: {
        display: 'flex',
        gap: '10px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '15px'
    },
    btnLlamar: {
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        padding: '15px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold',
        textDecoration: 'none',
        display: 'inline-block',
        textAlign: 'center',
        flex: 1,
        minWidth: '120px',
        transition: 'background 0.3s',
        ':hover': {
            backgroundColor: '#45a049'
        }
    },
    btnLlegar: {
        backgroundColor: '#4285F4',
        color: 'white',
        border: 'none',
        padding: '15px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold',
        textDecoration: 'none',
        display: 'inline-block',
        textAlign: 'center',
        flex: 1,
        minWidth: '120px',
        transition: 'background 0.3s',
        ':hover': {
            backgroundColor: '#3367d6'
        }
    },
    btnMapa: {
        backgroundColor: '#9C27B0',
        color: 'white',
        border: 'none',
        padding: '15px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold',
        textDecoration: 'none',
        display: 'inline-block',
        textAlign: 'center',
        flex: 1,
        minWidth: '120px',
        transition: 'background 0.3s',
        ':hover': {
            backgroundColor: '#7B1FA2'
        }
    },
    btnSolicitar: {
        backgroundColor: '#FF7E5F',
        color: 'white',
        border: 'none',
        padding: '15px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold',
        width: '100%',
        fontSize: '1.1rem',
        marginTop: '10px',
        transition: 'background 0.3s',
        ':hover': {
            backgroundColor: '#E54E2A',
            transform: 'translateY(-2px)'
        }
    },
    viajeActivo: {
        backgroundColor: '#e8f5e9',
        padding: '20px',
        borderRadius: '10px',
        marginTop: '20px',
        border: '2px solid #4CAF50'
    },
    btnSeguir: {
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold',
        marginTop: '10px',
        width: '100%'
    },
    loading: {
        textAlign: 'center',
        padding: '50px',
        color: '#666',
        fontSize: '1.2rem'
    },
    error: {
        textAlign: 'center',
        padding: '50px',
        color: '#F44336',
        fontSize: '1.2rem'
    }
};

export default ParqueaderoDetalle;