const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'Nome é obrigatório'],
        trim: true,
        minlength: [3, 'Nome deve ter no mínimo 3 caracteres']
    },
    email: {
        type: String,
        required: [true, 'Email é obrigatório'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Email inválido']
    },
    senha: {
        type: String,
        required: [true, 'Senha é obrigatória'],
        minlength: [6, 'Senha deve ter no mínimo 6 caracteres'],
        select: false
    },
    pontos: {
        type: Number,
        default: 500, // Bônus de cadastro
        min: 0
    },
    chavePix: {
        valor: String,
        tipo: {
            type: String,
            enum: ['cpf', 'email', 'telefone', 'aleatoria']
        }
    },
    idPluggy: {
        type: String,
        default: null
    },
    referralCode: {
        type: String,
        unique: true,
        sparse: true
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    estatisticas: {
        tarefasCompletas: { type: Number, default: 0 },
        ganhosHoje: { type: Number, default: 0 },
        ganhosTotal: { type: Number, default: 0 },
        saquesRealizados: { type: Number, default: 0 },
        indicados: { type: Number, default: 0 },
        ultimoGanhoHoje: { type: Date, default: Date.now }
    },
    nivel: {
        type: Number,
        default: 1,
        min: 1
    },
    ativo: {
        type: Boolean,
        default: true
    },
    verificado: {
        type: Boolean,
        default: false
    },
    ultimoLogin: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash da senha antes de salvar
userSchema.pre('save', async function(next) {
    if (!this.isModified('senha')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.senha = await bcrypt.hash(this.senha, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Método para comparar senha
userSchema.methods.compararSenha = async function(senhaInformada) {
    return await bcrypt.compare(senhaInformada, this.senha);
};

// Método para gerar código de referência
userSchema.methods.gerarReferralCode = function() {
    const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.referralCode = codigo;
    return codigo;
};

// Resetar ganhos diários (chamado por cron job)
userSchema.methods.resetarGanhosDiarios = function() {
    const hoje = new Date();
    const ultimoGanho = new Date(this.estatisticas.ultimoGanhoHoje);

    // Se for um novo dia, resetar
    if (hoje.toDateString() !== ultimoGanho.toDateString()) {
        this.estatisticas.ganhosHoje = 0;
        this.estatisticas.ultimoGanhoHoje = hoje;
    }
};

// Converter pontos para reais
userSchema.virtual('saldoReais').get(function() {
    return (this.pontos / 1000).toFixed(2);
});

// JSON sem dados sensíveis
userSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.senha;
    return obj;
};

module.exports = mongoose.model('User', userSchema);
