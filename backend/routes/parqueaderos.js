const express = require('express');
const router = express.Router();
const Parqueadero = require('../models/Parqueadero');
const Usuario = require('../models/Usuario');

// ========================================
// HELPER: Obtener IDs de usuarios baneados
// ========================================
// Devuelve un array con los _id de usuarios baneados
// (considerando si el ban expiró o no)
// ========================================
const obtenerIdsUsuariosBaneados = async () => {
    try {
        const ahora = new Date();
        
        // Usuarios baneados que:
        // 1. banned = true
        // 2. Y (bannedUntil es null → ban permanente) O (bannedUntil > ahora → ban vigente)
        const usuariosBaneados = await Usuario.find({
            banned: true,
            $or: [
                { bannedUntil: null },
                { bannedUntil: { $gt: ahora } }
            ]
        }).select('_id');
        
        return usuariosBaneados.map(u => u._id);
    } catch (error) {
        console.error('Error al obtener usuarios baneados:', error);
        return [];
    }
};

// ========================================
// GET todos los parqueaderos con filtros
// ========================================
router.get('/', async (req, res) => {
    try {
        const { ciudad, q, disponible } = req.query;
        let filtro = {};

        // 🚫 Excluir parqueaderos de usuarios baneados
        const idsBaneados = await obtenerIdsUsuariosBaneados();
        if (idsBaneados.length > 0) {
            filtro.propietario_id = { $nin: idsBaneados };
        }

        if (ciudad) {
            filtro.ciudad = { $regex: ciudad, $options: 'i' };
        }

        if (q) {
            filtro.$or = [
                { nombre: { $regex: q, $options: 'i' } },
                { direccion: { $regex: q, $options: 'i' } }
            ];
        }

        if (disponible === 'true') {
            filtro.disponible = true;
        }

        const parqueaderos = await Parqueadero.find(filtro);
        res.json(parqueaderos);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ mensaje: 'Error al obtener parqueaderos' });
    }
});

// ========================================
// GET cerca de mi ubicación
// ========================================
router.get('/cerca', async (req, res) => {
    try {
        const { lat, lng, radio = 2000 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ mensaje: 'Latitud y longitud requeridas' });
        }

        // 🚫 Excluir parqueaderos de usuarios baneados
        const idsBaneados = await obtenerIdsUsuariosBaneados();
        const filtro = { disponible: true };
        if (idsBaneados.length > 0) {
            filtro.propietario_id = { $nin: idsBaneados };
        }

        const parqueaderos = await Parqueadero.find(filtro);

        const resultados = parqueaderos.map(p => {
            const distancia = Math.sqrt(
                Math.pow(p.lat - parseFloat(lat), 2) +
                Math.pow(p.lng - parseFloat(lng), 2)
            ) * 111000;

            return {
                ...p.toObject(),
                distancia: Math.round(distancia) + 'm'
            };
        }).filter(p => parseInt(p.distancia) <= radio)
          .sort((a, b) => parseInt(a.distancia) - parseInt(b.distancia));

        res.json(resultados);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ mensaje: 'Error al buscar parqueaderos cercanos' });
    }
});

// ========================================
// GET parqueadero por ID
// ========================================
router.get('/:id', async (req, res) => {
    try {
        const parqueadero = await Parqueadero.findById(req.params.id);

        if (!parqueadero) {
            return res.status(404).json({ mensaje: 'Parqueadero no encontrado' });
        }

        // 🚫 Verificar si el propietario está baneado
        if (parqueadero.propietario_id) {
            const propietario = await Usuario.findById(parqueadero.propietario_id);
            if (propietario && propietario.estaBaneado()) {
                return res.status(404).json({ 
                    mensaje: 'Este parqueadero no está disponible temporalmente' 
                });
            }
        }

        res.json(parqueadero);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ mensaje: 'Error al obtener parqueadero' });
    }
});

// ========================================
// POST crear nuevo parqueadero
// ========================================
router.post('/', async (req, res) => {
    try {
        const nuevoParqueadero = new Parqueadero(req.body);
        await nuevoParqueadero.save();
        res.status(201).json(nuevoParqueadero);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ mensaje: 'Error al crear parqueadero' });
    }
});

// ========================================
// PUT actualizar parqueadero
// ========================================
router.put('/:id', async (req, res) => {
    try {
        const parqueadero = await Parqueadero.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(parqueadero);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ mensaje: 'Error al actualizar parqueadero' });
    }
});

// ========================================
// DELETE eliminar parqueadero (solo admin)
// ========================================
router.delete('/:id', async (req, res) => {
    try {
        await Parqueadero.findByIdAndDelete(req.params.id);
        res.json({ mensaje: 'Parqueadero eliminado' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ mensaje: 'Error al eliminar parqueadero' });
    }
});

module.exports = router;