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
    // Definir o intervalo do mês (do dia 1 à 00:00 até o último dia às 23:59)
    // month - 1 porque o Javascript conta meses de 0 a 11
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
      orderBy: { date: 'desc' }, // Ordenar por data (mais recente no topo)
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
        creditCard: { select: { id: true, name: true } }, // Mostra qual cartão foi usado
        parent: { select: { id: true, name: true } }, // Se for parcela, mostra a pai
      },
    });
  }

  // ============================================================
  // AUXILIARES
  // ============================================================

  // 9. Busca Cartão Específico (Essencial para lógica de fechamento de fatura)
  async findCreditCardById(id: string) {
    return await prisma.creditCard.findUnique({
      where: { id },
    });
  }

  // 10. Busca detalhes das categorias (Usado no Dashboard)
  async findCategoriesByIds(ids: string[]) {
    return await prisma.category.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, color: true, icon: true },
    });
  }

  // ============================================================
  // MÉTODOS DO DASHBOARD (Estatísticas)
  // ============================================================

  // 11. Agrupamento para Cards de Resumo (Receita, Despesa, Saldo, Investimento)
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

  // 12. Agrupamento para Gráfico de Pizza (Despesas por Categoria)
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

  // 13. Histórico: Busca as últimas transações JÁ REALIZADAS (Data <= Hoje)
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
      take: 5,
      include: {
        category: { select: { name: true, icon: true, color: true } },
      },
    });
  }

  // 14. Futuro: Busca despesas A VENCER (Contas a Pagar)
  async findUpcomingExpenses(workspaceId: string, cutOffDate: Date, endDate: Date) {
    return await prisma.transaction.findMany({
      where: {
        workspaceId,
        type: 'EXPENSE',
        // Exclui cartão de crédito da lista de "boletos a pagar"
        paymentMethod: {
          not: 'CREDIT_CARD',
        },
        date: {
          gt: cutOffDate, // Estritamente maior que a data de corte (futuro)
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' }, // Mais próximas primeiro (cronológico)
      include: {
        category: { select: { name: true, icon: true, color: true } },
      },
    });
  }
}
