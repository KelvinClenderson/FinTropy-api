import { Router } from 'express';
// 👇 CORREÇÃO 1: Ajustei os nomes das classes e o caminho da pasta para 'auth'
import { AuthenticateController } from '../controllers/auth/authenticate.controller';
import { RegisterController } from '../controllers/auth/register.controller';
import { ensureAuthenticated } from '../middlewares/ensure-authenticated.middleware';

const authenticateRoutes = Router();

// 👇 CORREÇÃO 2: Instanciando com os nomes corretos
const authenticateController = new AuthenticateController();
const registerController = new RegisterController();

// Rota de Login
authenticateRoutes.post('/sessions', authenticateController.handle);

// Rota de Registro
authenticateRoutes.post('/register', registerController.handle);

// Rota "/me"
authenticateRoutes.get('/me', ensureAuthenticated, (req, res) => {
  return res.json({
    ok: true,
    user: {
      id: req.user.id,
      // Removi o email para evitar o erro de tipagem anterior,
      // já que o ensureAuthenticated só garante o ID por enquanto.
    },
  });
});

export { authenticateRoutes };
