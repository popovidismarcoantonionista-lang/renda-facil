const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

/**
 * GET /api/referral/stats
 * Estatísticas de indicações
 */
router.get('/stats', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const indicados = await User.find({ referredBy: req.user.id });

        res.json({
            success: true,
            referralCode: user.referralCode,
            totalIndicados: indicados.length,
            indicados: indicados.map(u => ({
                nome: u.nome,
                dataInscricao: u.createdAt
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar estatísticas'
        });
    }
});

module.exports = router;
