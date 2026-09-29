import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../services/api';

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 👇 NUEVO: obtener ubicación actual del navegador
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ============================
        // VALIDACIONES
        // ============================
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

        if (isNaN(lat) || lat < -5 || lat > 15) {
            alert(
                '❌ Latitud inválida. Debe estar entre -5 y 15 (rango Colombia).\n\n' +
                '📍 Ejemplos:\n' +
                '• Bogotá: 4.60971\n' +
                '• Medellín: 6.2442\n' +
                '• Cali: 3.4516\n' +
                '• Cartagena: 10.3910\n' +
                '• Cúcuta: 7.8939'
            );
            return;
        }

        if (isNaN(lng) || lng < -85 || lng > -65) {
            alert(
                '❌ Longitud inválida. Debe estar entre -85 y -65 (rango Colombia).\n\n' +
                '📍 Ejemplos:\n' +
                '• Bogotá: -74.08175\n' +
                '• Medellín: -75.5812\n' +
                '• Cali: -76.5320\n' +
                '• Cartagena: -75.4794\n' +
                '• Cúcuta: -72.5078'
            );
            return;
        }

        // ============================
        // ENVIAR AL BACKEND
        // ============================
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
                    <label style={styles.label}>Ciudad *</label>
                    <select
                        name="ciudad"
                        value={formData.ciudad}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    >
                        <option value="Bogotá">Bogotá</option>
                        <option value="Medellín">Medellín</option>
                        <option value="Cali">Cali</option>
                        <option value="Barranquilla">Barranquilla</option>
                        <option value="Cartagena">Cartagena</option>
                        <option value="Bucaramanga">Bucaramanga</option>
                        <option value="Pereira">Pereira</option>
                        <option value="Manizales">Manizales</option>
                        <option value="Cúcuta">Cúcuta</option>
                        <option value="Santa Marta">Santa Marta</option>
                        <option value="Ibagué">Ibagué</option>
                        <option value="Villavicencio">Villavicencio</option>
                        <option value="Pasto">Pasto</option>
                        <option value="Montería">Montería</option>
                        <option value="Neiva">Neiva</option>
                    </select>
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

                {/* Botón obtener ubicación */}
                <button
                    type="button"
                    onClick={usarMiUbicacion}
                    disabled={cargandoUbicacion}
                    style={cargandoUbicacion ? styles.locationButtonDisabled : styles.locationButton}
                >
                    {cargandoUbicacion ? '⏳ Obteniendo ubicación...' : '📍 Usar mi ubicación actual'}
                </button>

                {/* Latitud */}
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
                        📍 Entre -5 y 15 (Bogotá: 4.60971 | Medellín: 6.2442)
                    </small>
                </div>

                {/* Longitud */}
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
                        📍 Entre -85 y -65 (Bogotá: -74.08175 | Medellín: -75.5812)
                    </small>
                </div>

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
        maxWidth: '600px',
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
    locationButton: {
        backgroundColor: '#e3f2fd',
        color: '#1976d2',
        border: '1px solid #1976d2',
        padding: '12px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '1rem',
        transition: 'background 0.2s'
    },
    locationButtonDisabled: {
        backgroundColor: '#f5f5f5',
        color: '#999',
        border: '1px solid #ccc',
        padding: '12px',
        borderRadius: '5px',
        cursor: 'not-allowed',
        fontWeight: 'bold',
        fontSize: '1rem'
    },
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
    }
};

export default FormularioParqueadero;