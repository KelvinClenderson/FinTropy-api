"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteRecurringTransactionController = void 0;
const zod_1 = require("zod");
const recurring_transactions_repository_1 = require("../../repositories/recurring-transactions.repository");
const delete_recurring_transaction_service_1 = require("../../services/recurring-transactions/delete-recurring-transaction.service");
class DeleteRecurringTransactionController {
    async handle(req, res) {
        const paramSchema = zod_1.z.object({ id: zod_1.z.string().cuid().or(zod_1.z.string().uuid()) });
        const querySchema = zod_1.z.object({ workspaceId: zod_1.z.string().min(1) });
        try {
            const { id } = paramSchema.parse(req.params);
            const { workspaceId } = querySchema.parse(req.query);
            const repo = new recurring_transactions_repository_1.RecurringTransactionsRepository();
            const service = new delete_recurring_transaction_service_1.DeleteRecurringTransactionService(repo);
            await service.execute({ id, workspaceId });
            return res.status(204).send();
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.DeleteRecurringTransactionController = DeleteRecurringTransactionController;
