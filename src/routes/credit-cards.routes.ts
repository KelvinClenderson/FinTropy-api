import { Router } from 'express';
import { CreateCreditCardController } from '../controllers/credit-cards/create-credit-card.controller';
import { ensureAuthenticated } from '../middlewares/ensure-authenticated.middleware';

const creditCardsRoutes = Router();
const createCreditCardController = new CreateCreditCardController();

creditCardsRoutes.use(ensureAuthenticated);

creditCardsRoutes.post('/', createCreditCardController.handle);
// Futuramente: GET / e DELETE /:id

export { creditCardsRoutes };
