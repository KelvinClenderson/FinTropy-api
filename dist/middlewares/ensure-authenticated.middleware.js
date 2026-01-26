"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureAuthenticated = ensureAuthenticated;
const jsonwebtoken_1 = require("jsonwebtoken");
function ensureAuthenticated(req, res, next) {
    const authToken = req.headers.authorization;
    if (!authToken) {
        return res.status(401).json({ error: 'Token não fornecido.' });
    }
    const [, token] = authToken.split(' ');
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('Erro de configuração: JWT_SECRET ausente.');
        }
        const { sub } = (0, jsonwebtoken_1.verify)(token, process.env.JWT_SECRET);
        // CORREÇÃO AQUI: Preencher o objeto user conforme a tipagem
        req.user = {
            id: sub,
        };
        return next();
    }
    catch (err) {
        return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
}
