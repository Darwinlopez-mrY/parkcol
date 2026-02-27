import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import Mapa from '../components/Mapa';

const Buscar = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Estados
    const [resultados, setResultados] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [vista, setVista] = useState('lista');
    const [ubicacionUsuario, setUbicacionUsuario] = useState(null);
    const [coordenadasDestino, setCoordenadasDestino] = useState(null);
    
    // Estados para rutas
    const [mostrarRuta, setMostrarRuta] = useState(false);
    const [origenRuta, setOrigenRuta] = useState(null);
    const [destinoRuta, setDestinoRuta] = useState(null);
    const [destinoRutaPendiente, setDestinoRutaPendiente] = useState(null);

    // Parámetros de búsqueda
    const busqueda = searchParams.get('q') || '';
    const ciudad = searchParams.get('ciudad') || '';
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    const destinoLat = searchParams.get('destinoLat');
    const destinoLng = searchParams.get('destinoLng');
    const destinoNombre = searchParams.get('destinoNombre');

    // Coordenadas de ciudades principales
    const coordenadasCiudades = {
        'Bogotá': [4.60971, -74.08175],
        'Medellín': [6.2442, -75.5812],
        'Cali': [3.4516, -76.5320],
        'Barranquilla': [10.9685, -74.7813],
        'Cartagena': [10.3910, -75.4794],
        'Bucaramanga': [7.1193, -73.1227],
        'Pereira': [4.8087, -75.6906],
        'Manizales': [5.0703, -75.5138],
        'Cúcuta': [7.8939, -72.5078],
        'Santa Marta': [11.2404, -74.1990],
        'Ibagué': [4.4447, -75.2429],
        'Villavicencio': [4.1420, -73.6266],
        'Pasto': [1.2136, -77.2811],
        'Montería': [8.7479, -75.8814],
        'Neiva': [2.9273, -75.2819]
    };

    // Función para activar seguimiento de ruta
    const activarSeguimientoRuta = (destinoLat, destinoLng) => {
        if (!navigator.geolocation) {
            alert('Tu navegador no soporta geolocalización');
            return;
        }

        setCargando(true);
        
        // Obtener ubicación inicial
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude: lat, longitude: lng } = position.coords;
                setUbicacionUsuario({ lat, lng });
                
                // Activar modo ruta con seguimiento
                setOrigenRuta([lat, lng]);
                setDestinoRuta([parseFloat(destinoLat), parseFloat(destinoLng)]);
                setMostrarRuta(true);
                setVista('mapa');
                setCargando(false);
                
                // Si hay nombre del destino, mostrar notificación
                if (destinoNombre) {
                    setTimeout(() => {
                        alert(`🗺️ Ruta a ${decodeURIComponent(destinoNombre)}\nDistancia calculada: aproximadamente ${calcularDistanciaAproximada(lat, lng, parseFloat(destinoLat), parseFloat(destinoLng))} km`);
                    }, 1000);
                }
            },
            (error) => {
                let mensaje = '';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        mensaje = 'Permiso denegado. Activa la ubicación para usar esta función.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        mensaje = 'Ubicación no disponible.';
                        break;
                    case error.TIMEOUT:
                        mensaje = 'Tiempo de espera agotado.';
                        break;
                    default:
                        mensaje = 'Error desconocido al obtener ubicación';
                }
                alert(mensaje);
                setCargando(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    // Función para calcular distancia aproximada
    const calcularDistanciaAproximada = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radio de la Tierra en km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return (R * c).toFixed(1);
    };

    // Efecto para activar ruta si vienen parámetros
    useEffect(() => {
        if (destinoLat && destinoLng) {
            activarSeguimientoRuta(destinoLat, destinoLng);
        }
    }, [destinoLat, destinoLng, destinoNombre]);

    // Funciones de búsqueda
    const buscarParqueaderos = useCallback(async () => {
        setCargando(true);
        try {
            const params = new URLSearchParams();
            if (ciudad) params.append('ciudad', ciudad);
            if (busqueda) params.append('q', busqueda);

            const url = params.toString() ? `/parqueaderos?${params.toString()}` : '/parqueaderos';
            const response = await API.get(url);
            
            let datos = response.data;
            
            // Si vienen lat y lng, buscar el parqueadero específico
            if (latParam && lngParam) {
                const parqueaderoEspecifico = datos.find(p => 
                    Math.abs(p.lat - parseFloat(latParam)) < 0.001 && 
                    Math.abs(p.lng - parseFloat(lngParam)) < 0.001
                );
                
                if (parqueaderoEspecifico) {
                    datos = [parqueaderoEspecifico];
                    setVista('mapa');
                    setCoordenadasDestino([parseFloat(latParam), parseFloat(lngParam)]);
                }
            }
            
            setResultados(datos);
        } catch (error) {
            console.error('Error al buscar parqueaderos:', error);
        } finally {
            setCargando(false);
        }
    }, [ciudad, busqueda, latParam, lngParam]);

    // Efectos
    useEffect(() => {
        buscarParqueaderos();
    }, [buscarParqueaderos]);

    const buscarCercaDeMi = () => {
        setCargando(true);

        if (!navigator.geolocation) {
            alert('Tu navegador no soporta geolocalización');
            setCargando(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude: lat, longitude: lng } = position.coords;
                setUbicacionUsuario({ lat, lng });

                try {
                    const response = await API.get(`/parqueaderos/cerca?lat=${lat}&lng=${lng}`);
                    setResultados(response.data);
                } catch (error) {
                    console.error('Error al buscar cerca:', error);
                } finally {
                    setCargando(false);
                }
            },
            (error) => {
                const mensajesError = {
                    [error.PERMISSION_DENIED]: 'Permiso denegado. Activa la ubicación.',
                    [error.POSITION_UNAVAILABLE]: 'Ubicación no disponible.',
                    [error.TIMEOUT]: 'Tiempo de espera agotado.'
                };
                
                alert(mensajesError[error.code] || 'Error desconocido al obtener ubicación');
                setCargando(false);
            }
        );
    };

    // Utilidades
    const getDisponibilidadColor = (disponible, espacios) => {
        if (!disponible) return { color: '#F44336', texto: '🔴 Lleno' };
        if (espacios < 5) return { color: '#FF9800', texto: '🟡 Pocos espacios' };
        return { color: '#4CAF50', texto: '🟢 Disponible' };
    };

    // Función para obtener el centro del mapa
    const obtenerCentroMapa = () => {
        if (mostrarRuta && origenRuta) return origenRuta;
        if (coordenadasDestino) return coordenadasDestino;
        if (ubicacionUsuario) return [ubicacionUsuario.lat, ubicacionUsuario.lng];
        if (ciudad && coordenadasCiudades[ciudad]) return coordenadasCiudades[ciudad];
        if (resultados.length > 0 && resultados[0].lat && resultados[0].lng) {
            return [resultados[0].lat, resultados[0].lng];
        }
        return [4.60971, -74.08175];
    };

    // Renderizado de componentes
    const renderVistaLista = () => (
        <div style={styles.lista}>
            {resultados.map(parqueadero => {
                const disponibilidad = getDisponibilidadColor(
                    parqueadero.disponible, 
                    parqueadero.espacios
                );
                
                return (
                    <div key={parqueadero._id || parqueadero.id} style={styles.card}>
                        <div style={styles.cardHeader}>
                            <span style={{...styles.badge, backgroundColor: disponibilidad.color}}>
                                {disponibilidad.texto}
                            </span>
                        </div>
                        
                        <h3 style={styles.cardTitle}>{parqueadero.nombre}</h3>
                        
                        <div style={styles.rating}>
                            ⭐ {parqueadero.rating} ({parqueadero.reseñas} reseñas)
                        </div>
                        
                        <p style={styles.cardAddress}>
                            📍 {parqueadero.direccion}, {parqueadero.ciudad}
                        </p>
                        
                        <div style={styles.cardFooter}>
                            <span style={styles.price}>💰 ${parqueadero.precio}/h</span>
                            <span style={styles.distance}>
                                📍 {parqueadero.distancia || '0m'}
                            </span>
                        </div>
                        
                        <button
                            style={styles.viewDetails}
                            onClick={() => navigate(`/parqueadero/${parqueadero._id || parqueadero.id}`)}
                        >
                            VER DETALLES
                        </button>
                    </div>
                );
            })}
        </div>
    );

    const renderVistaMapa = () => {
        const centroMapa = obtenerCentroMapa();

        return (
            <div style={styles.mapaContainer}>
                <Mapa
                    parqueaderos={resultados}
                    centro={centroMapa}
                    mostrarUbicacion={!!ubicacionUsuario}
                    ciudad={ciudad}
                    mostrarRuta={mostrarRuta}
                    origenRuta={origenRuta}
                    destinoRuta={destinoRuta}
                    onCerrarRuta={() => {
                        setMostrarRuta(false);
                        setOrigenRuta(null);
                        setDestinoRuta(null);
                    }}
                />
            </div>
        );
    };

    // Render principal
    return (
        <div style={styles.container}>
            {/* Encabezado */}
            <header style={styles.header}>
                <button onClick={() => navigate('/')} style={styles.backButton}>
                    ← Atrás
                </button>
                
                <h1 style={styles.title}>
                    {ciudad ? `Resultados en ${ciudad}` : 'Resultados de búsqueda'}
                </h1>
                
                <div style={styles.viewToggle}>
                    <button
                        onClick={() => setVista('lista')}
                        style={vista === 'lista' ? styles.viewActive : styles.viewButton}
                    >
                        📋 Lista
                    </button>
                    <button
                        onClick={() => setVista('mapa')}
                        style={vista === 'mapa' ? styles.viewActive : styles.viewButton}
                    >
                        🗺️ Mapa
                    </button>
                </div>
            </header>

            {/* Filtros */}
            <div style={styles.filters}>
                <button onClick={buscarCercaDeMi} style={styles.filterChip}>
                    📍 Cerca de mí
                </button>
                <button style={styles.filterChip}>💰 Precio</button>
                <button style={styles.filterChip}>🕐 Horario</button>
                <button style={styles.filterChip}>🚗 Tipo</button>
                <button style={styles.filterChip}>⚡ Más filtros</button>
            </div>

            {/* Mensaje de ruta activa */}
            {mostrarRuta && destinoNombre && (
                <div style={styles.rutaActiva}>
                    <span>🗺️ Ruta activa a: {decodeURIComponent(destinoNombre)}</span>
                    <button 
                        onClick={() => {
                            setMostrarRuta(false);
                            setOrigenRuta(null);
                            setDestinoRuta(null);
                        }}
                        style={styles.cerrarRutaBtn}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Contador de resultados */}
            <p style={styles.resultCount}>
                {resultados.length} parqueadero{resultados.length !== 1 ? 's' : ''} encontrado{resultados.length !== 1 ? 's' : ''}
            </p>

            {/* Contenido principal */}
            {cargando ? (
                <div style={styles.loading}>Buscando parqueaderos...</div>
            ) : (
                <>
                    {vista === 'lista' && renderVistaLista()}
                    {vista === 'mapa' && renderVistaMapa()}
                </>
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
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '10px'
    },
    backButton: {
        backgroundColor: 'transparent',
        border: '1px solid #ddd',
        padding: '8px 15px',
        borderRadius: '5px',
        cursor: 'pointer',
        color: '#2C3E50'
    },
    title: {
        color: '#2C3E50',
        margin: 0,
        fontSize: '1.5rem'
    },
    viewToggle: {
        display: 'flex',
        gap: '5px'
    },
    viewButton: {
        backgroundColor: 'white',
        border: '1px solid #ddd',
        padding: '8px 15px',
        borderRadius: '5px',
        cursor: 'pointer'
    },
    viewActive: {
        backgroundColor: '#FF7E5F',
        color: 'white',
        border: 'none',
        padding: '8px 15px',
        borderRadius: '5px',
        cursor: 'pointer'
    },
    filters: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        overflowX: 'auto',
        padding: '5px 0'
    },
    filterChip: {
        backgroundColor: 'white',
        border: '1px solid #ddd',
        padding: '8px 15px',
        borderRadius: '20px',
        cursor: 'pointer',
        whiteSpace: 'nowrap'
    },
    rutaActiva: {
        backgroundColor: '#e3f2fd',
        border: '1px solid #2196F3',
        borderRadius: '5px',
        padding: '10px 15px',
        marginBottom: '15px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#0d47a1',
        fontWeight: 'bold'
    },
    cerrarRutaBtn: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#F44336',
        fontSize: '1.2rem',
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    resultCount: {
        color: '#666',
        marginBottom: '20px'
    },
    loading: {
        textAlign: 'center',
        padding: '50px',
        color: '#666'
    },
    lista: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    card: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    cardHeader: {
        marginBottom: '10px'
    },
    badge: {
        color: 'white',
        padding: '3px 10px',
        borderRadius: '3px',
        fontSize: '0.8rem',
        display: 'inline-block'
    },
    cardTitle: {
        fontSize: '1.2rem',
        color: '#2C3E50',
        marginBottom: '5px'
    },
    rating: {
        color: '#FFC107',
        marginBottom: '5px'
    },
    cardAddress: {
        color: '#666',
        marginBottom: '10px',
        fontSize: '0.9rem'
    },
    cardFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
    },
    price: {
        color: '#FF7E5F',
        fontWeight: 'bold',
        fontSize: '1.1rem'
    },
    distance: {
        color: '#666',
        fontSize: '0.9rem'
    },
    viewDetails: {
        backgroundColor: '#FF7E5F',
        color: 'white',
        border: 'none',
        padding: '10px',
        borderRadius: '5px',
        cursor: 'pointer',
        width: '100%',
        fontWeight: 'bold'
    },
    mapaContainer: {
        height: '500px',
        width: '100%',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }
};

export default Buscar;