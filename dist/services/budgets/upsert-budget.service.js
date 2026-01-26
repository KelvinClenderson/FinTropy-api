"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBudgetService = void 0;
const client_1 = require("@prisma/client");
class UpdateBudgetService {
    constructor(budgetsRepository) {
        this.budgetsRepository = budgetsRepository;
    }
    async execute({ id, workspaceId, amount, isRecurring }) {
        // 1. Busca o orçamento existente
        const budget = await this.budgetsRepository.findById(id);
        if (!budget) {
            throw new Error('Orçamento não encontrado.');
        }
        // 2. Garante que pertence ao workspace correto
        if (budget.workspaceId !== workspaceId) {
            throw new Error('Não autorizado.');
        }
        const amountDecimal = new client_1.Prisma.Decimal(amount);
        // 3. Atualiza
        const updatedBudget = await this.budgetsRepository.update(id, amountDecimal);
        // 4. Aplica recorrência se solicitado (usa o categoryId do orçamento original)
        if (isRecurring) {
            await this.budgetsRepository.upsertRecurringBudget(workspaceId, budget.categoryId, amountDecimal);
        }
        return updatedBudget;
    }
}
exports.UpdateBudgetService = UpdateBudgetService;
