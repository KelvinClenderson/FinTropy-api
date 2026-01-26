import cors from 'cors';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express'; // Importar UI
import { authenticateRoutes } from './routes/auth.routes';
import { budgetsRoutes } from './routes/budgets.routes';
import { categoriesRoutes } from './routes/categories.routes';
import { creditCardsRoutes } from './routes/credit-cards.routes';
import { cronRoutes } from './routes/cron.routes';
import { dashboardRoutes } from './routes/dashboard.routes';
import { goalsRoutes } from './routes/goals.routes';
import { membersRoutes } from './routes/members.routes';
import { recurringTransactionsRoutes } from './routes/recurring-transactions.routes';
import { transactionsRoutes } from './routes/transactions.routes';
import { usersRoutes } from './routes/users.routes';
import { workspacesRoutes } from './routes/workspaces.routes';
import swaggerFile from './swagger_output.json';

export const app = express();

// Middlewares Globais
app.use(express.json());
app.use(helmet()); // Segurança de headers
app.use(cors()); // Permitir acesso do frontend
app.use(express.json());
app.use(helmet()); // 1. Helmet: Protege headers HTTP

// // 2. CORS: Restringe quem pode chamar sua API (No frontend em produção)
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || '*', // Em produção, coloque a URL exata do seu front
//   }),
// );

// 3. Rate Limit: Evita ataques de força bruta (ex: 100 reqs por 15 min)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
});
app.use(limiter);

// Rotas
app.use('/auth', authenticateRoutes);
app.use('/transactions', transactionsRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/credit-cards', creditCardsRoutes);
app.use('/recurring-transactions', recurringTransactionsRoutes);
app.use('/categories', categoriesRoutes);
app.use('/goals', goalsRoutes);
app.use('/workspaces', workspacesRoutes);
app.use('/budgets', budgetsRoutes);
app.use('/cron', cronRoutes);
app.use('/members', membersRoutes);
app.use('/users', usersRoutes);

// Documentação Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Tratamento de Erros Global (Opcional, mas recomendado)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  console.error(err);
  return res.status(500).json({ error: 'Internal Server Error' });
});
