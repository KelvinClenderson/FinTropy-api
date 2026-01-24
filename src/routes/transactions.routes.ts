import { Router } from 'express';
import { CreateTransactionController } from '../controllers/transactions/create-transaction.controller';
import { GetPaymentMethodsController } from '../controllers/transactions/get-payment-methods.controller'; // Importe
import { ensureAuthenticated } from '../middlewares/ensure-authenticated.middleware';

const transactionsRoutes = Router();
const createTransactionController = new CreateTransactionController();
const getPaymentMethodsController = new GetPaymentMethodsController(); // Instancie

transactionsRoutes.use(ensureAuthenticated);

transactionsRoutes.post('/', createTransactionController.handle);

// 👇 Nova rota para popular o select
transactionsRoutes.get('/payment-methods', getPaymentMethodsController.handle);

export { transactionsRoutes };
