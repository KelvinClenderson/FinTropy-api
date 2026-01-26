"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetsRepository = void 0;
const prisma_1 = require("../lib/prisma");
class BudgetsRepository {
    // Buscar por ID (Usado no Update)
    async findById(id) {
        return await prisma_1.prisma.budget.findUnique({
            where: { id },
        });
    }
    // Buscar pela chave composta (Usado no Create para evitar duplicidade)
    async findByMonthAndCategory(workspaceId, categoryId, month) {
        return await prisma_1.prisma.budget.findUnique({
            where: {
                workspaceId_categoryId_month: {
                    workspaceId,
                    categoryId,
                    month,
                },
            },
        });
    }
    // CRIAR (POST)
    async create(data) {
        return await prisma_1.prisma.budget.create({
            data,
        });
    }
    // ATUALIZAR (PUT)
    async update(id, amount) {
        return await prisma_1.prisma.budget.update({
            where: { id },
            data: { amount },
        });
    }
    // Atualizar/Criar Recorrência (Auxiliar para a flag isRecurring)
    async upsertRecurringBudget(workspaceId, categoryId, amount) {
        return await prisma_1.prisma.recurringBudget.upsert({
            where: {
                workspaceId_categoryId: {
                    workspaceId,
                    categoryId,
                },
            },
            create: { workspaceId, categoryId, amount },
            update: { amount },
        });
    }
    // Listagem (Mantido)
    async findBudgetsByMonth(workspaceId, month) {
        return await prisma_1.prisma.budget.findMany({
            where: { workspaceId, month },
        });
    }
    // Gastos (Mantido)
    async getExpensesByCategoryInPeriod(workspaceId, startDate, endDate) {
        return await prisma_1.prisma.transaction.groupBy({
            by: ['categoryId'],
            where: {
                workspaceId,
                type: 'EXPENSE',
                date: { gte: startDate, lte: endDate },
            },
            _sum: { amount: true },
        });
    }
}
exports.BudgetsRepository = BudgetsRepository;
