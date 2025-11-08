const mongoose = require('mongoose');

const withdrawSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    valorPontos: {
        type: Number,
        required: true,
        min: 10000
    },
    valorReais: {
        type: Number,
        required: true
    },
    chavePix: {
        type: String,
        required: true
    },
    tipoChave: {
        type: String,
        enum: ['cpf', 'email', 'telefone', 'aleatoria'],
        required: true
    },
    status: {
        type: String,
        enum: ['pendente', 'processando', 'concluido', 'falhou', 'cancelado'],
        default: 'pendente'
    },
    idPluggy: {
        type: String,
        default: null
    },
    motivoFalha: {
        type: String,
        default: null
    },
    processadoEm: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Índice para consultas rápidas
withdrawSchema.index({ usuario: 1, createdAt: -1 });
withdrawSchema.index({ status: 1 });

module.exports = mongoose.model('Withdraw', withdrawSchema);
