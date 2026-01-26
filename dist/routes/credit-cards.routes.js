"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creditCardsRoutes = void 0;
const express_1 = require("express");
const create_credit_card_controller_1 = require("../controllers/credit-cards/create-credit-card.controller");
const delete_credit_card_controller_1 = require("../controllers/credit-cards/delete-credit-card.controller");
const list_credit_cards_controller_1 = require("../controllers/credit-cards/list-credit-cards.controller");
const ensure_authenticated_middleware_1 = require("../middlewares/ensure-authenticated.middleware");
// 👇 Novo Import
const update_credit_card_controller_1 = require("../controllers/credit-cards/update-credit-card.controller");
const creditCardsRoutes = (0, express_1.Router)();
exports.creditCardsRoutes = creditCardsRoutes;
const createCreditCardController = new create_credit_card_controller_1.CreateCreditCardController();
const listCreditCardsController = new list_credit_cards_controller_1.ListCreditCardsController();
const deleteCreditCardController = new delete_credit_card_controller_1.DeleteCreditCardController();
// 👇 Instância
const updateCreditCardController = new update_credit_card_controller_1.UpdateCreditCardController();
creditCardsRoutes.use(ensure_authenticated_middleware_1.ensureAuthenticated);
creditCardsRoutes.post('/', createCreditCardController.handle);
creditCardsRoutes.get('/', listCreditCardsController.handle);
creditCardsRoutes.delete('/:id', deleteCreditCardController.handle);
// 👇 Nova Rota
creditCardsRoutes.put('/:id', updateCreditCardController.handle); // PUT /credit-cards/:id?workspaceId=...
