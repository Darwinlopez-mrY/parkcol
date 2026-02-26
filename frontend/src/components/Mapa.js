import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Solucionar problema de iconos en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Componente para centrar el mapa en la ubicación del usuario
const CentrarMapa = ({ posicion }) => {
    const map = useMap();
    useEffect(() => {
        if (posicion) {
            map.setView(posicion, 15);
        }
    }, [posicion, map]);
    return null;
};

// Componente para mostrar la ubicación del usuario
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

const Mapa = ({ parqueaderos, centro, zoom = 13, mostrarUbicacion = false, ciudad }) => {
    const [ubicacionUsuario, setUbicacionUsuario] = useState(null);

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

    // Función para abrir ruta en Google Maps
    const abrirRuta = (lat, lng, nombre) => {
        const urlGoogle = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
        window.open(urlGoogle, '_blank');
    };

    // Función para obtener color según disponibilidad
    const getMarkerColor = (disponible, espacios) => {
        if (!disponible) return '#F44336'; // Rojo
        if (espacios < 5) return '#FF9800'; // Naranja
        return '#4CAF50'; // Verde
    };

    // Crear icono personalizado con color
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
        'Santa Marta': [11.2404, -74.1990]
    };

    // Determinar centro del mapa
    const determinarCentro = () => {
        if (ubicacionUsuario) return ubicacionUsuario;
        if (ciudad && coordenadasCiudades[ciudad]) return coordenadasCiudades[ciudad];
        if (centro) return centro;
        return [4.60971, -74.08175]; // Bogotá por defecto
    };

    const centroMapa = determinarCentro();

    return (
        <MapContainer
            center={centroMapa}
            zoom={zoom}
            style={{ height: '500px', width: '100%', borderRadius: '10px' }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            
            {/* Centrar mapa en ubicación del usuario si está disponible */}
            {ubicacionUsuario && <CentrarMapa posicion={ubicacionUsuario} />}
            
            {/* Mostrar marcador de ubicación del usuario */}
            {ubicacionUsuario && <UbicacionUsuario posicion={ubicacionUsuario} />}
            
            {/* Mostrar parqueaderos */}
            {parqueaderos?.map((p) => (
                <Marker
                    key={p._id || p.id}
                    position={[p.lat || 4.60971, p.lng || -74.08175]}
                    icon={createColoredIcon(getMarkerColor(p.disponible, p.espacios))}
                >
                    <Popup>
                        <div style={{ minWidth: '220px', fontFamily: 'Arial' }}>
                            {/* 👇 NUEVO: Mostrar primera foto si existe */}
                            {p.fotos?.length > 0 && (
                                <img 
                                    src={p.fotos[0]} 
                                    alt={p.nombre}
                                    style={{
                                        width: '100%',
                                        height: '120px',
                                        objectFit: 'cover',
                                        borderRadius: '5px',
                                        marginBottom: '10px',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                    }}
                                />
                            )}
                            
                            <h3 style={{ 
                                margin: '0 0 5px 0', 
                                color: '#2C3E50',
                                fontSize: '1.1rem',
                                borderBottom: '1px solid #eee',
                                paddingBottom: '5px'
                            }}>
                                {p.nombre}
                            </h3>
                            
                            <p style={{ margin: '8px 0', fontSize: '0.9rem' }}>
                                <span style={{ fontWeight: 'bold' }}>📍 Dirección:</span><br/>
                                {p.direccion}
                            </p>
                            
                            <p style={{ margin: '8px 0', fontSize: '0.9rem' }}>
                                <span style={{ fontWeight: 'bold' }}>💰 Precio:</span><br/>
                                ${p.precio}/hora
                            </p>
                            
                            <p style={{ margin: '8px 0', fontSize: '0.9rem' }}>
                                <span style={{ fontWeight: 'bold' }}>📊 Disponibilidad:</span><br/>
                                {p.disponible ? (
                                    <span style={{ 
                                        color: p.espacios < 5 ? '#FF9800' : '#4CAF50',
                                        fontWeight: 'bold'
                                    }}>
                                        🟢 {p.espacios} espacios disponibles
                                    </span>
                                ) : (
                                    <span style={{ color: '#F44336', fontWeight: 'bold' }}>
                                        🔴 Completamente lleno
                                    </span>
                                )}
                            </p>

                            <div style={{ 
                                display: 'flex', 
                                gap: '8px', 
                                marginTop: '12px',
                                borderTop: '1px solid #eee',
                                paddingTop: '10px'
                            }}>
                                <button
                                    onClick={() => window.location.href = `/parqueadero/${p._id || p.id}`}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#FF7E5F',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 5px',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    📋 Detalles
                                </button>
                                
                                <button
                                    onClick={() => abrirRuta(p.lat, p.lng, p.nombre)}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#4285F4',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 5px',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: 'bold'
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