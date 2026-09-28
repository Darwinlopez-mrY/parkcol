const mongoose = require('mongoose');
const Parqueadero = require('./models/Parqueadero');
require('dotenv').config();

const parqueaderosEjemplo = [
    {
        nombre: 'Parqueadero Centro',
        direccion: 'Cra 10 #5-20',
        ciudad: 'Bogotá',
        precio: 3000,
        rating: 4.8,
        reseñas: 85,
        disponible: true,
        espacios: 15,
        lat: 4.60971,
        lng: -74.08175,
        telefono: '3201234567',
        horario: '24/7',
        servicios: ['Techado', 'Vigilancia 24h', 'Cámaras CCTV']
    },
    {
        nombre: 'Estacionamiento Norte',
        direccion: 'Cra 7 #45-12',
        ciudad: 'Medellín',
        precio: 2500,
        rating: 4.5,
        reseñas: 42,
        disponible: true,
        espacios: 8,
        lat: 6.2442,
        lng: -75.5736,
        telefono: '3109876543',
        horario: '6am - 10pm',
        servicios: ['Vigilancia', 'Cámaras']
    },
    {
        nombre: 'Parking Granahorrar',
        direccion: 'Calle 26 #62-47',
        ciudad: 'Bogotá',
        precio: 3500,
        rating: 4.9,
        reseñas: 120,
        disponible: false,
        espacios: 0,
        lat: 4.6486,
        lng: -74.1075,
        telefono: '3155555555',
        horario: '5am - 11pm',
        servicios: ['Techado', 'Vigilancia 24h', 'Cámaras', 'Lavado']
    },
    {
        nombre: 'Parqueadero El Poblado',
        direccion: 'Cra 43 #10-20',
        ciudad: 'Medellín',
        precio: 4000,
        rating: 4.7,
        reseñas: 67,
        disponible: true,
        espacios: 22,
        lat: 6.2106,
        lng: -75.5675,
        telefono: '3045678901',
        horario: '24/7',
        servicios: ['Techado', 'Vigilancia', 'Baño', 'Aire para llantas']
    },
    {
        nombre: 'Estacionamiento Centro Histórico',
        direccion: 'Calle 34 #4-50',
        ciudad: 'Cartagena',
        precio: 5000,
        rating: 4.6,
        reseñas: 53,
        disponible: true,
        espacios: 12,
        lat: 10.4229,
        lng: -75.5456,
        telefono: '3012345678',
        horario: '8am - 8pm',
        servicios: ['Vigilancia', 'Cámaras', 'Techado']
    }
];

const poblarBD = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        // Limpiar colección existente
        await Parqueadero.deleteMany({});
        console.log('🗑️ Colección limpiada');

        // Insertar nuevos parqueaderos
        await Parqueadero.insertMany(parqueaderosEjemplo);
        console.log(`✅ ${parqueaderosEjemplo.length} parqueaderos insertados`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

poblarBD();