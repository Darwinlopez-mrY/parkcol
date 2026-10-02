const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');

// Registro
router.post('/registro', async (req, res) => {
    try {
        const { nombre, email, password, telefono } = req.body;
        
        // Validar datos
        if (!nombre || !email || !password || !telefono) {
            return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
        }
        
        // Verificar si existe
        const existeUsuario = await Usuario.findOne({ email });
        if (existeUsuario) {
            return res.status(400).json({ mensaje: 'El email ya está registrado' });
        }
        
        // Crear usuario
        const usuario = new Usuario({ nombre, email, password, telefono });
        await usuario.save();
        
        // Token
        const token = jwt.sign(
            { id: usuario._id, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.status(201).json({
            mensaje: 'Usuario creado',
            token,
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ mensaje: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ mensaje: 'Email y contraseña requeridos' });
        }
        
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(401).json({ mensaje: 'Credenciales inválidas' });
        }
        
        const passwordValida = await usuario.compararPassword(password);
        if (!passwordValida) {
            return res.status(401).json({ mensaje: 'Credenciales inválidas' });
        }

        // ========================================
        // VERIFICAR SI ESTÁ BANEADO (antes de dar token)
        // ========================================
        if (usuario.estaBaneado()) {
            return res.status(403).json({ 
                mensaje: 'Tu cuenta ha sido suspendida.',
                banReason: usuario.bannedReason || 'No especificado',
                bannedUntil: usuario.bannedUntil, // null = permanente
                esPermanente: !usuario.bannedUntil
            });
        }
        
        const token = jwt.sign(
            { id: usuario._id, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            mensaje: 'Login exitoso',
            token,
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ mensaje: error.message });
    }
});
module.exports = router;