const express = require('express');
const router = express.Router();
const Parqueadero = require('../models/Parqueadero');
const Usuario = require('../models/Usuario');
const { verificarToken, esPropietario } = require('../middleware/auth');

// ============================================
// RUTAS PROTEGIDAS (SOLO PROPIETARIOS)
// ============================================

// 1. Obtener todos los parqueaderos del propietario
router.get('/mis-parqueaderos', verificarToken, esPropietario, async (req, res) => {
    try {
        const parqueaderos = await Parqueadero.find({ propietario_id: req.usuario.id });
        res.json(parqueaderos);
    } catch (error) {
        console.error('Error al obtener parqueaderos:', error);
        res.status(500).json({ mensaje: 'Error al obtener parqueaderos' });
    }
});

// 2. Crear un nuevo parqueadero
router.post('/parqueaderos', verificarToken, esPropietario, async (req, res) => {
    try {
        // Crear el parqueadero con el ID del propietario
        const nuevoParqueadero = new Parqueadero({
            ...req.body,
            propietario_id: req.usuario.id,
            rating: 0,
            reseñas: 0
        });
        
        await nuevoParqueadero.save();
        
        // Agregar el ID a la lista del propietario
        await Usuario.findByIdAndUpdate(req.usuario.id, {
            $push: { misParqueaderos: nuevoParqueadero._id }
        });
        
        res.status(201).json(nuevoParqueadero);
    } catch (error) {
        console.error('Error al crear parqueadero:', error);
        res.status(500).json({ mensaje: 'Error al crear parqueadero' });
    }
});

// 3. Actualizar un parqueadero existente
router.put('/parqueaderos/:id', verificarToken, esPropietario, async (req, res) => {
    try {
        const parqueadero = await Parqueadero.findOneAndUpdate(
            { _id: req.params.id, propietario_id: req.usuario.id },
            req.body,
            { new: true }
        );
        
        if (!parqueadero) {
            return res.status(404).json({ mensaje: 'Parqueadero no encontrado' });
        }
        
        res.json(parqueadero);
    } catch (error) {
        console.error('Error al actualizar:', error);
        res.status(500).json({ mensaje: 'Error al actualizar parqueadero' });
    }
});

// 4. Eliminar un parqueadero
router.delete('/parqueaderos/:id', verificarToken, esPropietario, async (req, res) => {
    try {
        const parqueadero = await Parqueadero.findOneAndDelete({
            _id: req.params.id,
            propietario_id: req.usuario.id
        });
        
        if (!parqueadero) {
            return res.status(404).json({ mensaje: 'Parqueadero no encontrado' });
        }
        
        // Eliminar de la lista del propietario
        await Usuario.findByIdAndUpdate(req.usuario.id, {
            $pull: { misParqueaderos: req.params.id }
        });
        
        res.json({ mensaje: 'Parqueadero eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar:', error);
        res.status(500).json({ mensaje: 'Error al eliminar parqueadero' });
    }
});

// 5. Obtener estadísticas del propietario
router.get('/estadisticas', verificarToken, esPropietario, async (req, res) => {
    try {
        const parqueaderos = await Parqueadero.find({ propietario_id: req.usuario.id });
        
        const stats = {
            total: parqueaderos.length,
            visitas: parqueaderos.reduce((acc, p) => acc + (p.visitas || 0), 0),
            calificacionPromedio: parqueaderos.length > 0 
                ? (parqueaderos.reduce((acc, p) => acc + (p.rating || 0), 0) / parqueaderos.length).toFixed(1)
                : 0,
            espaciosDisponibles: parqueaderos.reduce((acc, p) => acc + (p.espacios || 0), 0)
        };
        
        res.json(stats);
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ mensaje: 'Error al obtener estadísticas' });
    }
});

module.exports = router;