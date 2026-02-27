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

// Middlewares
app.use(helmet());
app.use(cors({ 
    origin: ['http://localhost:3000', 'https://parkcol.vercel.app'], 
    credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({ 
    windowMs: 15 * 60 * 1000, 
    max: 100 
});
app.use('/api', limiter);

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Conectado a MongoDB'))
    .catch(err => console.error('❌ Error:', err));

// Rutas
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/parqueaderos', require('./routes/parqueaderos'));
app.use('/api/propietario', require('./routes/propietario'));

app.get('/', (req, res) => {
    res.send('🚗 API de ParkCol funcionando');
});

// Servidor con soporte WebSocket
server.listen(PORT, () => {
    console.log(`✅ Servidor en http://localhost:${PORT}`);
    console.log(`✅ WebSocket en ws://localhost:${PORT}`);
});