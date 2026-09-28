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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (id) {
                await API.put(`/propietario/parqueaderos/${id}`, formData);
            } else {
                await API.post('/propietario/parqueaderos', formData);
            }
            navigate('/propietario');
        } catch (error) {
            console.error('Error:', error);
            alert('Error al guardar. Verifica los datos.');
        }
    };

    return (
        <div style={styles.container}>
            <h1>{id ? 'Editar' : 'Nuevo'} parqueadero</h1>
            <form onSubmit={handleSubmit} style={styles.form}>
                <input
                    name="nombre"
                    placeholder="Nombre del parqueadero"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    style={styles.input}
                />
                
                <input
                    name="direccion"
                    placeholder="Dirección"
                    value={formData.direccion}
                    onChange={handleChange}
                    required
                    style={styles.input}
                />
                
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
                </select>
                
                <input
                    name="precio"
                    type="number"
                    placeholder="Precio por hora ($)"
                    value={formData.precio}
                    onChange={handleChange}
                    required
                    min="1000"
                    step="500"
                    style={styles.input}
                />
                
                <input
                    name="espacios"
                    type="number"
                    placeholder="Número de espacios"
                    value={formData.espacios}
                    onChange={handleChange}
                    required
                    min="1"
                    style={styles.input}
                />
                
                <input
                    name="telefono"
                    placeholder="Teléfono de contacto"
                    value={formData.telefono}
                    onChange={handleChange}
                    required
                    style={styles.input}
                />
                
                <input
                    name="lat"
                    type="number"
                    step="0.000001"
                    placeholder="Latitud (ej: 4.60971)"
                    value={formData.lat}
                    onChange={handleChange}
                    required
                    style={styles.input}
                />
                
                <input
                    name="lng"
                    type="number"
                    step="0.000001"
                    placeholder="Longitud (ej: -74.08175)"
                    value={formData.lng}
                    onChange={handleChange}
                    required
                    style={styles.input}
                />
                
                <div style={styles.buttonGroup}>
                    <button
                        type="button"
                        onClick={() => navigate('/propietario')}
                        style={styles.cancelButton}
                    >
                        Cancelar
                    </button>
                    <button type="submit" style={styles.submitButton}>
                        Guardar
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
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    input: {
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '5px',
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
        cursor: 'pointer'
    },
    submitButton: {
        backgroundColor: '#FF7E5F',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold'
    }
};

export default FormularioParqueadero;