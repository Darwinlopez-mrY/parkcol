import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import {
    obtenerParqueaderoAdmin,
    subirFotoAdmin,
    eliminarFotoAdmin
} from '../../services/adminAPI';

const FotosParqueaderoAdmin = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [parqueadero, setParqueadero] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [subiendo, setSubiendo] = useState(false);
    const [error, setError] = useState('');

    // ============ CARGAR PARQUEADERO ============
    const cargarParqueadero = useCallback(async () => {
        try {
            setCargando(true);
            setError('');
            const response = await obtenerParqueaderoAdmin(id);
            setParqueadero(response.data);
        } catch (err) {
            console.error('Error:', err);
            setError(err.response?.data?.mensaje || 'Error al cargar parqueadero');
        } finally {
            setCargando(false);
        }
    }, [id]);

    useEffect(() => {
        cargarParqueadero();
    }, [cargarParqueadero]);

    // ============ SUBIR FOTOS ============
    const onDrop = async (archivos) => {
        if (archivos.length === 0) return;

        setSubiendo(true);
        try {
            for (const archivo of archivos) {
                await subirFotoAdmin(id, archivo);
            }
            await cargarParqueadero();
            alert(`✅ ${archivos.length} foto${archivos.length > 1 ? 's' : ''} subida${archivos.length > 1 ? 's' : ''}`);
        } catch (err) {
            console.error('Error subiendo:', err);
            alert(`❌ ${err.response?.data?.mensaje || 'Error al subir foto'}`);
        } finally {
            setSubiendo(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
        maxFiles: 5,
        maxSize: 5 * 1024 * 1024,
        disabled: subiendo
    });

    // ============ ELIMINAR FOTO ============
    const handleEliminar = async (fotoUrl) => {
        if (!window.confirm('¿Eliminar esta foto?')) return;

        try {
            await eliminarFotoAdmin(id, fotoUrl);
            await cargarParqueadero();
            alert('✅ Foto eliminada');
        } catch (err) {
            alert(`❌ ${err.response?.data?.mensaje || 'Error al eliminar'}`);
        }
    };

    // ============ RENDER ============
    if (cargando) {
        return <div style={styles.loading}>⏳ Cargando parqueadero...</div>;
    }

    if (error) {
        return (
            <div>
                <div style={styles.error}>❌ {error}</div>
                <button onClick={() => navigate('/admin/parqueaderos')} style={styles.backBtn}>
                    ← Volver a parqueaderos
                </button>
            </div>
        );
    }

    if (!parqueadero) return null;

    return (
        <div>
            <button
                onClick={() => navigate('/admin/parqueaderos')}
                style={styles.backBtn}
            >
                ← Volver a parqueaderos
            </button>

            <h1 style={styles.title}>📸 Fotos del parqueadero</h1>
            <div style={styles.parqueaderoInfo}>
                <h2 style={styles.parqueaderoNombre}>{parqueadero.nombre}</h2>
                <p style={styles.parqueaderoDetalle}>
                    📍 {parqueadero.direccion}, {parqueadero.ciudad}
                </p>
                {parqueadero.propietario_id && (
                    <p style={styles.parqueaderoDetalle}>
                        👤 Propietario: {parqueadero.propietario_id.nombre}
                        {parqueadero.propietario_id.banned && (
                            <span style={{...styles.badge, backgroundColor: '#F44336', marginLeft: '10px'}}>
                                🚫 Baneado
                            </span>
                        )}
                    </p>
                )}
            </div>

            {/* ============ ZONA DE SUBIDA ============ */}
            <h2 style={styles.sectionTitle}>➕ Subir nuevas fotos</h2>
            <div
                {...getRootProps()}
                style={{
                    ...styles.dropzone,
                    ...(isDragActive ? styles.dropzoneActive : {}),
                    ...(subiendo ? styles.dropzoneDisabled : {})
                }}
            >
                <input {...getInputProps()} />
                {subiendo ? (
                    <p style={styles.dropzoneText}>⏳ Subiendo...</p>
                ) : isDragActive ? (
                    <p style={styles.dropzoneText}>📸 Suelta las fotos aquí...</p>
                ) : (
                    <>
                        <p style={styles.dropzoneText}>
                            📁 Arrastra fotos aquí o haz click para seleccionar
                        </p>
                        <p style={styles.dropzoneSubtext}>
                            Máx 5 fotos a la vez, hasta 5MB cada una
                        </p>
                    </>
                )}
            </div>

            {/* ============ GALERÍA ============ */}
            <h2 style={styles.sectionTitle}>
                🖼️ Fotos actuales ({parqueadero.fotos?.length || 0})
            </h2>

            {parqueadero.fotos?.length === 0 ? (
                <div style={styles.empty}>
                    📭 No hay fotos aún
                </div>
            ) : (
                <div style={styles.galeria}>
                    {parqueadero.fotos.map((foto, index) => (
                        <div key={index} style={styles.fotoContainer}>
                            <img
                                src={foto}
                                alt={`Foto ${index + 1}`}
                                style={styles.foto}
                                onClick={() => window.open(foto, '_blank')}
                            />
                            <button
                                onClick={() => handleEliminar(foto)}
                                style={styles.deleteBtn}
                                title="Eliminar foto"
                            >
                                🗑️
                            </button>
                            <span style={styles.fotoNumber}>#{index + 1}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const styles = {
    backBtn: {
        backgroundColor: 'transparent',
        border: '1px solid #ddd',
        padding: '8px 15px',
        borderRadius: '6px',
        cursor: 'pointer',
        color: '#2C3E50',
        marginBottom: '20px',
        fontSize: '0.9rem'
    },
    title: {
        fontSize: '2rem',
        color: '#2C3E50',
        margin: '0 0 20px 0'
    },
    parqueaderoInfo: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        marginBottom: '30px'
    },
    parqueaderoNombre: {
        fontSize: '1.4rem',
        color: '#2C3E50',
        margin: '0 0 10px 0'
    },
    parqueaderoDetalle: {
        color: '#666',
        margin: '5px 0',
        fontSize: '0.95rem'
    },
    badge: {
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: '12px',
        color: 'white',
        fontSize: '0.75rem',
        fontWeight: 'bold'
    },
    sectionTitle: {
        fontSize: '1.2rem',
        color: '#2C3E50',
        margin: '25px 0 15px 0'
    },
    dropzone: {
        border: '2px dashed #FF7E5F',
        borderRadius: '10px',
        padding: '30px',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: '#fff9f5',
        transition: 'all 0.3s',
        marginBottom: '20px'
    },
    dropzoneActive: {
        backgroundColor: '#ffe8e0',
        borderColor: '#FF4F2A'
    },
    dropzoneDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed'
    },
    dropzoneText: {
        fontSize: '1.1rem',
        color: '#2C3E50',
        margin: '0 0 5px 0'
    },
    dropzoneSubtext: {
        color: '#666',
        fontSize: '0.85rem',
        margin: 0
    },
    galeria: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '15px'
    },
    fotoContainer: {
        position: 'relative',
        aspectRatio: '4/3',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        backgroundColor: '#f5f5f5'
    },
    foto: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        cursor: 'pointer'
    },
    deleteBtn: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: 'rgba(244, 67, 54, 0.9)',
        color: 'white',
        border: 'none',
        width: '35px',
        height: '35px',
        borderRadius: '50%',
        fontSize: '1rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.3s'
    },
    fotoNumber: {
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '3px 10px',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: 'bold'
    },
    empty: {
        textAlign: 'center',
        padding: '60px 20px',
        color: '#999',
        fontSize: '1.1rem',
        backgroundColor: 'white',
        borderRadius: '10px'
    },
    loading: {
        textAlign: 'center',
        padding: '50px',
        color: '#666',
        fontSize: '1.1rem'
    },
    error: {
        padding: '20px',
        backgroundColor: '#ffebee',
        color: '#c62828',
        borderRadius: '8px',
        textAlign: 'center',
        marginBottom: '20px'
    }
};

export default FotosParqueaderoAdmin;