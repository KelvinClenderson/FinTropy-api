"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateRoutes = void 0;
const express_1 = require("express");
// 👇 CORREÇÃO 1: Ajustei os nomes das classes e o caminho da pasta para 'auth'
const authenticate_controller_1 = require("../controllers/auth/authenticate.controller");
const register_controller_1 = require("../controllers/auth/register.controller");
const ensure_authenticated_middleware_1 = require("../middlewares/ensure-authenticated.middleware");
const authenticateRoutes = (0, express_1.Router)();
exports.authenticateRoutes = authenticateRoutes;
// 👇 CORREÇÃO 2: Instanciando com os nomes corretos
const authenticateController = new authenticate_controller_1.AuthenticateController();
const registerController = new register_controller_1.RegisterController();
// Rota de Login
authenticateRoutes.post('/sessions', authenticateController.handle);
// Rota de Registro
authenticateRoutes.post('/register', registerController.handle);
// Rota "/me"
authenticateRoutes.get('/me', ensure_authenticated_middleware_1.ensureAuthenticated, (req, res) => {
    return res.json({
        ok: true,
        user: {
            id: req.user.id,
            // Removi o email para evitar o erro de tipagem anterior,
            // já que o ensureAuthenticated só garante o ID por enquanto.
        },
    });
});
