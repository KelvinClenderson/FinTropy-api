import { Router } from 'express';
import { CreateCreditCardController } from '../controllers/credit-cards/create-credit-card.controller';
import { DeleteCreditCardController } from '../controllers/credit-cards/delete-credit-card.controller';
import { ListCreditCardsController } from '../controllers/credit-cards/list-credit-cards.controller';
import { ensureAuthenticated } from '../middlewares/ensure-authenticated.middleware';
// 👇 Novo Import
import { UpdateCreditCardController } from '../controllers/credit-cards/update-credit-card.controller';

const creditCardsRoutes = Router();

const createCreditCardController = new CreateCreditCardController();
const listCreditCardsController = new ListCreditCardsController();
const deleteCreditCardController = new DeleteCreditCardController();
// 👇 Instância
const updateCreditCardController = new UpdateCreditCardController();

creditCardsRoutes.use(ensureAuthenticated);

creditCardsRoutes.post('/', createCreditCardController.handle);
creditCardsRoutes.get('/', listCreditCardsController.handle);
creditCardsRoutes.delete('/:id', deleteCreditCardController.handle);

// 👇 Nova Rota
creditCardsRoutes.put('/:id', updateCreditCardController.handle); // PUT /credit-cards/:id?workspaceId=...

export { creditCardsRoutes };
