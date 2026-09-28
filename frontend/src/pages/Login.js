import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login, loading, error } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(formData);
        if (result.success) {
            navigate('/');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.formContainer}>
                <h2 style={styles.title}>Iniciar sesión en ParkCol</h2>
                
                {error && <div style={styles.error}>{error}</div>}
                
                <form onSubmit={handleSubmit} style={styles.form}>
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
                        <label style={styles.label}>Contraseña</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            placeholder="Tu contraseña"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={loading ? {...styles.button, ...styles.buttonDisabled} : styles.button}
                    >
                        {loading ? 'Iniciando sesión...' : 'INICIAR SESIÓN'}
                    </button>
                </form>

                <div style={styles.registerLink}>
                    ¿No tienes cuenta? <Link to="/registro" style={styles.link}>Regístrate gratis</Link>
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
        maxWidth: '400px'
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
        marginTop: '10px'
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
        cursor: 'not-allowed'
    },
    registerLink: {
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

export default Login;