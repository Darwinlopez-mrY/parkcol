const mongoose = require('mongoose');
const Parqueadero = require('./models/Parqueadero');
require('dotenv').config();

// Lista de ciudades colombianas con sus coordenadas
const ciudades = [
    { nombre: 'Bogotá', centro: [4.60971, -74.08175], parqueaderos: 15 },
    { nombre: 'Medellín', centro: [6.2442, -75.5812], parqueaderos: 12 },
    { nombre: 'Cali', centro: [3.4516, -76.5320], parqueaderos: 10 },
    { nombre: 'Barranquilla', centro: [10.9685, -74.7813], parqueaderos: 8 },
    { nombre: 'Cartagena', centro: [10.3910, -75.4794], parqueaderos: 8 },
    { nombre: 'Bucaramanga', centro: [7.1193, -73.1227], parqueaderos: 6 },
    { nombre: 'Pereira', centro: [4.8087, -75.6906], parqueaderos: 5 },
    { nombre: 'Manizales', centro: [5.0703, -75.5138], parqueaderos: 5 },
    { nombre: 'Cúcuta', centro: [7.8939, -72.5078], parqueaderos: 4 },
    { nombre: 'Santa Marta', centro: [11.2404, -74.1990], parqueaderos: 4 },
    { nombre: 'Ibagué', centro: [4.4447, -75.2429], parqueaderos: 3 },
    { nombre: 'Villavicencio', centro: [4.1420, -73.6266], parqueaderos: 3 },
    { nombre: 'Pasto', centro: [1.2136, -77.2811], parqueaderos: 3 },
    { nombre: 'Montería', centro: [8.7479, -75.8814], parqueaderos: 2 },
    { nombre: 'Neiva', centro: [2.9273, -75.2819], parqueaderos: 2 }
];

// Nombres de parqueaderos para variar
const prefijos = [
    'Parqueadero', 'Estacionamiento', 'Parking', 'Garaje', 'Zona de parqueo',
    'Parqueadero Central', 'Estacionamiento El', 'Parking Don', 'Garaje San',
    'Parqueadero La', 'Estacionamiento Los', 'Parking El', 'Garaje La'
];

const nombres = [
    'Centro', 'Norte', 'Sur', 'Oriente', 'Occidente', 'Plaza', 'Catedral',
    'Principal', 'San José', 'La 70', 'El Poblado', 'Chapinero', 'Usaquén',
    'Belen', 'Laureles', 'Envigado', 'Sabaneta', 'Itagüí', 'Bosa', 'Kennedy',
    'Suba', 'Engativá', 'Fontibón', 'Teusaquillo', 'Los Rosales', 'El Cable',
    'La 33', 'El Parque', 'La Sexta', 'El Jardín', 'San Fernando', 'Santa Mónica'
];

const calles = [
    'Calle', 'Carrera', 'Avenida', 'Diagonal', 'Transversal', 'Circular'
];

const serviciosDisponibles = [
    'Techado', 'Vigilancia 24h', 'Cámaras CCTV', 'Lavado', 'Baño',
    'Aire para llantas', 'WiFi', 'Cafetería', 'Lavandería', 'Taller',
    'Parqueadero para bicicletas', 'Cargador eléctrico', 'Valet parking',
    'Seguro contra daños', 'Zona infantil', 'Abierto 24h', 'Reserva online'
];

// Función para generar un número aleatorio entre min y max
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Función para generar un precio aleatorio
const generarPrecio = () => {
    const opciones = [2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000];
    return opciones[Math.floor(Math.random() * opciones.length)];
};

// Función para generar una calificación aleatoria (entre 3.5 y 5.0)
const generarRating = () => {
    return parseFloat((Math.random() * 1.5 + 3.5).toFixed(1));
};

// Función para generar reseñas aleatorias
const generarReseñas = () => {
    return random(10, 200);
};

// Función para generar disponibilidad
const generarDisponibilidad = () => {
    const disponible = Math.random() > 0.2; // 80% disponible
    const espacios = disponible ? random(5, 50) : 0;
    return { disponible, espacios };
};

// Función para generar servicios aleatorios
const generarServicios = () => {
    const numServicios = random(3, 8);
    const servicios = [];
    const copiaServicios = [...serviciosDisponibles];
    
    for (let i = 0; i < numServicios; i++) {
        const index = Math.floor(Math.random() * copiaServicios.length);
        servicios.push(copiaServicios.splice(index, 1)[0]);
    }
    
    return servicios;
};

// Función para generar un teléfono
const generarTelefono = () => {
    return `3${random(10, 99)}${random(100, 999)}${random(1000, 9999)}`;
};

// Función para generar un nombre de parqueadero
const generarNombre = (ciudad) => {
    const prefijo = prefijos[Math.floor(Math.random() * prefijos.length)];
    const nombre = nombres[Math.floor(Math.random() * nombres.length)];
    return `${prefijo} ${nombre}`;
};

// Función para generar una dirección
const generarDireccion = (ciudad) => {
    const calle = calles[Math.floor(Math.random() * calles.length)];
    const numero = random(1, 100);
    const letra = random(1, 50);
    return `${calle} ${numero} #${letra} - ${random(1, 50)}`;
};

// Función para generar coordenadas alrededor del centro de la ciudad
const generarCoordenadas = (centro, radio = 0.05) => {
    const lat = centro[0] + (Math.random() - 0.5) * radio;
    const lng = centro[1] + (Math.random() - 0.5) * radio;
    return { lat, lng };
};

// Generar todos los parqueaderos
const generarParqueaderos = () => {
    const parqueaderos = [];

    ciudades.forEach(ciudad => {
        for (let i = 0; i < ciudad.parqueaderos; i++) {
            const { lat, lng } = generarCoordenadas(ciudad.centro);
            const { disponible, espacios } = generarDisponibilidad();
            
            parqueaderos.push({
                nombre: generarNombre(ciudad.nombre),
                direccion: generarDireccion(ciudad.nombre),
                ciudad: ciudad.nombre,
                precio: generarPrecio(),
                rating: generarRating(),
                reseñas: generarReseñas(),
                disponible: disponible,
                espacios: espacios,
                lat: lat,
                lng: lng,
                telefono: generarTelefono(),
                horario: Math.random() > 0.3 ? '24/7' : '6am - 10pm',
                servicios: generarServicios()
            });
        }
    });

    return parqueaderos;
};

const parqueaderosEjemplo = generarParqueaderos();

const poblarBD = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        // Limpiar colección existente
        await Parqueadero.deleteMany({});
        console.log('🗑️ Colección limpiada');

        // Insertar nuevos parqueaderos
        await Parqueadero.insertMany(parqueaderosEjemplo);
        console.log(`✅ ${parqueaderosEjemplo.length} parqueaderos insertados en ${ciudades.length} ciudades`);

        // Mostrar resumen por ciudad
        console.log('\n📊 RESUMEN POR CIUDAD:');
        ciudades.forEach(c => {
            const count = parqueaderosEjemplo.filter(p => p.ciudad === c.nombre).length;
            console.log(`   ${c.nombre}: ${count} parqueaderos`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

poblarBD();