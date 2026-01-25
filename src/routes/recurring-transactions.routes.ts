import { Router } from 'express';
import { CreateRecurringTransactionController } from '../controllers/recurring-transactions/create-recurring-transaction.controller';
import { ensureAuthenticated } from '../middlewares/ensure-authenticated.middleware';

const recurringTransactionsRoutes = Router();

const createController = new CreateRecurringTransactionController();

recurringTransactionsRoutes.use(ensureAuthenticated);

recurringTransactionsRoutes.post('/', createController.handle);

export { recurringTransactionsRoutes };
