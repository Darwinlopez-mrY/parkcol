import React, { useState } from 'react';
import { useMapEvents } from 'react-leaflet';

const BuscarArea = ({ onAreaSeleccionada }) => {
    const [seleccionando, setSeleccionando] = useState(false);

    const map = useMapEvents({
        click(e) {
            if (seleccionando) {
                onAreaSeleccionada(e.latlng);
                setSeleccionando(false);
            }
        }
    });

    return (
        <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 1000,
            backgroundColor: 'white',
            padding: '10px',
            borderRadius: '5px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }}>
            <button
                onClick={() => setSeleccionando(!seleccionando)}
                style={{
                    backgroundColor: seleccionando ? '#FF7E5F' : '#2C3E50',
                    color: 'white',
                    border: 'none',
                    padding: '8px 15px',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                {seleccionando ? '🔍 Buscar en esta área' : '🔍 Buscar por área'}
            </button>
            {seleccionando && (
                <p style={{ margin: '5px 0 0', fontSize: '0.8rem', color: '#666' }}>
                    Haz clic en el mapa para buscar en esa área
                </p>
            )}
        </div>
    );
};

export default BuscarArea;