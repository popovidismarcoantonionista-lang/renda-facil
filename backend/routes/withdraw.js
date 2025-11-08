const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Withdraw = require('../models/Withdraw');
const pluggyService = require('../services/pluggy');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

/**
 * POST /api/withdraw/request
 * Solicitar saque via PIX
 * Autenticado
 */
router.post('/request', 
    auth,
    [
        body('valorPontos').isInt({ min: 10000 }).withMessage('Valor mínimo: 10.000 pontos'),
        body('chavePix').notEmpty().withMessage('Chave PIX obrigatória'),
        body('tipoChave').isIn(['cpf', 'email', 'telefone', 'aleatoria']).withMessage('Tipo de chave inválido')
    ],
    async (req, res) => {
        try {
            // Validar entrada
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { valorPontos, chavePix, tipoChave } = req.body;
            const userId = req.user.id;

            // Buscar usuário
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado'
                });
            }

            // Verificar saldo
            if (user.pontos < valorPontos) {
                return res.status(400).json({
                    success: false,
                    message: 'Saldo insuficiente',
                    saldoAtual: user.pontos,
                    saldoNecessario: valorPontos
                });
            }

            // Verificar limite de saques diários
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);

            const saquesHoje = await Withdraw.countDocuments({
                usuario: userId,
                createdAt: { $gte: hoje }
            });

            const MAX_SAQUES_DIA = parseInt(process.env.MAX_SAQUES_DIA) || 3;
            if (saquesHoje >= MAX_SAQUES_DIA) {
                return res.status(429).json({
                    success: false,
                    message: `Limite de ${MAX_SAQUES_DIA} saques por dia atingido`
                });
            }

            // Criar registro de saque
            const withdraw = new Withdraw({
                usuario: userId,
                valorPontos,
                valorReais: valorPontos / 1000,
                chavePix,
                tipoChave,
                status: 'pendente'
            });

            await withdraw.save();

            // Processar pagamento via Pluggy.ai
            try {
                const pagamento = await pluggyService.criarPagamentoPix(
                    valorPontos,
                    chavePix,
                    tipoChave,
                    `Saque RendaFácil - ${user.nome}`
                );

                // Atualizar saque com ID do Pluggy
                withdraw.idPluggy = pagamento.paymentId;
                withdraw.status = 'processando';
                await withdraw.save();

                // Deduzir pontos do usuário
                user.pontos -= valorPontos;
                user.estatisticas.saquesRealizados += 1;
                await user.save();

                res.json({
                    success: true,
                    message: 'Saque solicitado com sucesso!',
                    withdraw: {
                        id: withdraw._id,
                        valor: withdraw.valorReais,
                        chavePix: withdraw.chavePix,
                        status: withdraw.status,
                        estimativaProcessamento: '24 horas'
                    },
                    novoSaldo: user.pontos
                });

            } catch (pluggyError) {
                // Falha no Pluggy - reverter saque
                withdraw.status = 'falhou';
                withdraw.motivoFalha = pluggyError.message;
                await withdraw.save();

                res.status(500).json({
                    success: false,
                    message: 'Erro ao processar pagamento',
                    error: pluggyError.message
                });
            }

        } catch (error) {
            console.error('❌ Erro ao solicitar saque:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno ao processar saque'
            });
        }
    }
);

/**
 * GET /api/withdraw/history
 * Histórico de saques do usuário
 * Autenticado
 */
router.get('/history', auth, async (req, res) => {
    try {
        const withdraws = await Withdraw.find({ usuario: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            success: true,
            withdraws
        });

    } catch (error) {
        console.error('❌ Erro ao buscar histórico:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar histórico'
        });
    }
});

/**
 * GET /api/withdraw/status/:id
 * Consultar status de um saque específico
 * Autenticado
 */
router.get('/status/:id', auth, async (req, res) => {
    try {
        const withdraw = await Withdraw.findOne({
            _id: req.params.id,
            usuario: req.user.id
        });

        if (!withdraw) {
            return res.status(404).json({
                success: false,
                message: 'Saque não encontrado'
            });
        }

        // Se tiver ID do Pluggy, consultar status atualizado
        if (withdraw.idPluggy) {
            try {
                const statusPluggy = await pluggyService.consultarPagamento(withdraw.idPluggy);

                // Atualizar status local se necessário
                if (statusPluggy.payment.status !== withdraw.status) {
                    withdraw.status = statusPluggy.payment.status;
                    await withdraw.save();
                }
            } catch (error) {
                console.error('Erro ao consultar Pluggy:', error);
            }
        }

        res.json({
            success: true,
            withdraw
        });

    } catch (error) {
        console.error('❌ Erro ao consultar status:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao consultar status'
        });
    }
});

module.exports = router;
