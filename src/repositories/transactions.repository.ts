import { Prisma, Transaction } from '@prisma/client';
import { prisma } from '../lib/prisma';

export class TransactionsRepository {
  // ============================================================
  // CRUD BÁSICO (Create, Read, Update, Delete)
  // ============================================================

  // 1. Cria uma transação única
  async create(data: Prisma.TransactionUncheckedCreateInput): Promise<Transaction> {
    return await prisma.transaction.create({
      data,
    });
  }

  // 2. Cria múltiplas transações (usado no parcelamento)
  async createMany(data: Prisma.TransactionCreateManyInput[]) {
    return await prisma.transaction.createMany({
      data,
    });
  }

  // 3. Atualizar uma transação existente (Edição)
  async update(id: string, data: Prisma.TransactionUpdateInput): Promise<Transaction> {
    return await prisma.transaction.update({
      where: { id },
      data,
    });
  }

  // 4. Deletar por ID (Deleção Simples)
  async delete(id: string) {
    await prisma.transaction.delete({
      where: { id },
    });
  }

  // 5. Busca transação por ID (Detalhes ou para validação antes de update/delete)
  async findById(id: string): Promise<Transaction | null> {
    return await prisma.transaction.findUnique({
      where: { id },
    });
  }

  // ============================================================
  // DELEÇÃO COMPLEXA (Parcelas e Recorrências)
  // ============================================================

  // 6. Deletar transação pelo Parent ID (Remove todas as parcelas de uma vez)
  async deleteByParentId(parentId: string) {
    await prisma.transaction.deleteMany({
      where: {
        OR: [
          { id: parentId }, // O pai
          { parentId: parentId }, // Os filhos
        ],
      },
    });
  }

  // 7. Deletar Configuração de Recorrência (E todas as transações geradas por ela)
  async deleteRecurringAndTransactions(recurringId: string) {
    // A. Deleta as transações geradas (histórico e futuro)
    await prisma.transaction.deleteMany({
      where: { recurringTransactionId: recurringId },
    });

    // B. Deleta a configuração da recorrência (a "regra" em si)
    await prisma.recurringTransaction.delete({
      where: { id: recurringId },
    });
  }

  // ============================================================
  // LISTAGEM (Extrato)
  // ============================================================

  // 8. Busca todas as transações de um mês específico
  async findAllByMonth({
    workspaceId,
    month,
    year,
  }: {
    workspaceId: string;
    month: number;
    year: number;
  }) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    return await prisma.transaction.findMany({
      where: {
        workspaceId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'desc' },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
        creditCard: { select: { id: true, name: true } },
        parent: { select: { id: true, name: true } },
      },
    });
  }

  // ============================================================
  // AUXILIARES
  // ============================================================

  // 9. Busca Cartão Específico
  async findCreditCardById(id: string) {
    return await prisma.creditCard.findUnique({
      where: { id },
    });
  }

  // 10. Busca detalhes das categorias
  async findCategoriesByIds(ids: string[]) {
    return await prisma.category.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, color: true, icon: true },
    });
  }

  // Busca todas as transações de um cartão (usado para cálculo de limite)
  // Otimização: Podemos limitar a busca para transações que ainda não venceram tecnicamente,
  // mas buscar tudo garante precisão se houver parcelas muito longas (ex: 24x)
  async findAllByCardId(creditCardId: string) {
    return await prisma.transaction.findMany({
      where: {
        creditCardId,
      },
      select: {
        amount: true,
        date: true,
      },
    });
  }

  // ============================================================
  // MÉTODOS DO DASHBOARD (Estatísticas)
  // ============================================================

  // 11. Agrupamento para Cards de Resumo
  async getBalanceStats(workspaceId: string, startDate: Date, endDate: Date) {
    return await prisma.transaction.groupBy({
      by: ['type'],
      where: {
        workspaceId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });
  }

  // 12. Agrupamento para Gráfico de Pizza
  async getExpensesByCategory(workspaceId: string, startDate: Date, endDate: Date) {
    return await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        workspaceId,
        type: 'EXPENSE',
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });
  }

  // 13. Histórico: Busca as últimas transações
  async findLatestInPeriod(workspaceId: string, startDate: Date, cutOffDate: Date) {
    return await prisma.transaction.findMany({
      where: {
        workspaceId,
        date: {
          gte: startDate,
          lte: cutOffDate,
        },
      },
      orderBy: { date: 'desc' },
      take: 5,
      include: {
        category: { select: { name: true, icon: true, color: true } },
      },
    });
  }

  // 14. Futuro: Busca despesas A VENCER
  async findUpcomingExpenses(workspaceId: string, cutOffDate: Date, endDate: Date) {
    return await prisma.transaction.findMany({
      where: {
        workspaceId,
        type: 'EXPENSE',
        paymentMethod: {
          not: 'CREDIT_CARD',
        },
        date: {
          gt: cutOffDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
      include: {
        category: { select: { name: true, icon: true, color: true } },
      },
    });
  }

  // 👇 15. NOVO: Busca Transações por Período (ESSENCIAL PARA O NOVO DASHBOARD)
  async findByWorkspaceAndPeriod(workspaceId: string, startDate: Date, endDate: Date) {
    return await prisma.transaction.findMany({
      where: {
        workspaceId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'desc',
      },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
        // 👇 CORREÇÃO: Removemos 'color' daqui, pois Member não tem cor no schema
        member: { select: { id: true, name: true } },
      },
    });
  }
}
