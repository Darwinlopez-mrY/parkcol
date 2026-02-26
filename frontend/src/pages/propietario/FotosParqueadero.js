import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import SubirFotos from '../../components/SubirFotos';

const FotosParqueadero = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [parqueadero, setParqueadero] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        cargarParqueadero();
    }, [id]);

    const cargarParqueadero = async () => {
        try {
            const response = await API.get(`/parqueaderos/${id}`);
            setParqueadero(response.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setCargando(false);
        }
    };

    const handleFotosActualizadas = (nuevasFotos) => {
        setParqueadero({ ...parqueadero, fotos: nuevasFotos });
    };

    const eliminarFoto = async (fotoUrl) => {
        if (!window.confirm('¿Eliminar esta foto?')) return;

        try {
            await API.delete(`/upload/parqueadero/${id}/foto`, {
                data: { fotoUrl }
            });
            
            // Actualizar lista de fotos
            const nuevasFotos = parqueadero.fotos.filter(f => f !== fotoUrl);
            setParqueadero({ ...parqueadero, fotos: nuevasFotos });
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar la foto');
        }
    };

    if (cargando) return <div style={styles.loading}>Cargando...</div>;

    return (
        <div style={styles.container}>
            <button onClick={() => navigate('/propietario')} style={styles.backButton}>
                ← Volver al panel
            </button>

            <h1 style={styles.title}>Fotos de {parqueadero?.nombre}</h1>

            <SubirFotos 
                parqueaderoId={id} 
                onFotosActualizadas={handleFotosActualizadas}
            />

            <h2 style={styles.subtitle}>Fotos actuales</h2>
            
            {parqueadero?.fotos?.length === 0 ? (
                <p style={styles.empty}>No hay fotos aún</p>
            ) : (
                <div style={styles.galeria}>
                    {parqueadero?.fotos?.map((foto, index) => (
                        <div key={index} style={styles.fotoContainer}>
                            <img src={foto} alt={`Foto ${index + 1}`} style={styles.foto} />
                            <button 
                                onClick={() => eliminarFoto(foto)}
                                style={styles.deleteButton}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '20px'
    },
    backButton: {
        backgroundColor: 'transparent',
        border: '1px solid #ddd',
        padding: '8px 15px',
        borderRadius: '5px',
        cursor: 'pointer',
        marginBottom: '20px'
    },
    title: {
        fontSize: '2rem',
        color: '#2C3E50',
        marginBottom: '30px'
    },
    subtitle: {
        fontSize: '1.5rem',
        color: '#2C3E50',
        marginTop: '30px',
        marginBottom: '20px'
    },
    empty: {
        color: '#666',
        fontStyle: 'italic'
    },
    galeria: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '20px'
    },
    fotoContainer: {
        position: 'relative',
        aspectRatio: '1/1',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    foto: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    deleteButton: {
        position: 'absolute',
        top: '5px',
        right: '5px',
        backgroundColor: 'rgba(244, 67, 54, 0.9)',
        color: 'white',
        border: 'none',
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        fontSize: '20px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s'
    },
    loading: {
        textAlign: 'center',
        padding: '50px',
        color: '#666'
    }
};

export default FotosParqueadero;