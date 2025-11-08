const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    try {
        // Pegar token do header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Acesso negado. Token não fornecido.'
            });
        }

        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Buscar usuário
        const user = await User.findById(decoded.id);

        if (!user || !user.ativo) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não encontrado ou inativo'
            });
        }

        // Adicionar usuário na requisição
        req.user = {
            id: user._id,
            email: user.email,
            nome: user.nome
        };

        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token inválido ou expirado'
        });
    }
};
