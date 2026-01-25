import { Router } from 'express';
import { CreateCreditCardController } from '../controllers/credit-cards/create-credit-card.controller';
import { DeleteCreditCardController } from '../controllers/credit-cards/delete-credit-card.controller';
import { ListCreditCardsController } from '../controllers/credit-cards/list-credit-cards.controller';
import { ensureAuthenticated } from '../middlewares/ensure-authenticated.middleware';

const creditCardsRoutes = Router();

const createCreditCardController = new CreateCreditCardController();
const listCreditCardsController = new ListCreditCardsController();
const deleteCreditCardController = new DeleteCreditCardController();

creditCardsRoutes.use(ensureAuthenticated);

creditCardsRoutes.post('/', createCreditCardController.handle);

creditCardsRoutes.get('/', listCreditCardsController.handle); // GET /credit-cards?workspaceId=...
creditCardsRoutes.delete('/:id', deleteCreditCardController.handle); // DELETE /credit-cards/ID_DO_CARTAO

export { creditCardsRoutes };
