import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';

const SeguimientoRuta = ({ map, origenInicial, destino, onCerrar }) => {
    const [ubicacionActual, setUbicacionActual] = useState(origenInicial);
    const [distanciaRestante, setDistanciaRestante] = useState(null);
    const [tiempoRestante, setTiempoRestante] = useState(null);
    const [watchId, setWatchId] = useState(null);
    const [mapaListo, setMapaListo] = useState(false);
    const routingControlRef = useRef(null);
    const markerUbicacionRef = useRef(null);

    // Verificar que el mapa esté listo
    useEffect(() => {
        if (map) {
            setMapaListo(true);
        }
    }, [map]);

    // Iniciar seguimiento de ubicación
    useEffect(() => {
        if (!mapaListo) return;

        if (!navigator.geolocation) {
            alert('Tu navegador no soporta geolocalización');
            return;
        }

        // Configurar seguimiento continuo
        const id = navigator.geolocation.watchPosition(
            (position) => {
                const nuevaUbicacion = [
                    position.coords.latitude,
                    position.coords.longitude
                ];
                setUbicacionActual(nuevaUbicacion);
                if (mapaListo) {
                    actualizarRuta(nuevaUbicacion);
                }
            },
            (error) => {
                console.error('Error de seguimiento:', error);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000
            }
        );

        setWatchId(id);

        // Limpiar al desmontar
        return () => {
            if (id) {
                navigator.geolocation.clearWatch(id);
            }
        };
    }, [mapaListo]);

    // Crear ruta inicial
    useEffect(() => {
        if (!mapaListo || !map || !origenInicial || !destino) return;

        // Eliminar ruta anterior si existe
        if (routingControlRef.current) {
            map.removeControl(routingControlRef.current);
        }

        // Crear control de ruta
        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(origenInicial[0], origenInicial[1]),
                L.latLng(destino[0], destino[1])
            ],
            routeWhileDragging: false,
            showAlternatives: false,
            lineOptions: {
                styles: [{ color: '#FF7E5F', weight: 5 }]
            },
            show: true,
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            language: 'es',
            createMarker: () => null // No crear marcadores
        }).addTo(map);

        // Escuchar cuando se calcula la ruta
        routingControl.on('routesfound', (e) => {
            const routes = e.routes;
            const summary = routes[0].summary;
            
            setDistanciaRestante((summary.totalDistance / 1000).toFixed(1));
            setTiempoRestante(Math.round(summary.totalTime / 60));
        });

        routingControlRef.current = routingControl;

        return () => {
            if (routingControlRef.current) {
                map.removeControl(routingControlRef.current);
            }
        };
    }, [mapaListo, map, origenInicial, destino]);

    // Actualizar ruta con nueva ubicación
    const actualizarRuta = (nuevaUbicacion) => {
        if (!routingControlRef.current || !map) return;

        try {
            // Actualizar el primer waypoint con la nueva ubicación
            routingControlRef.current.setWaypoints([
                L.latLng(nuevaUbicacion[0], nuevaUbicacion[1]),
                L.latLng(destino[0], destino[1])
            ]);

            // Centrar mapa en la nueva ubicación
            if (map && map.setView) {
                map.setView(nuevaUbicacion, 16);
            }

            // Actualizar marcador de ubicación
            if (markerUbicacionRef.current) {
                markerUbicacionRef.current.setLatLng(nuevaUbicacion);
            } else if (map) {
                // Crear marcador animado para la ubicación actual
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

                const marker = L.marker(nuevaUbicacion, { icon: iconoMovimiento }).addTo(map);
                marker.bindPopup('📍 Tu ubicación actual').openPopup();
                markerUbicacionRef.current = marker;
            }

            // Recalcular distancia y tiempo (aproximado)
            const distancia = calcularDistancia(
                nuevaUbicacion[0], nuevaUbicacion[1],
                destino[0], destino[1]
            );
            setDistanciaRestante(distancia.toFixed(1));
            
            // Tiempo estimado: asumiendo velocidad promedio 30 km/h
            const tiempoMin = Math.round((distancia / 30) * 60);
            setTiempoRestante(tiempoMin);
        } catch (error) {
            console.error('Error actualizando ruta:', error);
        }
    };

    // Calcular distancia entre dos puntos (fórmula de Haversine)
    const calcularDistancia = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radio de la Tierra en km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    // Agregar estilos de animación
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
            document.head.removeChild(style);
        };
    }, []);

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
                    <strong>📍 Distancia restante:</strong> {distanciaRestante} km
                </p>
                <p style={{ margin: '5px 0' }}>
                    <strong>⏱️ Tiempo estimado:</strong> {tiempoRestante} min
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
                    if (routingControlRef.current) {
                        routingControlRef.current.route();
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
                Recalcular ruta
            </button>
        </div>
    );
};

export default SeguimientoRuta;