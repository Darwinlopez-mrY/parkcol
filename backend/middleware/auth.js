const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ mensaje: 'Acceso denegado. Token no proporcionado.' });
    }
    
    try {
        const verificado = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = verificado;
        next();
    } catch (error) {
        res.status(400).json({ mensaje: 'Token inválido' });
    }
};

const esPropietario = (req, res, next) => {
    if (req.usuario.rol !== 'propietario' && req.usuario.rol !== 'admin') {
        return res.status(403).json({ mensaje: 'Acceso denegado. Se requiere rol de propietario.' });
    }
    next();
};

module.exports = { verificarToken, esPropietario };