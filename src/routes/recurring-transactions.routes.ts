import { Router } from 'express';
import { CreateRecurringTransactionController } from '../controllers/recurring-transactions/create-recurring-transaction.controller';
import { DeleteRecurringTransactionController } from '../controllers/recurring-transactions/delete-recurring-transaction.controller';
import { ListRecurringTransactionsController } from '../controllers/recurring-transactions/list-recurring-transactions.controller';
import { ensureAuthenticated } from '../middlewares/ensure-authenticated.middleware';

const recurringTransactionsRoutes = Router();

const createController = new CreateRecurringTransactionController();
const listController = new ListRecurringTransactionsController();
const deleteController = new DeleteRecurringTransactionController();

recurringTransactionsRoutes.use(ensureAuthenticated);

recurringTransactionsRoutes.post('/', createController.handle);
recurringTransactionsRoutes.get('/', listController.handle); // ?workspaceId=...
recurringTransactionsRoutes.delete('/:id', deleteController.handle); // ?workspaceId=...

export { recurringTransactionsRoutes };
