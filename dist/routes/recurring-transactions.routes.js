"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recurringTransactionsRoutes = void 0;
const express_1 = require("express");
const create_recurring_transaction_controller_1 = require("../controllers/recurring-transactions/create-recurring-transaction.controller");
const delete_recurring_transaction_controller_1 = require("../controllers/recurring-transactions/delete-recurring-transaction.controller");
const list_recurring_transactions_controller_1 = require("../controllers/recurring-transactions/list-recurring-transactions.controller");
const ensure_authenticated_middleware_1 = require("../middlewares/ensure-authenticated.middleware");
const recurringTransactionsRoutes = (0, express_1.Router)();
exports.recurringTransactionsRoutes = recurringTransactionsRoutes;
const createController = new create_recurring_transaction_controller_1.CreateRecurringTransactionController();
const listController = new list_recurring_transactions_controller_1.ListRecurringTransactionsController();
const deleteController = new delete_recurring_transaction_controller_1.DeleteRecurringTransactionController();
recurringTransactionsRoutes.use(ensure_authenticated_middleware_1.ensureAuthenticated);
recurringTransactionsRoutes.post('/', createController.handle);
recurringTransactionsRoutes.get('/', listController.handle); // ?workspaceId=...
recurringTransactionsRoutes.delete('/:id', deleteController.handle); // ?workspaceId=...
