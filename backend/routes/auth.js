const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

/**
 * POST /api/auth/register
 * Cadastro de novo usuário
 */
router.post('/register',
    [
        body('nome').trim().isLength({ min: 3 }).withMessage('Nome deve ter no mínimo 3 caracteres'),
        body('email').isEmail().withMessage('Email inválido'),
        body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres')
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

            const { nome, email, senha, chavePix, referralCode } = req.body;

            // Verificar se email já existe
            const usuarioExiste = await User.findOne({ email: email.toLowerCase() });
            if (usuarioExiste) {
                return res.status(400).json({
                    success: false,
                    message: 'Email já cadastrado'
                });
            }

            // Criar usuário
            const user = new User({
                nome,
                email: email.toLowerCase(),
                senha,
                pontos: 500 // Bônus de cadastro
            });

            // Adicionar chave PIX se fornecida
            if (chavePix) {
                user.chavePix = {
                    valor: chavePix,
                    tipo: req.body.tipoChavePix || 'cpf'
                };
            }

            // Gerar código de referência
            user.gerarReferralCode();

            // Processar código de indicação
            if (referralCode) {
                const referrer = await User.findOne({ referralCode });
                if (referrer) {
                    user.referredBy = referrer._id;
                    referrer.estatisticas.indicados += 1;
                    await referrer.save();
                }
            }

            await user.save();

            // Gerar token JWT
            const token = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE || '7d' }
            );

            res.status(201).json({
                success: true,
                message: '🎉 Cadastro realizado com sucesso!',
                token,
                user: {
                    id: user._id,
                    nome: user.nome,
                    email: user.email,
                    pontos: user.pontos,
                    referralCode: user.referralCode
                }
            });

        } catch (error) {
            console.error('❌ Erro ao cadastrar:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao criar conta'
            });
        }
    }
);

/**
 * POST /api/auth/login
 * Login de usuário
 */
router.post('/login',
    [
        body('email').isEmail().withMessage('Email inválido'),
        body('senha').notEmpty().withMessage('Senha obrigatória')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { email, senha } = req.body;

            // Buscar usuário (incluindo senha)
            const user = await User.findOne({ email: email.toLowerCase() }).select('+senha');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Email ou senha incorretos'
                });
            }

            // Verificar senha
            const senhaCorreta = await user.compararSenha(senha);
            if (!senhaCorreta) {
                return res.status(401).json({
                    success: false,
                    message: 'Email ou senha incorretos'
                });
            }

            // Verificar se está ativo
            if (!user.ativo) {
                return res.status(403).json({
                    success: false,
                    message: 'Conta desativada. Entre em contato com o suporte.'
                });
            }

            // Resetar ganhos diários se necessário
            user.resetarGanhosDiarios();
            user.ultimoLogin = new Date();
            await user.save();

            // Gerar token JWT
            const token = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE || '7d' }
            );

            res.json({
                success: true,
                message: 'Login realizado com sucesso!',
                token,
                user: {
                    id: user._id,
                    nome: user.nome,
                    email: user.email,
                    pontos: user.pontos,
                    referralCode: user.referralCode
                }
            });

        } catch (error) {
            console.error('❌ Erro ao fazer login:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao fazer login'
            });
        }
    }
);

module.exports = router;
