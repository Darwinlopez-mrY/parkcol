import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';

const ParqueaderoDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [parqueadero, setParqueadero] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarParqueadero = async () => {
            try {
                const response = await API.get(`/parqueaderos/${id}`);
                setParqueadero(response.data);
                setCargando(false);
            } catch (error) {
                console.error('Error:', error);
                setCargando(false);
            }
        };
        
        cargarParqueadero();
    }, [id]);

    if (cargando) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>Cargando parqueadero...</div>
            </div>
        );
    }

    if (!parqueadero) {
        return (
            <div style={styles.container}>
                <div style={styles.error}>Parqueadero no encontrado</div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Encabezado */}
            <div style={styles.header}>
                <button onClick={() => navigate(-1)} style={styles.backButton}>
                    ← Atrás
                </button>
                <h1 style={styles.title}>Detalles del parqueadero</h1>
                <div style={styles.headerActions}>
                    <button style={styles.iconButton}>❤️</button>
                    <button style={styles.iconButton}>📤</button>
                </div>
            </div>

            {/* Galería de fotos */}
            <div style={styles.galeria}>
                {parqueadero.fotos.map((foto, i) => (
                    <div key={i} style={{
                        ...styles.fotoPlaceholder,
                        backgroundColor: i === 0 ? '#FF7E5F' : '#FFA07A'
                    }}>
                        {i === 0 ? 'Foto principal' : `Foto ${i+1}`}
                    </div>
                ))}
            </div>

            {/* Información principal */}
            <div style={styles.infoCard}>
                <h2 style={styles.nombre}>{parqueadero.nombre}</h2>
                <div style={styles.rating}>⭐ {parqueadero.calificacion} ({parqueadero.totalResenas} reseñas)</div>
                
                <div style={styles.infoGrid}>
                    <div style={styles.infoItem}>📍 {parqueadero.direccion}</div>
                    <div style={styles.infoItem}>📞 {parqueadero.telefono}</div>
                    <div style={styles.infoItem}>🕐 {parqueadero.horario}</div>
                </div>

                {/* Tarifas */}
                <h3 style={styles.subtitle}>Tarifas</h3>
                <div style={styles.tarifas}>
                    <div style={styles.tarifaCard}>
                        <span style={styles.tarifaTitulo}>HORA</span>
                        <span style={styles.tarifaValor}>${parqueadero.precioHora}</span>
                    </div>
                    <div style={styles.tarifaCard}>
                        <span style={styles.tarifaTitulo}>DÍA</span>
                        <span style={styles.tarifaValor}>${parqueadero.precioDia}</span>
                    </div>
                    <div style={styles.tarifaCard}>
                        <span style={styles.tarifaTitulo}>MES</span>
                        <span style={styles.tarifaValor}>${parqueadero.precioMes}</span>
                    </div>
                </div>

                {/* Servicios */}
                <h3 style={styles.subtitle}>Servicios</h3>
                <div style={styles.servicios}>
                    {parqueadero.servicios.map((s, i) => (
                        <div key={i} style={styles.servicioItem}>✓ {s}</div>
                    ))}
                </div>

                {/* Disponibilidad */}
                <h3 style={styles.subtitle}>Disponibilidad</h3>
                <div style={styles.disponibilidad}>
                    <div style={styles.barraProgreso}>
                        <div style={{
                            ...styles.barraLlena,
                            width: `${(parqueadero.espaciosDisponibles / parqueadero.espaciosTotales) * 100}%`
                        }} />
                    </div>
                    <div style={styles.espacios}>
                        <span style={{color: '#4CAF50'}}>🟢 {parqueadero.espaciosDisponibles} libres</span>
                        <span style={{color: '#666'}}>de {parqueadero.espaciosTotales} totales</span>
                    </div>
                </div>

                {/* Botones de acción */}
                <div style={styles.acciones}>
                    <button style={styles.btnLlamar}>📞 LLAMAR</button>
                    <button style={styles.btnLlegar}>📍 CÓMO LLEGAR</button>
                    <button style={styles.btnReseña}>💬 DEJAR RESEÑA</button>
                </div>
            </div>
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
        marginBottom: '20px'
    },
    backButton: {
        backgroundColor: 'transparent',
        border: '1px solid #ddd',
        padding: '8px 15px',
        borderRadius: '5px',
        cursor: 'pointer'
    },
    title: {
        color: '#2C3E50',
        margin: 0,
        fontSize: '1.5rem'
    },
    headerActions: {
        display: 'flex',
        gap: '10px'
    },
    iconButton: {
        backgroundColor: 'transparent',
        border: '1px solid #ddd',
        padding: '8px 12px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '1.2rem'
    },
    galeria: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
        marginBottom: '20px'
    },
    fotoPlaceholder: {
        height: '150px',
        backgroundColor: '#f0f0f0',
        borderRadius: '5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '0.8rem'
    },
    infoCard: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    nombre: {
        fontSize: '2rem',
        color: '#2C3E50',
        marginBottom: '5px'
    },
    rating: {
        color: '#FFC107',
        marginBottom: '20px'
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '15px',
        marginBottom: '30px'
    },
    infoItem: {
        color: '#666'
    },
    subtitle: {
        color: '#2C3E50',
        marginBottom: '15px'
    },
    tarifas: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '15px',
        marginBottom: '30px'
    },
    tarifaCard: {
        backgroundColor: '#f9f9f9',
        padding: '15px',
        borderRadius: '5px',
        textAlign: 'center'
    },
    tarifaTitulo: {
        display: 'block',
        color: '#666',
        fontSize: '0.9rem',
        marginBottom: '5px'
    },
    tarifaValor: {
        display: 'block',
        color: '#FF7E5F',
        fontSize: '1.3rem',
        fontWeight: 'bold'
    },
    servicios: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '10px',
        marginBottom: '30px'
    },
    servicioItem: {
        color: '#666'
    },
    disponibilidad: {
        marginBottom: '30px'
    },
    barraProgreso: {
        height: '20px',
        backgroundColor: '#f0f0f0',
        borderRadius: '10px',
        overflow: 'hidden',
        marginBottom: '10px'
    },
    barraLlena: {
        height: '100%',
        backgroundColor: '#4CAF50'
    },
    espacios: {
        display: 'flex',
        justifyContent: 'space-between'
    },
    acciones: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '15px',
        marginTop: '20px'
    },
    btnLlamar: {
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        padding: '15px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    btnLlegar: {
        backgroundColor: '#2C3E50',
        color: 'white',
        border: 'none',
        padding: '15px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    btnReseña: {
        backgroundColor: 'white',
        color: '#FF7E5F',
        border: '2px solid #FF7E5F',
        padding: '15px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold'
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
        color: '#c62828',
        fontSize: '1.2rem'
    }
};

export default ParqueaderoDetalle;