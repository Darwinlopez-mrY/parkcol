const express = require('express');
const router = express.Router();
const Parqueadero = require('../models/Parqueadero');

// GET todos los parqueaderos con filtros
router.get('/', async (req, res) => {
    try {
        const { ciudad, q, disponible } = req.query;
        let filtro = {};

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

// GET parqueadero por ID
router.get('/:id', async (req, res) => {
    try {
        const parqueadero = await Parqueadero.findById(req.params.id);
        
        if (!parqueadero) {
            return res.status(404).json({ mensaje: 'Parqueadero no encontrado' });
        }
        
        res.json(parqueadero);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ mensaje: 'Error al obtener parqueadero' });
    }
});

// GET cerca de mi ubicación
router.get('/cerca', async (req, res) => {
    try {
        const { lat, lng, radio = 2000 } = req.query; // radio en metros
        
        if (!lat || !lng) {
            return res.status(400).json({ mensaje: 'Latitud y longitud requeridas' });
        }

        // Obtener todos los parqueaderos y calcular distancia (simplificado)
        const parqueaderos = await Parqueadero.find({ disponible: true });
        
        const resultados = parqueaderos.map(p => {
            // Fórmula de distancia (simplificada)
            const distancia = Math.sqrt(
                Math.pow(p.lat - parseFloat(lat), 2) + 
                Math.pow(p.lng - parseFloat(lng), 2)
            ) * 111000; // Aproximación a metros
            
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

// POST crear nuevo parqueadero (para propietarios)
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

// PUT actualizar parqueadero
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

// DELETE eliminar parqueadero (solo admin)
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