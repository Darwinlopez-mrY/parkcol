import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const Inicio = () => {
    const navigate = useNavigate();
    const [busqueda, setBusqueda] = useState('');
    const [ciudad, setCiudad] = useState('');
    const [ciudadesPopulares, setCiudadesPopulares] = useState([]);
    const [recomendados, setRecomendados] = useState([]);
    const [cargando, setCargando] = useState(true);

    // Mapa de imágenes para cada ciudad
    const imagenesCiudades = {
        'Bogotá': '/images/ciudades/bogota.jpg',
        'Medellín': '/images/ciudades/medellin.jpg',
        'Cali': '/images/ciudades/cali.jpg',
        'Barranquilla': '/images/ciudades/barranquilla.jpg',
        'Cartagena': '/images/ciudades/cartagena.jpg',
        'Bucaramanga': '/images/ciudades/bucaramanga.jpg',
        'Pereira': '/images/ciudades/pereira.jpg',
        'Manizales': '/images/ciudades/manizales.jpg',
        'Cúcuta': '/images/ciudades/cucuta.jpg',
        'Santa Marta': '/images/ciudades/santamarta.jpg',
        'Ibagué': '/images/ciudades/ibague.jpg',
        'Villavicencio': '/images/ciudades/villavicencio.jpg',
        'Pasto': '/images/ciudades/pasto.jpg',
        'Montería': '/images/ciudades/monteria.jpg',
        'Neiva': '/images/ciudades/neiva.jpg'
    };

    // Cargar datos al iniciar
    useEffect(() => {
        cargarDatosInicio();
    }, []);

    const cargarDatosInicio = async () => {
        try {
            // Obtener parqueaderos mejor calificados
            const response = await API.get('/parqueaderos');
            const todosParqueaderos = response.data;
            
            // Ordenar por rating y tomar los primeros 3
            const mejores = [...todosParqueaderos]
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 3);
            setRecomendados(mejores);
            
            // Contar parqueaderos por ciudad
            const conteoCiudades = {};
            todosParqueaderos.forEach(p => {
                conteoCiudades[p.ciudad] = (conteoCiudades[p.ciudad] || 0) + 1;
            });
            
            // Crear lista de ciudades con su conteo
            const ciudadesArray = Object.entries(conteoCiudades)
                .map(([nombre, cantidad]) => ({ nombre, cantidad }))
                .sort((a, b) => b.cantidad - a.cantidad); // Ordenar por cantidad
                
            setCiudadesPopulares(ciudadesArray);
            setCargando(false);
        } catch (error) {
            console.error('Error cargando datos:', error);
            setCargando(false);
        }
    };

    const handleBuscar = (e) => {
        e.preventDefault();
        if (busqueda || ciudad) {
            navigate(`/buscar?q=${busqueda}&ciudad=${ciudad}`);
        }
    };

    // Función para obtener color de disponibilidad
    const getDisponibilidadColor = (disponible, espacios) => {
        if (!disponible) return { color: '#F44336', texto: '🔴 Lleno' };
        if (espacios < 5) return { color: '#FF9800', texto: '🟡 Pocos espacios' };
        return { color: '#4CAF50', texto: '🟢 Disponible' };
    };

    return (
        <div style={styles.container}>
            {/* Hero Section con fondo de imagen */}
            <section style={styles.hero}>
                <div style={styles.heroOverlay}></div>
                <div style={styles.heroContent}>
                    <h1 style={styles.title}>Encuentra parqueadero en segundos</h1>
                    <p style={styles.subtitle}>En las principales ciudades de Colombia</p>

                    {/* Barra de búsqueda */}
                    <form onSubmit={handleBuscar} style={styles.searchForm}>
                        <select 
                            value={ciudad} 
                            onChange={(e) => setCiudad(e.target.value)}
                            style={styles.citySelect}
                        >
                            <option value="">Todas las ciudades</option>
                            {ciudadesPopulares.map(c => (
                                <option key={c.nombre} value={c.nombre}>
                                    {c.nombre} ({c.cantidad} parq.)
                                </option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder="Barrio o dirección..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            style={styles.searchInput}
                        />
                        <button type="submit" style={styles.searchButton}>
                            🔍 Buscar
                        </button>
                    </form>

                    <button 
                        style={styles.locationButton}
                        onClick={() => navigate('/buscar?cerca=mi')}
                    >
                        📍 Usar mi ubicación actual
                    </button>
                </div>
            </section>

            {/* Ciudades populares con imágenes */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Explora por ciudad</h2>
                {cargando ? (
                    <div style={styles.loading}>Cargando ciudades...</div>
                ) : (
                    <div style={styles.citiesGrid}>
                        {ciudadesPopulares.map(ciudad => (
                            <div 
                                key={ciudad.nombre} 
                                style={styles.cityCard}
                                onClick={() => navigate(`/buscar?ciudad=${ciudad.nombre}`)}
                            >
                                <div style={styles.imageContainer}>
                                    <img 
                                        src={imagenesCiudades[ciudad.nombre]} 
                                        alt={ciudad.nombre}
                                        style={styles.cityImage}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/images/ciudades/default.jpg';
                                        }}
                                    />
                                    <div style={styles.cityOverlay}>
                                        <h3 style={styles.cityName}>{ciudad.nombre}</h3>
                                        <p style={styles.cityCount}>
                                            {ciudad.cantidad} parq.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Cómo funciona */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>¿Cómo funciona ParkCol?</h2>
                <div style={styles.stepsGrid}>
                    <div style={styles.stepCard}>
                        <div style={styles.stepNumber}>1</div>
                        <h3 style={styles.stepTitle}>Busca</h3>
                        <p style={styles.stepDesc}>Busca por ciudad, zona o cerca de ti</p>
                    </div>
                    <div style={styles.stepCard}>
                        <div style={styles.stepNumber}>2</div>
                        <h3 style={styles.stepTitle}>Compara</h3>
                        <p style={styles.stepDesc}>Compara precios, servicios y reseñas</p>
                    </div>
                    <div style={styles.stepCard}>
                        <div style={styles.stepNumber}>3</div>
                        <h3 style={styles.stepTitle}>Llega</h3>
                        <p style={styles.stepDesc}>Elige y llega directo al parqueadero</p>
                    </div>
                </div>
            </section>

            {/* Recomendados */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>⭐ Los mejor calificados hoy</h2>
                {cargando ? (
                    <div style={styles.loading}>Cargando recomendados...</div>
                ) : (
                    <div style={styles.recommendedGrid}>
                        {recomendados.map((p, i) => {
                            const disponibilidad = getDisponibilidadColor(p.disponible, p.espacios);
                            return (
                                <div key={p._id || i} style={styles.card}>
                                    {p.fotos?.length > 0 && (
                                        <img 
                                            src={p.fotos[0]} 
                                            alt={p.nombre}
                                            style={styles.cardImage}
                                        />
                                    )}
                                    <div style={styles.cardContent}>
                                        <div style={styles.cardHeader}>
                                            <span style={{
                                                ...styles.available,
                                                backgroundColor: disponibilidad.color
                                            }}>
                                                {disponibilidad.texto}
                                            </span>
                                        </div>
                                        <h3 style={styles.cardTitle}>{p.nombre}</h3>
                                        <div style={styles.rating}>
                                            ⭐ {p.rating} ({p.reseñas} reseñas)
                                        </div>
                                        <p style={styles.cardAddress}>📍 {p.ciudad}</p>
                                        <div style={styles.cardFooter}>
                                            <span style={styles.price}>💰 ${p.precio}/h</span>
                                            <button 
                                                style={styles.viewButton}
                                                onClick={() => navigate(`/parqueadero/${p._id}`)}
                                            >
                                                Ver detalles
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px'
    },
    // Hero Section con imagen de fondo
    hero: {
        position: 'relative',
        color: 'white',
        padding: '80px 20px',
        borderRadius: '10px',
        textAlign: 'center',
        marginBottom: '40px',
        overflow: 'hidden',
        backgroundImage: 'url("/images/hero-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    heroOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 1
    },
    heroContent: {
        position: 'relative',
        zIndex: 2,
        width: '100%',
        maxWidth: '800px'
    },
    title: {
        fontSize: 'clamp(2rem, 5vw, 3rem)',
        fontWeight: '800',
        marginBottom: '10px',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
    },
    subtitle: {
        fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
        marginBottom: '30px',
        opacity: 0.95,
        textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
    },
    searchForm: {
        display: 'flex',
        maxWidth: '800px',
        margin: '20px auto',
        gap: '10px',
        position: 'relative',
        zIndex: 2
    },
    citySelect: {
        width: '200px',
        padding: '15px',
        fontSize: '1rem',
        border: 'none',
        borderRadius: '5px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(5px)',
        cursor: 'pointer'
    },
    searchInput: {
        flex: 1,
        padding: '15px',
        fontSize: '1rem',
        border: 'none',
        borderRadius: '5px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(5px)'
    },
    searchButton: {
        padding: '15px 30px',
        backgroundColor: '#2C3E50',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 'bold',
        transition: 'all 0.3s',
        ':hover': {
            backgroundColor: '#1A2B3C',
            transform: 'translateY(-2px)'
        }
    },
    locationButton: {
        padding: '12px 25px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        color: 'white',
        border: '2px solid white',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 'bold',
        transition: 'all 0.3s',
        ':hover': {
            backgroundColor: 'white',
            color: '#2C3E50'
        }
    },
    section: {
        marginBottom: '50px'
    },
    sectionTitle: {
        fontSize: '1.8rem',
        color: '#2C3E50',
        marginBottom: '25px',
        textAlign: 'center'
    },
    loading: {
        textAlign: 'center',
        padding: '40px',
        color: '#666'
    },
    citiesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px'
    },
    cityCard: {
        borderRadius: '10px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.3s, box-shadow 0.3s',
        ':hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
        },
        ':hover img': {
            transform: 'scale(1.1)'
        }
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: '180px',
        overflow: 'hidden'
    },
    cityImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform 0.3s'
    },
    cityOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '15px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
        color: 'white'
    },
    cityName: {
        fontSize: '1.2rem',
        marginBottom: '5px'
    },
    cityCount: {
        fontSize: '0.9rem',
        opacity: 0.9
    },
    stepsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '30px'
    },
    stepCard: {
        textAlign: 'center',
        padding: '30px'
    },
    stepNumber: {
        width: '50px',
        height: '50px',
        backgroundColor: '#FF7E5F',
        color: 'white',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        margin: '0 auto 15px'
    },
    stepTitle: {
        fontSize: '1.2rem',
        color: '#2C3E50',
        marginBottom: '10px'
    },
    stepDesc: {
        color: '#666'
    },
    recommendedGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        transition: 'transform 0.3s',
        ':hover': {
            transform: 'translateY(-5px)'
        }
    },
    cardImage: {
        width: '100%',
        height: '180px',
        objectFit: 'cover'
    },
    cardContent: {
        padding: '20px'
    },
    cardHeader: {
        marginBottom: '10px'
    },
    available: {
        color: 'white',
        padding: '3px 10px',
        borderRadius: '3px',
        fontSize: '0.8rem',
        display: 'inline-block'
    },
    cardTitle: {
        fontSize: '1.2rem',
        color: '#2C3E50',
        marginBottom: '5px'
    },
    rating: {
        color: '#FFC107',
        marginBottom: '10px'
    },
    cardAddress: {
        color: '#666',
        marginBottom: '10px',
        fontSize: '0.9rem'
    },
    cardFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '15px'
    },
    price: {
        color: '#FF7E5F',
        fontWeight: 'bold',
        fontSize: '1.1rem'
    },
    viewButton: {
        backgroundColor: 'transparent',
        color: '#FF7E5F',
        border: '1px solid #FF7E5F',
        padding: '8px 15px',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'all 0.3s',
        ':hover': {
            backgroundColor: '#FF7E5F',
            color: 'white'
        }
    }
};

export default Inicio;