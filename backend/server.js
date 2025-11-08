const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importar rotas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const taskRoutes = require('./routes/tasks');
const withdrawRoutes = require('./routes/withdraw');
const referralRoutes = require('./routes/referral');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARES ====================

// Segurança
app.use(helmet());

// CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true
}));

// Parser JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting (Anti-DDoS)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 requisições por IP
    message: 'Muitas requisições deste IP, tente novamente mais tarde.'
});
app.use('/api/', limiter);

// ==================== CONECTAR MONGODB ====================

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB conectado com sucesso!'))
.catch(err => {
    console.error('❌ Erro ao conectar MongoDB:', err);
    process.exit(1);
});

// ==================== ROTAS ====================

// Rota de health check
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '💰 RendaFácil API está online!',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/withdraw', withdrawRoutes);
app.use('/api/referral', referralRoutes);

// Rota 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Rota não encontrada'
    });
});

// Error handler global
app.use((err, req, res, next) => {
    console.error('❌ Erro:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Erro interno do servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ==================== INICIAR SERVIDOR ====================

app.listen(PORT, () => {
    console.log('');
    console.log('================================================');
    console.log('   💰 RENDAFÁCIL BACKEND');
    console.log('================================================');
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV}`);
    console.log(`📡 API: http://localhost:${PORT}/api`);
    console.log(`🔗 Pluggy.ai: ${process.env.PLUGGY_ENVIRONMENT}`);
    console.log('================================================');
    console.log('');
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
    console.error('❌ Erro não tratado:', err);
    process.exit(1);
});

module.exports = app;
