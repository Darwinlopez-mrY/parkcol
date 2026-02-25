const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UsuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    telefono: { type: String, required: true },
    rol: { type: String, default: 'cliente' },
    fecha_registro: { type: Date, default: Date.now }
});

// Middleware para encriptar contraseña - CORREGIDO
UsuarioSchema.pre('save', function(next) {
    if (!this.isModified('password')) return next();
    
    bcrypt.genSalt(10, (err, salt) => {
        if (err) return next(err);
        
        bcrypt.hash(this.password, salt, (err, hash) => {
            if (err) return next(err);
            this.password = hash;
            next();
        });
    });
});

// Método para comparar contraseñas
UsuarioSchema.methods.compararPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('Usuario', UsuarioSchema);