import cors from 'cors';
import express from 'express';
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
import { workspacesRoutes } from './routes/workspaces.routes';
import swaggerFile from './swagger_output.json';

export const app = express();

// Middlewares Globais
app.use(helmet()); // Segurança de headers
app.use(cors()); // Permitir acesso do frontend
app.use(express.json());

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
