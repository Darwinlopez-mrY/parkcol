const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// ========================================
// MIDDLEWARE: verificarToken + esAdmin
// ========================================
// Verifica que:
// 1. El token JWT sea válido
// 2. El usuario exista en la BD
// 3. El usuario NO esté baneado
// 4. El usuario tenga rol 'admin'
// ========================================

const verificarAdmin = async (req, res, next) => {
    try {
        // 1. Obtener token del header
        const authHeader = req.header('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                mensaje: 'Acceso denegado. Token no proporcionado.' 
            });
        }

        const token = authHeader.replace('Bearer ', '');

        // 2. Verificar token JWT
        let verificado;
        try {
            verificado = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ 
                mensaje: 'Token inválido o expirado.' 
            });
        }

        // 3. Buscar usuario en la BD
        const usuario = await Usuario.findById(verificado.id);
        
        if (!usuario) {
            return res.status(401).json({ 
                mensaje: 'Usuario no encontrado.' 
            });
        }

        // 4. Verificar que NO esté baneado
        if (usuario.estaBaneado()) {
            return res.status(403).json({ 
                mensaje: 'Tu cuenta está suspendida.',
                banReason: usuario.bannedReason,
                bannedUntil: usuario.bannedUntil
            });
        }

        // 5. Verificar que sea admin
        if (usuario.rol !== 'admin') {
            return res.status(403).json({ 
                mensaje: 'Acceso denegado. Se requiere rol de administrador.' 
            });
        }

        // 6. Todo OK → adjuntar usuario al request
        req.usuario = usuario;
        next();

    } catch (error) {
        console.error('Error en verificarAdmin:', error);
        return res.status(500).json({ 
            mensaje: 'Error interno del servidor.' 
        });
    }
};

module.exports = { verificarAdmin };