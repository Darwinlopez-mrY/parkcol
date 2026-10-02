const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UsuarioSchema = new mongoose.Schema({
    nombre: { 
        type: String, 
        required: true,
        trim: true
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true
    },
    password: { 
        type: String, 
        required: true 
    },
    telefono: { 
        type: String, 
        required: true 
    },
    rol: { 
        type: String, 
        enum: ['cliente', 'propietario', 'admin'], 
        default: 'cliente' 
    },
    fecha_registro: { 
        type: Date, 
        default: Date.now 
    },
    misParqueaderos: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Parqueadero' 
    }],

    // ========================================
    // SISTEMA DE BAN (Opción C: temporal + permanente)
    // ========================================
    banned: {
        type: Boolean,
        default: false
    },
    bannedUntil: {
        type: Date,
        default: null  // null = permanente si banned=true
    },
    bannedReason: {
        type: String,
        default: null,
        maxlength: [500, 'La razón no puede exceder 500 caracteres']
    },
    bannedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        default: null
    },
    bannedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// ========================================
// Middleware: Encriptar contraseña antes de guardar
// ========================================
UsuarioSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// ========================================
// Método: Comparar contraseña
// ========================================
UsuarioSchema.methods.compararPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// ========================================
// Método: Verificar si el ban está activo
// ========================================
UsuarioSchema.methods.estaBaneado = function() {
    if (!this.banned) return false;
    
    // Si tiene fecha de expiración y ya pasó → ya no está baneado
    if (this.bannedUntil && this.bannedUntil < new Date()) {
        return false; // Ban expirado
    }
    
    return true; // Ban activo (temporal vigente o permanente)
};

// ========================================
// Método: Ocultar datos sensibles al serializar
// ========================================
UsuarioSchema.methods.toJSON = function() {
    const usuario = this.toObject();
    delete usuario.password;  // 🔒 NUNCA exponer el hash de contraseña
    return usuario;
};

module.exports = mongoose.model('Usuario', UsuarioSchema);