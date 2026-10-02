import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import API from '../../services/api';

// ========================================
// Icono personalizado para el marcador
// ========================================
const iconoParqueadero = L.divIcon({
    className: 'marker-parqueadero',
    html: `<div style="
        background-color: #FF7E5F;
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        position: relative;
    ">
        <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(45deg);
            font-size: 14px;
        ">🅿️</div>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30]
});

// ========================================
// Componente: click en el mapa
// ========================================
const ClickHandler = ({ onMapClick }) => {
    useMapEvents({
        click: (e) => {
            onMapClick(e.latlng.lat, e.latlng.lng);
        }
    });
    return null;
};

// ========================================
// Componente: centrar mapa
// ========================================
const CentrarMapa = ({ posicion }) => {
    const map = useMapEvents({});
    useEffect(() => {
        if (posicion && map) {
            map.setView(posicion, 15);
        }
    }, [posicion, map]);
    return null;
};

// ========================================
// Componente principal
// ========================================
const FormularioParqueadero = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre: '',
        direccion: '',
        ciudad: 'Bogotá',
        precio: '',
        espacios: '',
        telefono: '',
        lat: '',
        lng: ''
    });
    const [cargandoUbicacion, setCargandoUbicacion] = useState(false);
    const [mostrarMapa, setMostrarMapa] = useState(false);
    const [cargandoParqueadero, setCargandoParqueadero] = useState(false);

    // ========================================
    // Cargar datos si es edición
    // ========================================
    useEffect(() => {
        const cargarParqueadero = async () => {
            if (!id) return;
            
            try {
                setCargandoParqueadero(true);
                const response = await API.get(`/parqueaderos/${id}`);
                const p = response.data;
                
                setFormData({
                    nombre: p.nombre || '',
                    direccion: p.direccion || '',
                    ciudad: p.ciudad || 'Bogotá',
                    precio: p.precio || '',
                    espacios: p.espacios || '',
                    telefono: p.telefono || '',
                    lat: p.lat || '',
                    lng: p.lng || ''
                });
                
                // Si ya tiene coordenadas, mostrar el mapa centrado
                if (p.lat && p.lng) {
                    setMostrarMapa(true);
                }
            } catch (error) {
                console.error('Error cargando parqueadero:', error);
                alert('Error al cargar el parqueadero');
            } finally {
                setCargandoParqueadero(false);
            }
        };
        
        cargarParqueadero();
    }, [id]);

    // ========================================
    // Handlers
    // ========================================
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 👇 Nuevo: click en el mapa
    const handleMapClick = (lat, lng) => {
        setFormData((prev) => ({
            ...prev,
            lat: lat.toFixed(6),
            lng: lng.toFixed(6)
        }));
    };

    // Obtener ubicación actual
    const usarMiUbicacion = () => {
        if (!navigator.geolocation) {
            alert('❌ Tu navegador no soporta geolocalización');
            return;
        }

        setCargandoUbicacion(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude.toFixed(6);
                const lng = position.coords.longitude.toFixed(6);
                setFormData((prev) => ({ ...prev, lat, lng }));
                setMostrarMapa(true);
                setCargandoUbicacion(false);
                alert(`✅ Ubicación capturada:\nLat: ${lat}\nLng: ${lng}`);
            },
            (error) => {
                setCargandoUbicacion(false);
                let mensaje = 'Error al obtener ubicación';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        mensaje = 'Permiso denegado. Activa la ubicación en tu navegador.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        mensaje = 'Ubicación no disponible.';
                        break;
                    case error.TIMEOUT:
                        mensaje = 'Tiempo de espera agotado.';
                        break;
                    default:
                        break;
                }
                alert(`❌ ${mensaje}`);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    // ========================================
    // Submit
    // ========================================
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones
        const lat = parseFloat(formData.lat);
        const lng = parseFloat(formData.lng);
        const precio = parseFloat(formData.precio);
        const espacios = parseInt(formData.espacios);

        if (!formData.nombre || formData.nombre.trim().length < 3) {
            alert('❌ El nombre debe tener al menos 3 caracteres.');
            return;
        }
        if (!formData.direccion || formData.direccion.trim().length < 5) {
            alert('❌ La dirección debe tener al menos 5 caracteres.');
            return;
        }
        if (isNaN(precio) || precio < 100) {
            alert('❌ Precio inválido. Debe ser al menos $100 por hora.');
            return;
        }
        if (precio > 1000000) {
            alert('❌ El precio no puede exceder $1,000,000 por hora.');
            return;
        }
        if (isNaN(espacios) || espacios < 1) {
            alert('❌ Número de espacios inválido. Debe ser al menos 1.');
            return;
        }
        if (espacios > 10000) {
            alert('❌ El número de espacios no puede exceder 10,000.');
            return;
        }
        if (!formData.telefono || formData.telefono.trim().length < 7) {
            alert('❌ El teléfono debe tener al menos 7 caracteres.');
            return;
        }
        if (isNaN(lat) || lat < -90 || lat > 90) {
            alert('❌ Latitud inválida. Debe estar entre -5 y 15 (rango Colombia).');
            return;
        }
        if (isNaN(lng) || lng < -180 || lng > 180) {
            alert('❌ Longitud inválida. Debe estar entre -85 y -65 (rango Colombia).');
            return;
        }

        try {
            const datosParaEnviar = {
                ...formData,
                precio: Number(formData.precio),
                espacios: Number(formData.espacios),
                lat: Number(formData.lat),
                lng: Number(formData.lng)
            };

            if (id) {
                await API.put(`/propietario/parqueaderos/${id}`, datosParaEnviar);
            } else {
                await API.post('/propietario/parqueaderos', datosParaEnviar);
            }
            navigate('/propietario');
        } catch (error) {
            console.error('Error:', error);
            const mensaje =
                error.response?.data?.mensaje ||
                error.response?.data?.error ||
                'Error al guardar. Verifica los datos.';
            alert(`❌ ${mensaje}`);
        }
    };

    // Coordenadas válidas para el mapa
    const coordenadasMapa = formData.lat && formData.lng && !isNaN(parseFloat(formData.lat)) && !isNaN(parseFloat(formData.lng))
        ? [parseFloat(formData.lat), parseFloat(formData.lng)]
        : [4.60971, -74.08175]; // Bogotá por defecto

    if (cargandoParqueadero) {
        return <div style={styles.loading}>⏳ Cargando parqueadero...</div>;
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>{id ? 'Editar' : 'Nuevo'} parqueadero</h1>

            <form onSubmit={handleSubmit} style={styles.form}>
                {/* Nombre */}
                <div style={styles.fieldGroup}>
                    <label style={styles.label}>Nombre del parqueadero *</label>
                    <input
                        name="nombre"
                        placeholder="Ej: Parqueadero Centro"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                        minLength={3}
                        maxLength={100}
                        style={styles.input}
                    />
                </div>

                {/* Dirección */}
                <div style={styles.fieldGroup}>
                    <label style={styles.label}>Dirección *</label>
                    <input
                        name="direccion"
                        placeholder="Ej: Cra 10 #5-20"
                        value={formData.direccion}
                        onChange={handleChange}
                        required
                        minLength={5}
                        maxLength={200}
                        style={styles.input}
                    />
                </div>

                {/* Ciudad */}
                <div style={styles.fieldGroup}>
                    <label style={styles.label}>Ciudad / Municipio *</label>
                    <input
                        name="ciudad"
                        type="text"
                        list="ciudades-sugeridas"
                        placeholder="Ej: Bogotá, Madrid, Ciudad de México..."
                        value={formData.ciudad}
                        onChange={handleChange}
                        required
                        minLength={2}
                        maxLength={100}
                        style={styles.input}
                        autoComplete="off"
                    />
                    <datalist id="ciudades-sugeridas">
                        {/* 🇨🇴 Colombia */}
                        <option value="Bogotá" />
                        <option value="Medellín" />
                        <option value="Cali" />
                        <option value="Barranquilla" />
                        <option value="Cartagena" />
                        <option value="Bucaramanga" />
                        <option value="Pereira" />
                        <option value="Manizales" />
                        <option value="Cúcuta" />
                        <option value="Santa Marta" />
                        <option value="Ibagué" />
                        <option value="Villavicencio" />
                        <option value="Pasto" />
                        <option value="Montería" />
                        <option value="Neiva" />
                        <option value="Armenia" />
                        <option value="Popayán" />
                        <option value="Valledupar" />
                        <option value="Sincelejo" />
                        <option value="Tunja" />
                        {/* 🌎 Internacionales */}
                        <option value="Ciudad de México" />
                        <option value="Buenos Aires" />
                        <option value="Lima" />
                        <option value="Santiago" />
                        <option value="São Paulo" />
                        <option value="Madrid" />
                        <option value="Barcelona" />
                        <option value="Ciudad de Panamá" />
                        <option value="Miami" />
                        <option value="Nueva York" />
                    </datalist>
                    <small style={styles.hint}>
                        💡 Puedes escribir cualquier ciudad del mundo o elegir una sugerencia
                    </small>
                </div>

                {/* Precio */}
                <div style={styles.fieldGroup}>
                    <label style={styles.label}>Precio por hora ($) *</label>
                    <input
                        name="precio"
                        type="number"
                        placeholder="Ej: 3000"
                        value={formData.precio}
                        onChange={handleChange}
                        required
                        min="100"
                        max="1000000"
                        step="100"
                        style={styles.input}
                    />
                    <small style={styles.hint}>💰 Entre $100 y $1,000,000</small>
                </div>

                {/* Espacios */}
                <div style={styles.fieldGroup}>
                    <label style={styles.label}>Número de espacios *</label>
                    <input
                        name="espacios"
                        type="number"
                        placeholder="Ej: 20"
                        value={formData.espacios}
                        onChange={handleChange}
                        required
                        min="1"
                        max="10000"
                        style={styles.input}
                    />
                </div>

                {/* Teléfono */}
                <div style={styles.fieldGroup}>
                    <label style={styles.label}>Teléfono de contacto *</label>
                    <input
                        name="telefono"
                        placeholder="Ej: 3201234567"
                        value={formData.telefono}
                        onChange={handleChange}
                        required
                        minLength={7}
                        maxLength={20}
                        style={styles.input}
                    />
                </div>

                {/* ============================================ */}
                {/* SECCIÓN UBICACIÓN */}
                {/* ============================================ */}
                <div style={styles.ubicacionSection}>
                    <h3 style={styles.ubicacionTitle}>📍 Ubicación del parqueadero *</h3>

                    {/* Coordenadas actuales */}
                    {formData.lat && formData.lng && (
                        <div style={styles.coordsPreview}>
                            <div style={styles.coordsItem}>
                                <span style={styles.coordsLabel}>Latitud:</span>
                                <span style={styles.coordsValue}>{formData.lat}</span>
                            </div>
                            <div style={styles.coordsItem}>
                                <span style={styles.coordsLabel}>Longitud:</span>
                                <span style={styles.coordsValue}>{formData.lng}</span>
                            </div>
                        </div>
                    )}

                    {!formData.lat && !formData.lng && (
                        <div style={styles.coordsEmpty}>
                            ⚠️ Aún no has seleccionado una ubicación
                        </div>
                    )}

                    {/* Botones de acción */}
                    <div style={styles.ubicacionButtons}>
                        <button
                            type="button"
                            onClick={usarMiUbicacion}
                            disabled={cargandoUbicacion}
                            style={cargandoUbicacion ? styles.locationButtonDisabled : styles.locationButton}
                        >
                            {cargandoUbicacion ? '⏳ Obteniendo...' : '📍 Usar mi ubicación actual'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setMostrarMapa(!mostrarMapa)}
                            style={mostrarMapa ? styles.mapButtonActive : styles.mapButton}
                        >
                            {mostrarMapa ? '🗺️ Ocultar mapa' : '🗺️ Seleccionar en mapa'}
                        </button>
                    </div>

                    {/* Mapa interactivo */}
                    {mostrarMapa && (
                        <div style={styles.mapaContainer}>
                            <p style={styles.mapaHint}>
                                👆 Haz click en el mapa para seleccionar la ubicación exacta
                            </p>
                            <MapContainer
                                center={coordenadasMapa}
                                zoom={15}
                                style={{ height: '400px', width: '100%', borderRadius: '8px' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                />
                                <ClickHandler onMapClick={handleMapClick} />
                                <CentrarMapa posicion={coordenadasMapa} />
                                {formData.lat && formData.lng && !isNaN(parseFloat(formData.lat)) && !isNaN(parseFloat(formData.lng)) && (
                                    <Marker
                                        position={[parseFloat(formData.lat), parseFloat(formData.lng)]}
                                        icon={iconoParqueadero}
                                    />
                                )}
                            </MapContainer>
                        </div>
                    )}

                    {/* Separador "o ingresa manualmente" */}
                    <div style={styles.separator}>
                        <div style={styles.separatorLine}></div>
                        <span style={styles.separatorText}>O ingresa manualmente</span>
                        <div style={styles.separatorLine}></div>
                    </div>

                    {/* Inputs de lat/lng */}
                    <div style={styles.manualCoords}>
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Latitud *</label>
                            <input
                                name="lat"
                                type="number"
                                step="0.000001"
                                placeholder="Ej: 4.60971"
                                value={formData.lat}
                                onChange={handleChange}
                                required
                                style={styles.input}
                            />
                            <small style={styles.hint}>
                                📍 Latitud: -90 a 90 
                            </small>
                        </div>

                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Longitud *</label>
                            <input
                                name="lng"
                                type="number"
                                step="0.000001"
                                placeholder="Ej: -74.08175"
                                value={formData.lng}
                                onChange={handleChange}
                                required
                                style={styles.input}
                            />
                            <small style={styles.hint}>
                                📍 Longitud: -180 a 180 
                            </small>
                        </div>
                    </div>
                </div>

                {/* Botones de acción */}
                <div style={styles.buttonGroup}>
                    <button
                        type="button"
                        onClick={() => navigate('/propietario')}
                        style={styles.cancelButton}
                    >
                        Cancelar
                    </button>
                    <button type="submit" style={styles.submitButton}>
                        {id ? 'Guardar cambios' : 'Crear parqueadero'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '700px',
        margin: '0 auto',
        padding: '20px'
    },
    title: {
        color: '#2C3E50',
        marginBottom: '20px',
        fontSize: '1.8rem'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    fieldGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    label: {
        color: '#2C3E50',
        fontWeight: '600',
        fontSize: '0.9rem'
    },
    input: {
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '1rem',
        outline: 'none'
    },
    hint: {
        color: '#666',
        fontSize: '0.8rem',
        fontStyle: 'italic'
    },
    // ============================================
    // Sección de ubicación
    // ============================================
    ubicacionSection: {
        border: '2px solid #e8f5e9',
        borderRadius: '10px',
        padding: '20px',
        backgroundColor: '#fafffe',
        marginTop: '10px'
    },
    ubicacionTitle: {
        color: '#2C3E50',
        marginTop: 0,
        marginBottom: '15px',
        fontSize: '1.1rem'
    },
    coordsPreview: {
        display: 'flex',
        gap: '20px',
        padding: '12px',
        backgroundColor: '#e8f5e9',
        borderRadius: '8px',
        marginBottom: '15px',
        flexWrap: 'wrap'
    },
    coordsItem: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
    },
    coordsLabel: {
        color: '#666',
        fontSize: '0.85rem',
        fontWeight: '600'
    },
    coordsValue: {
        color: '#2C3E50',
        fontWeight: 'bold',
        fontFamily: 'monospace',
        fontSize: '0.95rem'
    },
    coordsEmpty: {
        padding: '12px',
        backgroundColor: '#fff3cd',
        color: '#856404',
        borderRadius: '8px',
        marginBottom: '15px',
        textAlign: 'center',
        fontSize: '0.9rem'
    },
    ubicacionButtons: {
        display: 'flex',
        gap: '10px',
        marginBottom: '15px',
        flexWrap: 'wrap'
    },
    locationButton: {
        flex: 1,
        minWidth: '200px',
        backgroundColor: '#e3f2fd',
        color: '#1976d2',
        border: '1px solid #1976d2',
        padding: '12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '0.95rem',
        transition: 'all 0.2s'
    },
    locationButtonDisabled: {
        flex: 1,
        minWidth: '200px',
        backgroundColor: '#f5f5f5',
        color: '#999',
        border: '1px solid #ccc',
        padding: '12px',
        borderRadius: '6px',
        cursor: 'not-allowed',
        fontWeight: 'bold',
        fontSize: '0.95rem'
    },
    mapButton: {
        flex: 1,
        minWidth: '200px',
        backgroundColor: 'white',
        color: '#FF7E5F',
        border: '1px solid #FF7E5F',
        padding: '12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '0.95rem',
        transition: 'all 0.2s'
    },
    mapButtonActive: {
        flex: 1,
        minWidth: '200px',
        backgroundColor: '#FF7E5F',
        color: 'white',
        border: '1px solid #FF7E5F',
        padding: '12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '0.95rem'
    },
    mapaContainer: {
        marginBottom: '20px'
    },
    mapaHint: {
        backgroundColor: '#fff3cd',
        color: '#856404',
        padding: '10px',
        borderRadius: '6px',
        marginBottom: '10px',
        fontSize: '0.85rem',
        textAlign: 'center'
    },
    separator: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        margin: '20px 0'
    },
    separatorLine: {
        flex: 1,
        height: '1px',
        backgroundColor: '#e0e0e0'
    },
    separatorText: {
        color: '#999',
        fontSize: '0.85rem',
        fontStyle: 'italic',
        whiteSpace: 'nowrap'
    },
    manualCoords: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '15px'
    },
    // ============================================
    // Botones
    // ============================================
    buttonGroup: {
        display: 'flex',
        gap: '10px',
        justifyContent: 'flex-end',
        marginTop: '10px'
    },
    cancelButton: {
        backgroundColor: 'white',
        color: '#666',
        border: '1px solid #ddd',
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '1rem'
    },
    submitButton: {
        backgroundColor: '#FF7E5F',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '1rem'
    },
    loading: {
        textAlign: 'center',
        padding: '50px',
        color: '#666',
        fontSize: '1.1rem'
    }
};

export default FormularioParqueadero;