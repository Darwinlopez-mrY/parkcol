import React, { useState } from 'react';
import { useSeguimiento } from '../context/SeguimientoContext';

const SolicitarViaje = ({ parqueadero, onCerrar }) => {
    const { solicitarViaje, solicitando, estadoConexion } = useSeguimiento();
    const [ubicacion, setUbicacion] = useState(null);
    const [buscandoUbicacion, setBuscandoUbicacion] = useState(false);

    const obtenerUbicacion = () => {
        setBuscandoUbicacion(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUbicacion({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setBuscandoUbicacion(false);
            },
            (error) => {
                alert('Error obteniendo ubicación: ' + error.message);
                setBuscandoUbicacion(false);
            }
        );
    };

    const handleSolicitar = () => {
        if (!ubicacion) {
            alert('Primero necesitas obtener tu ubicación');
            return;
        }

        solicitarViaje(
            parqueadero._id,
            [ubicacion.lat, ubicacion.lng],
            [parqueadero.lat, parqueadero.lng]
        );
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <button style={styles.cerrar} onClick={onCerrar}>✕</button>
                
                <h3 style={styles.titulo}>Solicitar servicio al parqueadero</h3>
                
                <p style={styles.parqueadero}>{parqueadero.nombre}</p>
                
                <div style={styles.estadoConexion}>
                    Estado de conexión: 
                    <span style={{
                        color: estadoConexion === 'conectado' ? '#4CAF50' : '#F44336',
                        fontWeight: 'bold',
                        marginLeft: '5px'
                    }}>
                        {estadoConexion === 'conectado' ? '🟢 Conectado' : '🔴 Desconectado'}
                    </span>
                </div>

                {!ubicacion ? (
                    <button 
                        onClick={obtenerUbicacion}
                        disabled={buscandoUbicacion}
                        style={styles.boton}
                    >
                        {buscandoUbicacion ? 'Obteniendo ubicación...' : '📍 Obtener mi ubicación'}
                    </button>
                ) : (
                    <div style={styles.ubicacionInfo}>
                        <p>✅ Ubicación obtenida</p>
                        <button 
                            onClick={handleSolicitar}
                            disabled={solicitando || estadoConexion !== 'conectado'}
                            style={solicitando ? styles.botonDeshabilitado : styles.boton}
                        >
                            {solicitando ? 'Solicitando...' : '🚗 Solicitar servicio'}
                        </button>
                    </div>
                )}

                <p style={styles.nota}>
                    Al solicitar, un propietario cercano aceptará tu viaje y podrás seguir su ubicación en tiempo real.
                </p>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000
    },
    modal: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        maxWidth: '400px',
        width: '90%',
        position: 'relative'
    },
    cerrar: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'none',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer'
    },
    titulo: {
        fontSize: '1.3rem',
        color: '#2C3E50',
        marginBottom: '15px'
    },
    parqueadero: {
        fontSize: '1.1rem',
        fontWeight: 'bold',
        color: '#FF7E5F',
        marginBottom: '20px'
    },
    estadoConexion: {
        marginBottom: '20px',
        padding: '10px',
        backgroundColor: '#f5f5f5',
        borderRadius: '5px'
    },
    boton: {
        width: '100%',
        padding: '15px',
        backgroundColor: '#FF7E5F',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold',
        marginBottom: '15px'
    },
    botonDeshabilitado: {
        width: '100%',
        padding: '15px',
        backgroundColor: '#ccc',
        color: '#666',
        border: 'none',
        borderRadius: '5px',
        cursor: 'not-allowed',
        fontWeight: 'bold',
        marginBottom: '15px'
    },
    ubicacionInfo: {
        marginBottom: '15px'
    },
    nota: {
        fontSize: '0.8rem',
        color: '#666',
        marginTop: '15px'
    }
};

export default SolicitarViaje;