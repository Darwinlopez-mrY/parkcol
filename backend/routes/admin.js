const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const Parqueadero = require('../models/Parqueadero');
const { verificarAdmin } = require('../middleware/admin');

// ========================================
// TODAS las rutas requieren admin
// ========================================
router.use(verificarAdmin);

// ========================================
// GET /api/admin/estadisticas
// Estadísticas globales del sistema
// ========================================
router.get('/estadisticas', async (req, res) => {
    try {
        const ahora = new Date();

        // Total usuarios por rol
        const [
            totalUsuarios,
            totalClientes,
            totalPropietarios,
            totalAdmins,
            totalBaneados,
            totalParqueaderos,
            parqueaderosDisponibles
        ] = await Promise.all([
            Usuario.countDocuments(),
            Usuario.countDocuments({ rol: 'cliente' }),
            Usuario.countDocuments({ rol: 'propietario' }),
            Usuario.countDocuments({ rol: 'admin' }),
            Usuario.countDocuments({
                banned: true,
                $or: [
                    { bannedUntil: null },
                    { bannedUntil: { $gt: ahora } }
                ]
            }),
            Parqueadero.countDocuments(),
            Parqueadero.countDocuments({ disponible: true })
        ]);

        // Top 5 ciudades con más parqueaderos
        const topCiudades = await Parqueadero.aggregate([
            { $group: { _id: '$ciudad', total: { $sum: 1 } } },
            { $sort: { total: -1 } },
            { $limit: 5 }
        ]);

        // Promedio de precio y rating
        const promedios = await Parqueadero.aggregate([
            {
                $group: {
                    _id: null,
                    precioPromedio: { $avg: '$precio' },
                    ratingPromedio: { $avg: '$rating' }
                }
            }
        ]);

        res.json({
            usuarios: {
                total: totalUsuarios,
                clientes: totalClientes,
                propietarios: totalPropietarios,
                admins: totalAdmins,
                baneados: totalBaneados
            },
            parqueaderos: {
                total: totalParqueaderos,
                disponibles: parqueaderosDisponibles,
                noDisponibles: totalParqueaderos - parqueaderosDisponibles
            },
            topCiudades,
            promedios: promedios[0] || {
                precioPromedio: 0,
                ratingPromedio: 0
            }
        });
    } catch (error) {
        console.error('Error en estadísticas:', error);
        res.status(500).json({ mensaje: 'Error al obtener estadísticas' });
    }
});

// ========================================
// GET /api/admin/usuarios
// Lista usuarios con filtros y búsqueda
// Query params:
//   - rol: cliente | propietario | admin
//   - estado: activo | baneado
//   - q: búsqueda por nombre/email
//   - page: número de página (default 1)
//   - limit: resultados por página (default 20)
// ========================================
router.get('/usuarios', async (req, res) => {
    try {
        const { rol, estado, q, page = 1, limit = 20 } = req.query;
        const ahora = new Date();

        let filtro = {};

        if (rol && ['cliente', 'propietario', 'admin'].includes(rol)) {
            filtro.rol = rol;
        }

        if (estado === 'baneado') {
            filtro.banned = true;
            filtro.$or = [
                { bannedUntil: null },
                { bannedUntil: { $gt: ahora } }
            ];
        } else if (estado === 'activo') {
            filtro.$or = [
                { banned: false },
                { bannedUntil: { $lt: ahora } }
            ];
        }

        if (q) {
            const regex = { $regex: q, $options: 'i' };
            filtro.$and = [
                ...(filtro.$and || []),
                {
                    $or: [
                        { nombre: regex },
                        { email: regex },
                        { telefono: regex }
                    ]
                }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [usuarios, total] = await Promise.all([
            Usuario.find(filtro)
                .select('-password')  // 🔒 Nunca devolver password
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Usuario.countDocuments(filtro)
        ]);

        // Marcar cada usuario si su ban está vigente
        const usuariosConEstado = usuarios.map(u => ({
            ...u,
            estaBaneadoActual: u.banned && (
                !u.bannedUntil || new Date(u.bannedUntil) > ahora
            )
        }));

        res.json({
            usuarios: usuariosConEstado,
            paginacion: {
                total,
                pagina: parseInt(page),
                porPagina: parseInt(limit),
                totalPaginas: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error listando usuarios:', error);
        res.status(500).json({ mensaje: 'Error al listar usuarios' });
    }
});

// ========================================
// GET /api/admin/usuarios/:id
// Detalle de un usuario
// ========================================
router.get('/usuarios/:id', async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id)
            .select('-password')
            .lean();

        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        // Si es propietario, incluir sus parqueaderos
        let parqueaderos = [];
        if (usuario.rol === 'propietario') {
            parqueaderos = await Parqueadero.find({ propietario_id: usuario._id })
                .select('nombre ciudad precio rating espacios disponible');
        }

        res.json({
            usuario: {
                ...usuario,
                estaBaneadoActual: usuario.banned && (
                    !usuario.bannedUntil || new Date(usuario.bannedUntil) > new Date()
                )
            },
            parqueaderos
        });
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        res.status(500).json({ mensaje: 'Error al obtener usuario' });
    }
});

// ========================================
// PUT /api/admin/usuarios/:id/rol
// Cambiar rol de un usuario
// Body: { rol: 'cliente' | 'propietario' | 'admin' }
// ========================================
router.put('/usuarios/:id/rol', async (req, res) => {
    try {
        const { rol } = req.body;

        if (!rol || !['cliente', 'propietario', 'admin'].includes(rol)) {
            return res.status(400).json({ 
                mensaje: 'Rol inválido. Debe ser: cliente, propietario o admin' 
            });
        }

        // No puede cambiarse el rol a sí mismo
        if (req.params.id === req.usuario._id.toString()) {
            return res.status(400).json({ 
                mensaje: 'No puedes cambiar tu propio rol' 
            });
        }

        const usuario = await Usuario.findByIdAndUpdate(
            req.params.id,
            { rol },
            { new: true }
        ).select('-password');

        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        res.json({
            mensaje: `Rol cambiado a "${rol}" exitosamente`,
            usuario
        });
    } catch (error) {
        console.error('Error cambiando rol:', error);
        res.status(500).json({ mensaje: 'Error al cambiar rol' });
    }
});

// ========================================
// POST /api/admin/usuarios/:id/ban
// Banear un usuario
// Body: { reason: string, durationDays: number | null }
//   - durationDays: null o 0 = ban permanente
//   - durationDays > 0 = ban temporal
// ========================================
router.post('/usuarios/:id/ban', async (req, res) => {
    try {
        const { reason, durationDays } = req.body;

        if (!reason || reason.trim().length < 5) {
            return res.status(400).json({ 
                mensaje: 'Debes especificar una razón (mínimo 5 caracteres)' 
            });
        }

        // No puede banearse a sí mismo
        if (req.params.id === req.usuario._id.toString()) {
            return res.status(400).json({ 
                mensaje: 'No puedes banearte a ti mismo' 
            });
        }

        const usuario = await Usuario.findById(req.params.id);

        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        // No se puede banear a otro admin
        if (usuario.rol === 'admin') {
            return res.status(400).json({ 
                mensaje: 'No puedes banear a otro administrador' 
            });
        }

        // Calcular fecha de expiración
        let bannedUntil = null;
        if (durationDays && parseInt(durationDays) > 0) {
            bannedUntil = new Date();
            bannedUntil.setDate(bannedUntil.getDate() + parseInt(durationDays));
        }

        usuario.banned = true;
        usuario.bannedReason = reason.trim();
        usuario.bannedUntil = bannedUntil;
        usuario.bannedBy = req.usuario._id;
        usuario.bannedAt = new Date();

        await usuario.save();

        res.json({
            mensaje: bannedUntil 
                ? `Usuario baneado hasta ${bannedUntil.toLocaleDateString('es-CO')}`
                : 'Usuario baneado permanentemente',
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email,
                banned: usuario.banned,
                bannedUntil: usuario.bannedUntil,
                bannedReason: usuario.bannedReason
            }
        });
    } catch (error) {
        console.error('Error baneando usuario:', error);
        res.status(500).json({ mensaje: 'Error al banear usuario' });
    }
});

// ========================================
// POST /api/admin/usuarios/:id/unban
// Desbanear un usuario
// ========================================
router.post('/usuarios/:id/unban', async (req, res) => {
    try {
        const usuario = await Usuario.findByIdAndUpdate(
            req.params.id,
            {
                banned: false,
                bannedUntil: null,
                bannedReason: null,
                bannedBy: null,
                bannedAt: null
            },
            { new: true }
        ).select('-password');

        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        res.json({
            mensaje: 'Usuario desbaneado exitosamente',
            usuario
        });
    } catch (error) {
        console.error('Error desbaneando:', error);
        res.status(500).json({ mensaje: 'Error al desbanear usuario' });
    }
});

// ========================================
// DELETE /api/admin/usuarios/:id
// Eliminar un usuario
// ========================================
router.delete('/usuarios/:id', async (req, res) => {
    try {
        // No puede eliminarse a sí mismo
        if (req.params.id === req.usuario._id.toString()) {
            return res.status(400).json({ 
                mensaje: 'No puedes eliminarte a ti mismo' 
            });
        }

        const usuario = await Usuario.findById(req.params.id);

        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        // No se puede eliminar a otro admin
        if (usuario.rol === 'admin') {
            return res.status(400).json({ 
                mensaje: 'No puedes eliminar a otro administrador' 
            });
        }

        // Si es propietario, eliminar también sus parqueaderos
        if (usuario.rol === 'propietario') {
            await Parqueadero.deleteMany({ propietario_id: usuario._id });
        }

        await Usuario.findByIdAndDelete(req.params.id);

        res.json({ 
            mensaje: 'Usuario eliminado exitosamente',
            parqueaderosEliminados: usuario.rol === 'propietario' 
        });
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        res.status(500).json({ mensaje: 'Error al eliminar usuario' });
    }
});

// ========================================
// GET /api/admin/parqueaderos
// Lista parqueaderos con filtros
// ========================================
router.get('/parqueaderos', async (req, res) => {
    try {
        const { ciudad, q, page = 1, limit = 20 } = req.query;

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

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [parqueaderos, total] = await Promise.all([
            Parqueadero.find(filtro)
                .populate('propietario_id', 'nombre email telefono rol banned')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Parqueadero.countDocuments(filtro)
        ]);

        res.json({
            parqueaderos,
            paginacion: {
                total,
                pagina: parseInt(page),
                porPagina: parseInt(limit),
                totalPaginas: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error listando parqueaderos:', error);
        res.status(500).json({ mensaje: 'Error al listar parqueaderos' });
    }
});

// ========================================
// GET /api/admin/parqueaderos/:id
// Obtener un parqueadero específico con info del propietario
// ========================================
router.get('/parqueaderos/:id', async (req, res) => {
    try {
        const parqueadero = await Parqueadero.findById(req.params.id)
            .populate('propietario_id', 'nombre email telefono banned');

        if (!parqueadero) {
            return res.status(404).json({ mensaje: 'Parqueadero no encontrado' });
        }

        res.json(parqueadero);
    } catch (error) {
        console.error('Error obteniendo parqueadero:', error);
        res.status(500).json({ mensaje: 'Error al obtener parqueadero' });
    }
});

// ========================================
// DELETE /api/admin/parqueaderos/:id
// Eliminar un parqueadero
// ========================================
router.delete('/parqueaderos/:id', async (req, res) => {
    try {
        const parqueadero = await Parqueadero.findByIdAndDelete(req.params.id);

        if (!parqueadero) {
            return res.status(404).json({ mensaje: 'Parqueadero no encontrado' });
        }

        res.json({ mensaje: 'Parqueadero eliminado exitosamente' });
    } catch (error) {
        console.error('Error eliminando parqueadero:', error);
        res.status(500).json({ mensaje: 'Error al eliminar parqueadero' });
    }
});

// ========================================
// POST /api/admin/parqueaderos/:id/fotos
// Subir foto a un parqueadero (como admin)
// ========================================
router.post('/parqueaderos/:id/fotos',
    (req, res, next) => {
        // Importar multer dinámicamente para este endpoint
        const { upload } = require('../config/cloudinary');
        upload.single('foto')(req, res, (err) => {
            if (err) {
                console.error('Error multer:', err);
                return res.status(400).json({ 
                    mensaje: 'Error al procesar la imagen: ' + err.message 
                });
            }
            next();
        });
    },
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ mensaje: 'No se subió ninguna imagen' });
            }

            const parqueadero = await Parqueadero.findByIdAndUpdate(
                req.params.id,
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
            console.error('Error subiendo foto admin:', error);
            res.status(500).json({ mensaje: 'Error al subir foto' });
        }
    }
);

// ========================================
// DELETE /api/admin/parqueaderos/:id/fotos
// Eliminar foto de un parqueadero (como admin)
// Body: { fotoUrl: string }
// ========================================
router.delete('/parqueaderos/:id/fotos', async (req, res) => {
    try {
        const { fotoUrl } = req.body;

        if (!fotoUrl) {
            return res.status(400).json({ mensaje: 'URL de la foto requerida' });
        }

        // Extraer public_id de la URL de Cloudinary
        // Ejemplo: https://res.cloudinary.com/xxx/image/upload/v123/parkcol/abc.jpg
        // → parkcol/abc
        const urlParts = fotoUrl.split('/');
        const fileName = urlParts[urlParts.length - 1].split('.')[0];
        const publicId = `parkcol/${fileName}`;

        // Eliminar de Cloudinary
        const { cloudinary } = require('../config/cloudinary');
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (cloudErr) {
            console.warn('Error eliminando de Cloudinary:', cloudErr);
            // Continuar, igual eliminamos de MongoDB
        }

        // Eliminar del array en MongoDB
        const parqueadero = await Parqueadero.findByIdAndUpdate(
            req.params.id,
            { $pull: { fotos: fotoUrl } },
            { new: true }
        );

        if (!parqueadero) {
            return res.status(404).json({ mensaje: 'Parqueadero no encontrado' });
        }

        res.json({
            mensaje: 'Foto eliminada correctamente',
            fotos: parqueadero.fotos
        });
    } catch (error) {
        console.error('Error eliminando foto admin:', error);
        res.status(500).json({ mensaje: 'Error al eliminar foto' });
    }
});

module.exports = router;