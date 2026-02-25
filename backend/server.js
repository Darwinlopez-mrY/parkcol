const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(helmet());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
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
    .catch(err => console.error('❌ Error:', err.message));

// Rutas
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/parqueaderos', require('./routes/parqueaderos'));

app.get('/', (req, res) => {
    res.send('🚗 API de ParkCol funcionando');
});

app.listen(PORT, () => {
    console.log(`✅ Servidor en http://localhost:${PORT}`);
});