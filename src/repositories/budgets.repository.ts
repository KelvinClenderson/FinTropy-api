import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

export class BudgetsRepository {
  // Buscar por ID (Usado no Update)
  async findById(id: string) {
    return await prisma.budget.findUnique({
      where: { id },
    });
  }

  // Buscar pela chave composta (Usado no Create para evitar duplicidade)
  async findByMonthAndCategory(workspaceId: string, categoryId: string, month: string) {
    return await prisma.budget.findUnique({
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
  async create(data: Prisma.BudgetUncheckedCreateInput) {
    return await prisma.budget.create({
      data,
    });
  }

  // ATUALIZAR (PUT)
  async update(id: string, amount: Prisma.Decimal) {
    return await prisma.budget.update({
      where: { id },
      data: { amount },
    });
  }

  // Atualizar/Criar Recorrência (Auxiliar para a flag isRecurring)
  async upsertRecurringBudget(workspaceId: string, categoryId: string, amount: Prisma.Decimal) {
    return await prisma.recurringBudget.upsert({
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
  async findBudgetsByMonth(workspaceId: string, month: string) {
    return await prisma.budget.findMany({
      where: { workspaceId, month },
    });
  }

  // Gastos (Mantido)
  async getExpensesByCategoryInPeriod(workspaceId: string, startDate: Date, endDate: Date) {
    return await prisma.transaction.groupBy({
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
