import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { authenticateRoutes } from './routes/auth.routes'; // Vamos criar abaixo
import { dashboardRoutes } from './routes/dashboard.routes';
import { transactionsRoutes } from './routes/transactions.routes';

export const app = express();

// Middlewares Globais
app.use(helmet()); // Segurança de headers
app.use(cors()); // Permitir acesso do frontend
app.use(express.json());

// Rotas
app.use('/auth', authenticateRoutes);
app.use('/transactions', transactionsRoutes);
app.use('/dashboard', dashboardRoutes); // Adicionar

// Tratamento de Erros Global (Opcional, mas recomendado)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  console.error(err);
  return res.status(500).json({ error: 'Internal Server Error' });
});
