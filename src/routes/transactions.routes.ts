import { Router } from 'express';
import { CreateTransactionController } from '../controllers/transactions/create-transaction.controller';
import { ensureAuthenticated } from '../middlewares/ensure-authenticated.middleware';

import { DeleteTransactionController } from '../controllers/transactions/delete-transaction.controller';
import { FetchTransactionsController } from '../controllers/transactions/fetch-transactions.controller';
import { GetTransactionController } from '../controllers/transactions/get-transaction.controller';
import { UpdateTransactionController } from '../controllers/transactions/update-transaction.controller';

const transactionsRoutes = Router();

const createTransactionController = new CreateTransactionController();
const deleteTransactionController = new DeleteTransactionController();
const updateTransactionController = new UpdateTransactionController();
const fetchTransactionsController = new FetchTransactionsController();
const getTransactionController = new GetTransactionController();

transactionsRoutes.use(ensureAuthenticated);

transactionsRoutes.post('/', createTransactionController.handle);
transactionsRoutes.get('/', fetchTransactionsController.handle);
transactionsRoutes.get('/:id', getTransactionController.handle);
transactionsRoutes.put('/:id', updateTransactionController.handle);
transactionsRoutes.delete('/:id', deleteTransactionController.handle);

export { transactionsRoutes };
