"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteRecurringTransactionService = void 0;
class DeleteRecurringTransactionService {
    constructor(recurringTransactionsRepository) {
        this.recurringTransactionsRepository = recurringTransactionsRepository;
    }
    async execute({ id, workspaceId }) {
        const recurring = await this.recurringTransactionsRepository.findById(id);
        if (!recurring) {
            throw new Error('Assinatura não encontrada.');
        }
        if (recurring.workspaceId !== workspaceId) {
            throw new Error('Não autorizado.');
        }
        await this.recurringTransactionsRepository.delete(id);
    }
}
exports.DeleteRecurringTransactionService = DeleteRecurringTransactionService;
