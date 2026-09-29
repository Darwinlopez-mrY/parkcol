const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { initSocket } = require('./socket');
require('dotenv').config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

// Inicializar Socket.io
const io = initSocket(server);

// ========================================
// MIDDLEWARES
// ========================================
app.use(helmet());

// ========================================
// CONFIGURACIÓN DE CORS
// ========================================
// Acepta peticiones desde:
// - localhost (desarrollo): cualquier puerto
// - Vercel (producción): cualquier subdominio
// - Render (producción): cualquier subdominio
// - Dominios custom en CORS_ORIGINS (env var, separados por coma)
// ========================================

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    // Patrones regex para producción
    /^https:\/\/.*\.vercel\.app$/,
    /^https:\/\/.*\.onrender\.com$/,
    // Dominios custom (agrega los tuyos aquí)
    // 'https://parkcol.com',
    // 'https://www.parkcol.com',
];

// Si existe variable de entorno CORS_ORIGINS, agregar esos dominios
if (process.env.CORS_ORIGINS) {
    const extras = process.env.CORS_ORIGINS.split(',').map(s => s.trim());
    allowedOrigins.push(...extras);
}

const corsOptions = {
    origin: function (origin, callback) {
        // Permitir peticiones sin origin (Postman, curl, apps móviles)
        if (!origin) return callback(null, true);

        // Verificar si el origin está permitido
        const permitido = allowedOrigins.some(allowed => {
            if (typeof allowed === 'string') {
                return allowed === origin;
            }
            if (allowed instanceof RegExp) {
                return allowed.test(origin);
            }
            return false;
        });

        if (permitido) {
            callback(null, true);
        } else {
            console.warn(`🚫 CORS bloqueado para: ${origin}`);
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400 // 24 horas de cache de preflight
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// ========================================
// RATE LIMITING
// ========================================
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 peticiones por IP por ventana
    message: '⚠️ Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos.'
});
app.use('/api', limiter);

// ========================================
// CONEXIÓN A MONGODB
// ========================================
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Conectado a MongoDB'))
    .catch(err => console.error('❌ Error MongoDB:', err));

// ========================================
// RUTAS
// ========================================
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/parqueaderos', require('./routes/parqueaderos'));
app.use('/api/propietario', require('./routes/propietario'));
app.use('/api/upload', require('./routes/upload'));

// Ruta raíz para health check
app.get('/', (req, res) => {
    res.json({
        mensaje: '🚗 API de ParkCol funcionando',
        status: 'OK',
        timestamp: new Date().toISOString(),
        entorno: process.env.NODE_ENV || 'development'
    });
});

// Health check para Render
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        uptime: process.uptime()
    });
});

// ========================================
// MANEJO DE ERRORES GLOBAL
// ========================================
app.use((err, req, res, next) => {
    console.error('❌ Error global:', err);
    
    // Error específico de CORS
    if (err.message === 'No permitido por CORS') {
        return res.status(403).json({
            mensaje: 'Acceso bloqueado por CORS. Origen no permitido.',
            origen: req.headers.origin
        });
    }
    
    res.status(500).json({
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ========================================
// INICIAR SERVIDOR
// ========================================
server.listen(PORT, () => {
    console.log('========================================');
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`✅ API:       http://localhost:${PORT}`);
    console.log(`✅ WebSocket: ws://localhost:${PORT}`);
    console.log(`🌍 Entorno:   ${process.env.NODE_ENV || 'development'}`);
    console.log('========================================');
});

// ========================================
// MANEJO DE ERRORES NO CAPTURADOS
// ========================================
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
});