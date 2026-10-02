import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';

const SeguimientoRuta = ({ map, origenInicial, destino, onCerrar }) => {
    const [distanciaRestante, setDistanciaRestante] = useState(null);
    const [tiempoRestante, setTiempoRestante] = useState(null);
    const [mapaListo, setMapaListo] = useState(false);
    const routingControlRef = useRef(null);
    const markerUbicacionRef = useRef(null);
    const markerDestinoRef = useRef(null);
    const montadoRef = useRef(true);

    // ============================
    // Actualizar ruta con nueva ubicación
    // ============================
    const actualizarRuta = useCallback((nuevaUbicacion) => {
        if (!routingControlRef.current || !map || !map._container) return;
        if (!montadoRef.current) return;

        try {
            routingControlRef.current.setWaypoints([
                L.latLng(nuevaUbicacion[0], nuevaUbicacion[1]),
                L.latLng(destino[0], destino[1])
            ]);

            if (markerUbicacionRef.current && markerUbicacionRef.current._map) {
                markerUbicacionRef.current.setLatLng(nuevaUbicacion);
            }

            // Centrar el mapa en la nueva ubicación del usuario
            try {
                map.setView(nuevaUbicacion, 15);
            } catch (err) {
                console.warn('Error centering on new location:', err);
            }
            // 👆 Ya NO calculamos Haversine.
            // El nuevo cálculo vendrá de OSRM cuando responda.
        } catch (error) {
            console.warn('Error actualizando ruta:', error);
        }
    }, [map, destino]);

    // ============================
    // Esperar a que el mapa esté listo
    // ============================
    useEffect(() => {
        if (map) {
            const timer = setTimeout(() => {
                if (montadoRef.current) setMapaListo(true);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [map]);

    // ============================
    // Marcar desmontaje
    // ============================
    useEffect(() => {
        montadoRef.current = true;
        return () => {
            montadoRef.current = false;
        };
    }, []);

    // ============================
    // Iniciar seguimiento de ubicación (watchPosition)
    // ============================
    useEffect(() => {
        if (!mapaListo) return;

        if (!navigator.geolocation) {
            console.warn('Navegador no soporta geolocalización');
            return;
        }

        const id = navigator.geolocation.watchPosition(
            (position) => {
                if (!montadoRef.current) return;
                const nuevaUbicacion = [
                    position.coords.latitude,
                    position.coords.longitude
                ];
                if (mapaListo && montadoRef.current) {
                    actualizarRuta(nuevaUbicacion);
                }
            },
            (error) => {
                console.warn('Error de seguimiento:', error);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000
            }
        );

        return () => {
            if (id) {
                navigator.geolocation.clearWatch(id);
            }
        };
    }, [mapaListo, actualizarRuta]);

    // ============================
    // Crear ruta inicial (SOLO OSRM)
    // ============================
    useEffect(() => {
        if (!mapaListo || !map || !origenInicial || !destino) return;

        // Eliminar ruta anterior si existe
        if (routingControlRef.current && map && map.removeControl) {
            try {
                map.removeControl(routingControlRef.current);
                routingControlRef.current = null;
            } catch (e) {
                console.warn('Error removing previous control:', e);
            }
        }

        if (!map._container) return;

        // Centrar el mapa en la ubicación del usuario
        try {
            map.setView(origenInicial, 15);
        } catch (e) {
            console.warn('Error centering map initially:', e);
        }

        // Crear control de ruta
        let routingControl;
        try {
            routingControl = L.Routing.control({
                waypoints: [
                    L.latLng(origenInicial[0], origenInicial[1]),
                    L.latLng(destino[0], destino[1])
                ],
                routeWhileDragging: false,
                showAlternatives: false,
                lineOptions: {
                    styles: [{ color: '#FF7E5F', weight: 5, opacity: 0.9 }],
                    extendToWaypoints: true,
                    missingRouteTolerance: 0
                },
                show: false,
                addWaypoints: false,
                draggableWaypoints: false,
                fitSelectedRoutes: false,
                language: 'es',
                createMarker: () => null,
                router: L.Routing.osrmv1({
                    serviceUrl: 'https://router.project-osrm.org/route/v1'
                })
            }).addTo(map);

            // ============================
            // 👇 ÚNICA FUENTE DE VERDAD: OSRM
            // ============================
            routingControl.on('routesfound', (e) => {
                if (!montadoRef.current) return;
                const routes = e.routes;
                const summary = routes[0].summary;

                setDistanciaRestante((summary.totalDistance / 1000).toFixed(1));
                setTiempoRestante(Math.round(summary.totalTime / 60));

                // Forzar que la línea quede arriba
                try {
                    if (routingControl._line) {
                        routingControl._line.bringToFront();
                    }
                } catch (err) {
                    console.warn('Error bringing line to front:', err);
                }
            });

            // Manejo de errores de OSRM (solo log, sin fallback)
            routingControl.on('routingerror', (err) => {
                console.warn('❌ OSRM error:', err);
                // NO fallback: si OSRM falla, se queda en "Calculando..."
            });

        } catch (e) {
            console.warn('Error creating routing control:', e);
            return;
        }

        routingControlRef.current = routingControl;

        // ============================
        // Marcar ubicación actual como marcador azul
        // ============================
        try {
            const iconoMovimiento = L.divIcon({
                className: 'ubicacion-movimiento',
                html: `<div style="
                    background-color: #4285F4;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    border: 4px solid white;
                    box-shadow: 0 0 20px #4285F4;
                    animation: pulse 1s infinite;
                "></div>`,
                iconSize: [28, 28],
                iconAnchor: [14, 14]
            });

            const marker = L.marker(origenInicial, { icon: iconoMovimiento }).addTo(map);
            marker.bindPopup('📍 Tu ubicación actual');
            markerUbicacionRef.current = marker;
        } catch (e) {
            console.warn('Error creating location marker:', e);
        }

        // ============================
        // Marcar el destino con un pin rojo
        // ============================
        try {
            const iconoDestino = L.divIcon({
                className: 'destino-marker',
                html: `<div style="
                    position: relative;
                    width: 40px;
                    height: 40px;
                ">
                    <div style="
                        background-color: #1e0efd;
                        width: 30px;
                        height: 30px;
                        border-radius: 50% 50% 50% 0;
                        transform: rotate(-45deg);
                        border: 3px solid white;
                        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                        position: absolute;
                        top: 0;
                        left: 5px;
                    "></div>
                    <div style="
                        position: absolute;
                        top: 8px;
                        left: 13px;
                        font-size: 16px;
                        z-index: 2;
                    ">🏁</div>
                </div>`,
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                popupAnchor: [0, -40]
            });

            const markerDestino = L.marker(destino, { icon: iconoDestino }).addTo(map);
            markerDestino.bindPopup(`
                <div style="text-align: center; font-family: Arial;">
                    <strong style="color: #200ee6; font-size: 1rem;">🏁 Destino</strong>
                    <p style="margin: 5px 0; font-size: 0.9rem;">Has llegado a tu destino</p>
                </div>
            `);
            markerDestinoRef.current = markerDestino;
        } catch (e) {
            console.warn('Error creating destination marker:', e);
        }

        return () => {
            if (routingControlRef.current && map && map.removeControl) {
                try {
                    map.removeControl(routingControlRef.current);
                    routingControlRef.current = null;
                } catch (e) {
                    console.warn('Error cleaning up route:', e);
                }
            }
            if (markerUbicacionRef.current && map && map.removeLayer) {
                try {
                    map.removeLayer(markerUbicacionRef.current);
                    markerUbicacionRef.current = null;
                } catch (e) {
                    console.warn('Error cleaning up marker:', e);
                }
            }
            if (markerDestinoRef.current && map && map.removeLayer) {
                try {
                    map.removeLayer(markerDestinoRef.current);
                    markerDestinoRef.current = null;
                } catch (e) {
                    console.warn('Error cleaning up destination marker:', e);
                }
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mapaListo, map, origenInicial, destino]);

    // ============================
    // Estilos de animación
    // ============================
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
            if (style.parentNode) style.parentNode.removeChild(style);
        };
    }, []);

    // ============================
    // RENDER
    // ============================
    return (
        <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            zIndex: 1000,
            backgroundColor: 'white',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            maxWidth: '300px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <strong style={{ color: '#2C3E50' }}>🚗 Siguiendo tu ruta</strong>
                <button
                    onClick={onCerrar}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        color: '#F44336'
                    }}
                >
                    ✕
                </button>
            </div>

            <div style={{ marginBottom: '15px' }}>
                <p style={{ margin: '5px 0' }}>
                    <strong>📍 Distancia restante:</strong>{' '}
                    {distanciaRestante !== null && distanciaRestante !== undefined
                        ? `${distanciaRestante} km`
                        : 'Calculando con OSRM...'}
                </p>
                <p style={{ margin: '5px 0' }}>
                    <strong>⏱️ Tiempo estimado:</strong>{' '}
                    {tiempoRestante !== null && tiempoRestante !== undefined
                        ? `${tiempoRestante} min`
                        : 'Calculando con OSRM...'}
                </p>
            </div>

            <div style={{
                padding: '10px',
                backgroundColor: '#e8f5e9',
                borderRadius: '5px',
                border: '1px solid #4CAF50'
            }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#2C3E50' }}>
                    <strong>🟢 Seguimiento activo</strong>
                </p>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#666' }}>
                    Tu ubicación se actualiza automáticamente
                </p>
            </div>

            <button
                onClick={() => {
                    if (routingControlRef.current && montadoRef.current) {
                        try {
                            routingControlRef.current.route();
                        } catch (e) {
                            console.warn('Error recalculating route:', e);
                        }
                    }
                }}
                style={{
                    width: '100%',
                    marginTop: '15px',
                    padding: '10px',
                    backgroundColor: '#FF7E5F',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                }}
            >
                🔄 Recalcular ruta
            </button>
        </div>
    );
};

export default SeguimientoRuta;