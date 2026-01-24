import { Router } from 'express';
import { AuthenticateController } from '../controllers/auth/authenticate.controller';
import { RegisterController } from '../controllers/auth/register.controller';
import { ensureAuthenticated } from '../middlewares/ensure-authenticated.middleware';

const authenticateRoutes = Router();

const authenticateController = new AuthenticateController();
const registerController = new RegisterController();

// Rotas Públicas
authenticateRoutes.post('/sessions', authenticateController.handle);
authenticateRoutes.post('/register', registerController.handle);

// Rota de Teste (Privada) - Apenas para verificar se o token funciona
authenticateRoutes.get('/me', ensureAuthenticated, (req, res) => {
  return res.json({ ok: true, user_id: req.user_id });
});

export { authenticateRoutes };
