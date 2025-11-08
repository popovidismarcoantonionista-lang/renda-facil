const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

/**
 * POST /api/tasks/complete
 * Marcar tarefa como completa e adicionar pontos
 */
router.post('/complete', auth, async (req, res) => {
    try {
        const { taskType, pontos } = req.body;

        const user = await User.findById(req.user.id);
        user.pontos += pontos;
        user.estatisticas.tarefasCompletas += 1;
        user.estatisticas.ganhosHoje += pontos;
        user.estatisticas.ganhosTotal += pontos;

        await user.save();

        res.json({
            success: true,
            message: `Você ganhou ${pontos} pontos!`,
            novoSaldo: user.pontos
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao processar tarefa'
        });
    }
});

module.exports = router;
