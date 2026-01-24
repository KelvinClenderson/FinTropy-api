import { Prisma, Transaction } from '@prisma/client';
import { prisma } from '../lib/prisma';

export class TransactionsRepository {
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

  // 3. Busca transação por ID
  async findById(id: string): Promise<Transaction | null> {
    return await prisma.transaction.findUnique({
      where: { id },
    });
  }

  // 4. Busca Cartões de Crédito do Workspace (para o Select de Pagamento)
  async findCreditCardsByWorkspace(workspaceId: string) {
    return await prisma.creditCard.findMany({
      where: { workspaceId },
      select: {
        id: true,
        name: true,
        limit: true,
        closingDay: true,
        dueDay: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  // 5. Busca Cartão Específico (para lógica de fechamento de fatura)
  async findCreditCardById(id: string) {
    return await prisma.creditCard.findUnique({
      where: { id },
    });
  }

  // ============================================================
  // MÉTODOS DO DASHBOARD
  // ============================================================

  // 6. Agrupamento para Cards de Resumo (Receita, Despesa, Saldo, Investimento)
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

  // 7. Agrupamento para Gráfico de Despesas por Categoria
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

  // 8. Busca detalhes das categorias (para preencher nome/cor no gráfico)
  async findCategoriesByIds(ids: string[]) {
    return await prisma.category.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, color: true, icon: true },
    });
  }

  // 9. Histórico: Busca as últimas transações JÁ REALIZADAS no período
  // (Data <= Data de Corte/Hoje)
  async findLatestInPeriod(workspaceId: string, startDate: Date, cutOffDate: Date) {
    return await prisma.transaction.findMany({
      where: {
        workspaceId,
        date: {
          gte: startDate,
          lte: cutOffDate,
        },
      },
      orderBy: { date: 'desc' }, // Mais recentes primeiro
      take: 5, // Limite de 5 itens para não poluir a home
      include: {
        category: { select: { name: true, icon: true, color: true } },
      },
    });
  }

  // 10. Futuro: Busca despesas A VENCER no período (Contas a Pagar)
  // REGRAS:
  // 1. Somente DESPESAS
  // 2. Somente dentro do mês selecionado (lte: endDate)
  // 3. NÃO inclui Cartão de Crédito (pois cartão se paga na fatura)
  async findUpcomingExpenses(workspaceId: string, cutOffDate: Date, endDate: Date) {
    return await prisma.transaction.findMany({
      where: {
        workspaceId,
        type: 'EXPENSE',

        // 👇 NOVO FILTRO: Exclui cartão de crédito
        paymentMethod: {
          not: 'CREDIT_CARD',
        },

        date: {
          gt: cutOffDate, // Maior que hoje (ou data de corte)
          lte: endDate, // Menor ou igual ao fim do MÊS SELECIONADO (Trava o mês)
        },
      },
      orderBy: { date: 'asc' },
      include: {
        category: { select: { name: true, icon: true, color: true } },
      },
    });
  }
}
