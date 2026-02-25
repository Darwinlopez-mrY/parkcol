const mongoose = require('mongoose');

const ParqueaderoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio']
    },
    direccion: {
        type: String,
        required: [true, 'La dirección es obligatoria']
    },
    ciudad: {
        type: String,
        required: [true, 'La ciudad es obligatoria']
    },
    precio: {
        type: Number,
        required: [true, 'El precio es obligatorio']
    },
    rating: {
        type: Number,
        default: 0
    },
    reseñas: {
        type: Number,
        default: 0
    },
    disponible: {
        type: Boolean,
        default: true
    },
    espacios: {
        type: Number,
        default: 0
    },
    lat: {
        type: Number,
        required: [true, 'La latitud es obligatoria']
    },
    lng: {
        type: Number,
        required: [true, 'La longitud es obligatoria']
    },
    telefono: String,
    horario: {
        type: String,
        default: '24/7'
    },
    servicios: [String],
    fotos: [String],
    propietario_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Parqueadero', ParqueaderoSchema);