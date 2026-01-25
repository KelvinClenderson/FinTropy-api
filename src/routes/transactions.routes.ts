import { Router } from 'express';
import { CreateTransactionController } from '../controllers/transactions/create-transaction.controller';
import { ensureAuthenticated } from '../middlewares/ensure-authenticated.middleware';

// 👇 Novos imports
import { GetDashboardStatsController } from '../controllers/dashboard/get-dashboard-stats.controller';
import { DeleteTransactionController } from '../controllers/transactions/delete-transaction.controller';
import { FetchTransactionsController } from '../controllers/transactions/fetch-transactions.controller';
import { GetTransactionController } from '../controllers/transactions/get-transaction.controller';
import { UpdateTransactionController } from '../controllers/transactions/update-transaction.controller';

const transactionsRoutes = Router();

const createTransactionController = new CreateTransactionController();
const getDashboardStatsController = new GetDashboardStatsController();
const deleteTransactionController = new DeleteTransactionController();
const updateTransactionController = new UpdateTransactionController();
const fetchTransactionsController = new FetchTransactionsController();
const getTransactionController = new GetTransactionController();

transactionsRoutes.use(ensureAuthenticated);

// Rota de Criação
transactionsRoutes.post('/', createTransactionController.handle);

// Rota de Listagem (Extrato) -> GET /transactions?workspaceId=...&month=2&year=2026
transactionsRoutes.get('/', fetchTransactionsController.handle);

// Rota de Detalhes -> GET /transactions/:id
transactionsRoutes.get('/:id', getTransactionController.handle);

// Rota de Edição -> PUT /transactions/:id
transactionsRoutes.put('/:id', updateTransactionController.handle);

// Rota de Deleção -> DELETE /transactions/:id?workspaceId=...
transactionsRoutes.delete('/:id', deleteTransactionController.handle);

// Dashboard
transactionsRoutes.get('/dashboard', getDashboardStatsController.handle);

export { transactionsRoutes };
