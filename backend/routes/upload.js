const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const Parqueadero = require('../models/Parqueadero');
const Usuario = require('../models/Usuario');
const { verificarToken, esPropietario } = require('../middleware/auth');

// ========================================
// HELPER: Verificar que el usuario NO esté baneado
// ========================================
const verificarNoBaneado = async (req, res, next) => {
    try {
        const usuario = await Usuario.findById(req.usuario.id);
        
        if (!usuario) {
            return res.status(401).json({ mensaje: 'Usuario no encontrado' });
        }
        
        if (usuario.estaBaneado()) {
            return res.status(403).json({ 
                mensaje: 'Tu cuenta está suspendida. No puedes subir fotos.',
                banReason: usuario.bannedReason
            });
        }
        
        next();
    } catch (error) {
        console.error('Error verificando ban:', error);
        res.status(500).json({ mensaje: 'Error interno' });
    }
};

// ========================================
// POST Subir foto a un parqueadero
// ========================================
router.post('/parqueadero/:id',
    verificarToken,
    esPropietario,
    verificarNoBaneado,  // 👈 NUEVO: rechaza si está baneado
    upload.single('foto'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ mensaje: 'No se subió ninguna imagen' });
            }

            const parqueadero = await Parqueadero.findOneAndUpdate(
                { _id: req.params.id, propietario_id: req.usuario.id },
                { $push: { fotos: req.file.path } },
                { new: true }
            );

            if (!parqueadero) {
                return res.status(404).json({ mensaje: 'Parqueadero no encontrado' });
            }

            res.json({ 
                mensaje: 'Foto subida correctamente',
                foto: req.file.path,
                fotos: parqueadero.fotos
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ mensaje: 'Error al subir foto' });
        }
    }
);

// ========================================
// DELETE Eliminar foto
// ========================================
router.delete('/parqueadero/:id/foto',
    verificarToken,
    esPropietario,
    verificarNoBaneado,  // 👈 NUEVO: rechaza si está baneado
    async (req, res) => {
        try {
            const { fotoUrl } = req.body;
            
            // Extraer public_id de Cloudinary
            const publicId = fotoUrl.split('/').pop().split('.')[0];
            
            // Eliminar de Cloudinary
            const { cloudinary } = require('../config/cloudinary');
            await cloudinary.uploader.destroy(`parkcol/${publicId}`);

            // Eliminar del array en MongoDB
            const parqueadero = await Parqueadero.findOneAndUpdate(
                { _id: req.params.id, propietario_id: req.usuario.id },
                { $pull: { fotos: fotoUrl } },
                { new: true }
            );

            res.json({ 
                mensaje: 'Foto eliminada',
                fotos: parqueadero.fotos 
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ mensaje: 'Error al eliminar foto' });
        }
    }
);

module.exports = router;