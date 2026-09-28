import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Registro = () => {
    const navigate = useNavigate();
    const { registro, loading, error } = useAuth();
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        telefono: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await registro(formData);
        if (result.success) {
            navigate('/');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.formContainer}>
                <h2 style={styles.title}>Crear cuenta en ParkCol</h2>
                
                {error && <div style={styles.error}>{error}</div>}
                
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Nombre completo</label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            placeholder="Ej: Carlos Gómez"
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Correo electrónico</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            placeholder="ejemplo@email.com"
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Teléfono</label>
                        <input
                            type="tel"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            placeholder="3201234567"
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Contraseña</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength="6"
                            style={styles.input}
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={loading ? {...styles.button, ...styles.buttonDisabled} : styles.button}
                    >
                        {loading ? 'Registrando...' : 'CREAR CUENTA'}
                    </button>
                </form>

                <div style={styles.loginLink}>
                    ¿Ya tienes cuenta? <Link to="/login" style={styles.link}>Inicia sesión</Link>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
    },
    formContainer: {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '500px'
    },
    title: {
        color: '#2C3E50',
        textAlign: 'center',
        marginBottom: '30px',
        fontSize: '1.8rem'
    },
    error: {
        backgroundColor: '#ffebee',
        color: '#c62828',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '20px',
        textAlign: 'center'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    label: {
        color: '#2C3E50',
        fontWeight: 'bold'
    },
    input: {
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '1rem'
    },
    button: {
        backgroundColor: '#FF7E5F',
        color: 'white',
        border: 'none',
        padding: '15px',
        borderRadius: '5px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '10px',
        transition: 'background 0.3s'
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
        cursor: 'not-allowed'
    },
    loginLink: {
        textAlign: 'center',
        marginTop: '20px',
        color: '#666'
    },
    link: {
        color: '#FF7E5F',
        textDecoration: 'none',
        fontWeight: 'bold'
    }
};

export default Registro;