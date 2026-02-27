import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const ParqueaderoDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { usuario } = useAuth();
    const [parqueadero, setParqueadero] = useState(null);
    const [cargando, setCargando] = useState(true);

    const cargarParqueadero = useCallback(async () => {
        try {
            const response = await API.get(`/parqueaderos/${id}`);
            setParqueadero(response.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setCargando(false);
        }
    }, [id]);

    useEffect(() => {
        cargarParqueadero();
    }, [cargarParqueadero]);

    if (cargando) return <div style={styles.loading}>Cargando...</div>;
    if (!parqueadero) return <div style={styles.error}>Parqueadero no encontrado</div>;

    return (
        <div style={styles.container}>
            {/* Encabezado */}
            <div style={styles.header}>
                <button onClick={() => navigate(-1)} style={styles.backButton}>
                    ← Atrás
                </button>
                <h1 style={styles.title}>{parqueadero.nombre}</h1>
                <div style={styles.rating}>
                    ⭐ {parqueadero.rating} ({parqueadero.reseñas} reseñas)
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
                    <strong>📞 Teléfono:</strong> {parqueadero.telefono}
                </div>
                <div style={styles.infoItem}>
                    <strong>🕐 Horario:</strong> {parqueadero.horario}
                </div>
                <div style={styles.infoItem}>
                    <strong>💰 Precio por hora:</strong> ${parqueadero.precio}
                </div>
            </div>

            {/* Disponibilidad */}
            <div style={styles.disponibilidad}>
                <h3>Disponibilidad</h3>
                <div style={styles.barraProgreso}>
                    <div style={{
                        ...styles.barraLlena,
                        width: `${(parqueadero.espaciosDisponibles || parqueadero.espacios) / (parqueadero.capacidadTotal || 40) * 100}%`,
                        backgroundColor: parqueadero.disponible ? (parqueadero.espacios < 5 ? '#FF9800' : '#4CAF50') : '#F44336'
                    }} />
                </div>
                <p>
                    {parqueadero.disponible 
                        ? `🟢 ${parqueadero.espacios} espacios disponibles` 
                        : '🔴 Completamente lleno'}
                </p>
            </div>
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
        marginBottom: '15px'
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
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
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
    loading: {
        textAlign: 'center',
        padding: '50px',
        color: '#666'
    },
    error: {
        textAlign: 'center',
        padding: '50px',
        color: '#F44336'
    }
};

export default ParqueaderoDetalle;