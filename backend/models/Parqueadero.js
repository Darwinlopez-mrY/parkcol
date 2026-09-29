const mongoose = require('mongoose');

const ParqueaderoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true,
        minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
        maxlength: [100, 'El nombre no puede exceder 100 caracteres']
    },
    direccion: {
        type: String,
        required: [true, 'La dirección es obligatoria'],
        trim: true,
        minlength: [5, 'La dirección debe tener al menos 5 caracteres'],
        maxlength: [200, 'La dirección no puede exceder 200 caracteres']
    },
    ciudad: {
        type: String,
        required: [true, 'La ciudad es obligatoria'],
        trim: true
    },
    precio: {
        type: Number,
        required: [true, 'El precio es obligatorio'],
        min: [100, 'El precio debe ser al menos $100 por hora'],
        max: [1000000, 'El precio no puede exceder $1,000,000 por hora']
    },
    rating: {
        type: Number,
        default: 0,
        min: [0, 'El rating mínimo es 0'],
        max: [5, 'El rating máximo es 5']
    },
    reseñas: {
        type: Number,
        default: 0,
        min: [0, 'Las reseñas no pueden ser negativas']
    },
    disponible: {
        type: Boolean,
        default: true
    },
    espacios: {
        type: Number,
        default: 0,
        min: [0, 'Los espacios no pueden ser negativos'],
        max: [10000, 'Los espacios no pueden exceder 10,000']
    },
    lat: {
        type: Number,
        required: [true, 'La latitud es obligatoria'],
        min: [-90, 'La latitud debe estar entre -90 y 90'],
        max: [90, 'La latitud debe estar entre -90 y 90'],
        validate: {
            validator: function(v) {
                // Colombia está aproximadamente entre lat -5 y 15
                return v >= -5 && v <= 15;
            },
            message: 'La latitud debe estar dentro del rango de Colombia (aprox. -5 a 15)'
        }
    },
    lng: {
        type: Number,
        required: [true, 'La longitud es obligatoria'],
        min: [-180, 'La longitud debe estar entre -180 y 180'],
        max: [180, 'La longitud debe estar entre -180 y 180'],
        validate: {
            validator: function(v) {
                // Colombia está aproximadamente entre lng -85 y -65
                return v >= -85 && v <= -65;
            },
            message: 'La longitud debe estar dentro del rango de Colombia (aprox. -85 a -65)'
        }
    },
    telefono: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                if (!v) return true; // opcional
                return /^[0-9+\-\s()]{7,20}$/.test(v);
            },
            message: 'El teléfono debe tener entre 7 y 20 caracteres (solo números, +, -, espacios)'
        }
    },
    horario: {
        type: String,
        default: '24/7',
        trim: true
    },
    servicios: {
        type: [String],
        default: []
    },
    fotos: {
        type: [String],
        default: []
    },
    propietario_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    }
}, {
    timestamps: true
});

// Índice geoespacial para futuras búsquedas por cercanía
ParqueaderoSchema.index({ lat: 1, lng: 1 });

// Índice de texto para búsquedas
ParqueaderoSchema.index({ nombre: 'text', direccion: 'text', ciudad: 'text' });

module.exports = mongoose.model('Parqueadero', ParqueaderoSchema);