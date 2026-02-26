import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import API from '../services/api';

const SubirFotos = ({ parqueaderoId, onFotosActualizadas }) => {
    const [subiendo, setSubiendo] = useState(false);
    const [error, setError] = useState('');

    const onDrop = async (archivos) => {
        if (archivos.length === 0) return;

        setSubiendo(true);
        setError('');

        const formData = new FormData();
        formData.append('foto', archivos[0]);

        try {
            const response = await API.post(`/upload/parqueadero/${parqueaderoId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (onFotosActualizadas) {
                onFotosActualizadas(response.data.fotos);
            }
        } catch (error) {
            setError('Error al subir la foto');
            console.error('Error:', error);
        } finally {
            setSubiendo(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif'] },
        maxFiles: 1,
        maxSize: 5 * 1024 * 1024 // 5MB
    });

    return (
        <div style={styles.container}>
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
                    <p>Subiendo foto...</p>
                ) : isDragActive ? (
                    <p>Suelta la imagen aquí...</p>
                ) : (
                    <p>Arrastra una imagen o haz clic para seleccionar</p>
                )}
            </div>
            {error && <p style={styles.error}>{error}</p>}
            <p style={styles.note}>Formatos: JPG, PNG, GIF | Máx: 5MB</p>
        </div>
    );
};

const styles = {
    container: {
        marginBottom: '20px'
    },
    dropzone: {
        border: '2px dashed #FF7E5F',
        borderRadius: '10px',
        padding: '20px',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: '#fff9f5',
        transition: 'all 0.3s'
    },
    dropzoneActive: {
        backgroundColor: '#ffe8e0',
        borderColor: '#FF4F2A'
    },
    dropzoneDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed'
    },
    error: {
        color: '#F44336',
        marginTop: '10px',
        fontSize: '0.9rem'
    },
    note: {
        color: '#666',
        fontSize: '0.8rem',
        marginTop: '5px'
    }
};

export default SubirFotos;