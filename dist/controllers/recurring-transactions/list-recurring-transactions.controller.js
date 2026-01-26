"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListRecurringTransactionsController = void 0;
const zod_1 = require("zod");
const recurring_transactions_repository_1 = require("../../repositories/recurring-transactions.repository");
const list_recurring_transactions_service_1 = require("../../services/recurring-transactions/list-recurring-transactions.service");
class ListRecurringTransactionsController {
    async handle(req, res) {
        const querySchema = zod_1.z.object({ workspaceId: zod_1.z.string().min(1) });
        try {
            const { workspaceId } = querySchema.parse(req.query);
            const repo = new recurring_transactions_repository_1.RecurringTransactionsRepository();
            const service = new list_recurring_transactions_service_1.ListRecurringTransactionsService(repo);
            const transactions = await service.execute({ workspaceId });
            return res.json(transactions);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.ListRecurringTransactionsController = ListRecurringTransactionsController;
