const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

/**
 * GET /api/user/me
 * Dados do usuário autenticado
 */
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar dados do usuário'
        });
    }
});

/**
 * PUT /api/user/pix
 * Atualizar chave PIX
 */
router.put('/pix', auth, async (req, res) => {
    try {
        const { chavePix, tipoChave } = req.body;

        const user = await User.findById(req.user.id);
        user.chavePix = {
            valor: chavePix,
            tipo: tipoChave
        };
        await user.save();

        res.json({
            success: true,
            message: 'Chave PIX atualizada!'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar chave PIX'
        });
    }
});

module.exports = router;
