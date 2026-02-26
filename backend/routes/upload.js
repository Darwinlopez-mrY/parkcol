const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const Parqueadero = require('../models/Parqueadero');
const { verificarToken, esPropietario } = require('../middleware/auth');

// Subir foto a un parqueadero
router.post('/parqueadero/:id', 
    verificarToken, 
    esPropietario, 
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

// Eliminar foto
router.delete('/parqueadero/:id/foto', 
    verificarToken, 
    esPropietario, 
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