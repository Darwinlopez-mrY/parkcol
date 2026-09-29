import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { useSeguimiento } from '../context/SeguimientoContext';
import SeguimientoRuta from './SeguimientoRuta';

// Solucionar problema de iconos en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// ============================================
// Componente para centrar el mapa
// ============================================
const CentrarMapa = ({ posicion }) => {
    const map = useMap();
    useEffect(() => {
        if (posicion && map) {
            try {
                map.setView(posicion, 15);
            } catch (e) {
                console.warn('Error centering map:', e);
            }
        }
    }, [posicion, map]);
    return null;
};

// ============================================
// Componente para mostrar la ubicación del usuario
// ============================================
const UbicacionUsuario = ({ posicion }) => {
    if (!posicion) return null;

    const iconoUsuario = L.divIcon({
        className: 'ubicacion-usuario',
        html: `<div style="
            background-color: #4285F4;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 4px solid white;
            box-shadow: 0 0 10px rgba(66, 133, 244, 0.8);
        "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });

    return (
        <Marker position={posicion} icon={iconoUsuario}>
            <Popup>📍 Estás aquí</Popup>
        </Marker>
    );
};

// ============================================
// 👈 CAMBIO CLAVE: Wrapper que usa useMap()
// ============================================
const SeguimientoRutaWrapper = ({ origenInicial, destino, onCerrar }) => {
    const map = useMap();  // 👈 useMap() obtiene el mapa correctamente
    const [listo, setListo] = useState(false);

    useEffect(() => {
        if (map) {
            console.log('🗺️ Wrapper: map detectado, esperando 200ms...');
            const timer = setTimeout(() => {
                console.log('🗺️ Wrapper: seteando listo=true');
                setListo(true);
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [map]);

    if (!listo) {
        return null;
    }

    console.log('🗺️ Wrapper: renderizando SeguimientoRuta con map:', map);
    return (
        <SeguimientoRuta
            map={map}
            origenInicial={origenInicial}
            destino={destino}
            onCerrar={onCerrar}
        />
    );
};

// ============================================
// Componente para mostrar el seguimiento del propietario
// ============================================
const SeguimientoPropietario = ({ viajeActivo, ubicacionPropietario }) => {
    const map = useMap();
    const markerRef = useRef();
    const rutaRef = useRef();
    const montadoRef = useRef(true);
    const [distancia, setDistancia] = useState(null);
    const [tiempoEstimado, setTiempoEstimado] = useState(null);

    useEffect(() => {
        montadoRef.current = true;
        return () => {
            montadoRef.current = false;
        };
    }, []);

    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes pulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.2); opacity: 0.8; }
                100% { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        return () => {
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        };
    }, []);

    useEffect(() => {
        if (!ubicacionPropietario || !viajeActivo) return;
        if (!map || !map._container || !montadoRef.current) return;

        try {
            map.setView(ubicacionPropietario, 16);
        } catch (e) {
            console.warn('Error setting view:', e);
        }

        if (markerRef.current && markerRef.current._map) {
            try {
                markerRef.current.setLatLng(ubicacionPropietario);
            } catch (e) {
                console.warn('Error updating marker:', e);
            }
        }

        if (viajeActivo.destino) {
            const distanciaCalculada = calcularDistancia(
                ubicacionPropietario[0], ubicacionPropietario[1],
                viajeActivo.destino[0], viajeActivo.destino[1]
            );
            setDistancia(distanciaCalculada.toFixed(1));
            setTiempoEstimado(Math.round((distanciaCalculada / 30) * 60));
        }

        if (viajeActivo.origen && viajeActivo.destino) {
            if (rutaRef.current && map && map.removeLayer) {
                try {
                    map.removeLayer(rutaRef.current);
                    rutaRef.current = null;
                } catch (e) {
                    console.warn('Error removing previous route:', e);
                }
            }

            try {
                const rutaLinea = L.polyline(
                    [ubicacionPropietario, viajeActivo.destino],
                    {
                        color: '#FF7E5F',
                        weight: 4,
                        opacity: 0.8,
                        dashArray: '10, 10',
                        lineCap: 'round'
                    }
                ).addTo(map);

                rutaRef.current = rutaLinea;
            } catch (e) {
                console.warn('Error creating route line:', e);
            }
        }

        return () => {
            if (rutaRef.current && map && map.removeLayer) {
                try {
                    map.removeLayer(rutaRef.current);
                    rutaRef.current = null;
                } catch (e) {
                    console.warn('Error cleaning up route line:', e);
                }
            }
        };
    }, [ubicacionPropietario, viajeActivo, map]);

    const calcularDistancia = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    if (!ubicacionPropietario || !viajeActivo) return null;

    const iconoPropietario = L.divIcon({
        className: 'propietario-marker',
        html: `<div style="
            background-color: #FF7E5F;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 4px solid white;
            box-shadow: 0 0 20px #FF7E5F;
            animation: pulse 1.5s infinite;
            position: relative;
        ">
            <div style="
                position: absolute;
                top: -5px;
                right: -5px;
                background-color: #4CAF50;
                color: white;
                border-radius: 50%;
                width: 15px;
                height: 15px;
                font-size: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid white;
            ">🚗</div>
        </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
    });

    return (
        <>
            <Marker
                position={ubicacionPropietario}
                icon={iconoPropietario}
                ref={markerRef}
            >
                <Popup>
                    <div style={{ minWidth: '200px', textAlign: 'center', fontFamily: 'Arial' }}>
                        <strong style={{ fontSize: '1.1rem', color: '#FF7E5F' }}>
                            🚗 Conductor en camino
                        </strong>
                        {distancia && tiempoEstimado && (
                            <div style={{ margin: '10px 0', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
                                <p style={{ margin: '2px 0' }}><strong>Distancia:</strong> {distancia} km</p>
                                <p style={{ margin: '2px 0' }}><strong>Tiempo estimado:</strong> {tiempoEstimado} min</p>
                            </div>
                        )}
                        <p style={{ fontSize: '0.9rem', color: '#666' }}>
                            Te notificaremos cuando llegue
                        </p>
                    </div>
                </Popup>
            </Marker>

            <Marker
                position={viajeActivo.destino}
                icon={L.divIcon({
                    className: 'destino-marker',
                    html: `<div style="
                        background-color: #F44336;
                        width: 24px;
                        height: 24px;
                        border-radius: 50%;
                        border: 3px solid white;
                        box-shadow: 0 0 10px #F44336;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 14px;
                    ">🏁</div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                })}
            >
                <Popup>
                    <div style={{ textAlign: 'center' }}>
                        <strong>Destino: Parqueadero</strong>
                        <p>{viajeActivo.parqueaderoNombre || ''}</p>
                    </div>
                </Popup>
            </Marker>
        </>
    );
};

// ============================================
// COMPONENTE PRINCIPAL MAPA
// ============================================
const Mapa = ({
    parqueaderos,
    centro,
    zoom = 13,
    mostrarUbicacion = false,
    ciudad,
    modo = 'normal',
    mostrarRuta = false,
    origenRuta = null,
    destinoRuta = null,
    onCerrarRuta
}) => {
    const [ubicacionUsuario, setUbicacionUsuario] = useState(null);
    const { viajeActivo, ubicacionPropietario } = useSeguimiento();

    // 👈 CAMBIO: Ya no usamos mapRef, el useMap() lo maneja el wrapper

    // Obtener ubicación del usuario si se solicita
    useEffect(() => {
        if (mostrarUbicacion && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUbicacionUsuario([
                        position.coords.latitude,
                        position.coords.longitude
                    ]);
                },
                (error) => {
                    console.log('Error obteniendo ubicación:', error);
                }
            );
        }
    }, [mostrarUbicacion]);

    const getMarkerColor = (disponible, espacios) => {
        if (!disponible) return '#F44336';
        if (espacios < 5) return '#FF9800';
        return '#4CAF50';
    };

    const createColoredIcon = (color) => {
        return L.divIcon({
            className: 'custom-marker',
            html: `<div style="
                background-color: ${color};
                width: 24px;
                height: 24px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                cursor: pointer;
                transition: transform 0.2s;
            "></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            popupAnchor: [0, -12]
        });
    };

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

    const determinarCentro = () => {
        if (mostrarRuta && origenRuta) return origenRuta;
        if (modo === 'seguimiento' && ubicacionPropietario) return ubicacionPropietario;
        if (ubicacionUsuario) return ubicacionUsuario;
        if (ciudad && coordenadasCiudades[ciudad]) return coordenadasCiudades[ciudad];
        if (centro) return centro;
        return [4.60971, -74.08175];
    };

    const centroMapa = determinarCentro();

    return (
        <MapContainer
            center={centroMapa}
            zoom={mostrarRuta ? 14 : (modo === 'seguimiento' ? 16 : zoom)}
            style={{ height: '500px', width: '100%', borderRadius: '10px' }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            {/* Centrar mapa en ubicación del usuario si está disponible */}
            {ubicacionUsuario && !mostrarRuta && modo !== 'seguimiento' && (
                <CentrarMapa posicion={ubicacionUsuario} />
            )}

            {/* Mostrar marcador de ubicación del usuario */}
            {ubicacionUsuario && <UbicacionUsuario posicion={ubicacionUsuario} />}

            {/* 👈 CAMBIO CLAVE: Wrapper con useMap en vez de mapRef */}
            {mostrarRuta && origenRuta && destinoRuta && (
                <SeguimientoRutaWrapper
                    origenInicial={origenRuta}
                    destino={destinoRuta}
                    onCerrar={onCerrarRuta}
                />
            )}

            {/* Mostrar seguimiento de propietario si está activo */}
            {modo === 'seguimiento' && viajeActivo && ubicacionPropietario && (
                <SeguimientoPropietario
                    viajeActivo={viajeActivo}
                    ubicacionPropietario={ubicacionPropietario}
                />
            )}

            {/* Mostrar parqueaderos solo si no hay ruta activa */}
            {!mostrarRuta && parqueaderos?.map((p) => (
                <Marker
                    key={p._id || p.id}
                    position={[p.lat || 4.60971, p.lng || -74.08175]}
                    icon={createColoredIcon(getMarkerColor(p.disponible, p.espacios))}
                >
                    <Popup>
                        <div style={{ minWidth: '220px', fontFamily: 'Arial' }}>
                            {p.fotos?.length > 0 && (
                                <img
                                    src={p.fotos[0]}
                                    alt={p.nombre}
                                    style={{
                                        width: '100%',
                                        height: '120px',
                                        objectFit: 'cover',
                                        borderRadius: '5px',
                                        marginBottom: '10px'
                                    }}
                                />
                            )}

                            <h3 style={{ margin: '0 0 5px 0', color: '#2C3E50', fontSize: '1.1rem' }}>
                                {p.nombre}
                            </h3>

                            <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>
                                <strong>📍 Dirección:</strong> {p.direccion}
                            </p>

                            <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>
                                <strong>💰 Precio:</strong> ${p.precio}/h
                            </p>

                            <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>
                                <strong>📊 Disponibilidad:</strong><br />
                                {p.disponible ? (
                                    <span style={{ color: p.espacios < 5 ? '#FF9800' : '#4CAF50' }}>
                                        🟢 {p.espacios} espacios
                                    </span>
                                ) : (
                                    <span style={{ color: '#F44336' }}>🔴 Lleno</span>
                                )}
                            </p>

                            <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                                <button
                                    onClick={() => window.open(`/parqueadero/${p._id || p.id}`)}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#FF7E5F',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    📋 Detalles
                                </button>
                                <button
                                    onClick={() => {
                                        window.location.href = `/buscar?destinoLat=${p.lat}&destinoLng=${p.lng}&destinoNombre=${encodeURIComponent(p.nombre)}`;
                                    }}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#4285F4',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    🗺️ Cómo llegar
                                </button>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default Mapa;