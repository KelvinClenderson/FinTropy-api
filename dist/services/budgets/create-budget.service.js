"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBudgetService = void 0;
const client_1 = require("@prisma/client");
class CreateBudgetService {
    constructor(budgetsRepository) {
        this.budgetsRepository = budgetsRepository;
    }
    async execute({ workspaceId, categoryId, month, amount, isRecurring }) {
        // 1. Verifica se já existe (Regra do POST: não deve sobrescrever silenciosamente)
        const existingBudget = await this.budgetsRepository.findByMonthAndCategory(workspaceId, categoryId, month);
        if (existingBudget) {
            throw new Error('Já existe um orçamento para esta categoria neste mês. Use a rota de edição.');
        }
        const amountDecimal = new client_1.Prisma.Decimal(amount);
        // 2. Cria
        const budget = await this.budgetsRepository.create({
            workspaceId,
            categoryId,
            month,
            amount: amountDecimal,
        });
        // 3. Aplica recorrência se solicitado
        if (isRecurring) {
            await this.budgetsRepository.upsertRecurringBudget(workspaceId, categoryId, amountDecimal);
        }
        return budget;
    }
}
exports.CreateBudgetService = CreateBudgetService;
