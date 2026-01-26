import { TransactionPaymentMethod, TransactionType } from '@prisma/client';
import { endOfMonth, format, getDate, startOfDay } from 'date-fns';
import { prisma } from '../../lib/prisma';

interface IRequest {
  workspaceId: string;
}

export class GetUpcomingBillsService {
  async execute({ workspaceId }: IRequest) {
    const today = startOfDay(new Date());
    const lastDayOfMonth = endOfMonth(today);
    const currentDay = getDate(today);
    const currentMonthStr = format(today, 'yyyy-MM');

    // ====================================================
    // 1. BUSCA TRANSAÇÕES REAIS (Manuais ou já processadas)
    // ====================================================
    // Busca tudo que já existe na tabela de transações para este mês (futuro/hoje)
    const realTransactions = await prisma.transaction.findMany({
      where: {
        workspaceId,
        type: TransactionType.EXPENSE,
        paymentMethod: {
          not: TransactionPaymentMethod.CREDIT_CARD, // Ignora cartão (fatura)
        },
        date: {
          gte: today, // De hoje...
          lte: lastDayOfMonth, // ...até o fim do mês
        },
      },
      include: {
        category: {
          select: { id: true, name: true, icon: true, color: true },
        },
      },
    });

    // Mapeia para formato unificado
    const formattedRealTransactions = realTransactions.map((tx) => ({
      id: tx.id,
      name: tx.name,
      amount: Number(tx.amount),
      date: tx.date,
      type: tx.type,
      paymentMethod: tx.paymentMethod,
      category: tx.category,
      categoryId: tx.categoryId,
      workspaceId: tx.workspaceId,
      payee: tx.payee,
      isRecurring: !!tx.recurringTransactionId, // Marca se veio de uma recorrência
      source: 'REAL', // Flag para debug se necessário
    }));

    // ====================================================
    // 2. BUSCA RECORRÊNCIAS VIRTUAIS (Ainda não geradas)
    // ====================================================
    // Busca regras fixas que vencem este mês mas ainda não foram processadas pelo Cron
    const recurringCandidates = await prisma.recurringTransaction.findMany({
      where: {
        workspaceId,
        type: TransactionType.EXPENSE,
        paymentMethod: {
          not: TransactionPaymentMethod.CREDIT_CARD,
        },
        // Regra de data: Dia do pagamento é hoje ou futuro, mas dentro do mês (logica do dia <= ultimo dia é implicita pois dayOfPayment vai até 31)
        dayOfPayment: {
          gte: currentDay,
        },
        // Regra de Status: Ainda não foi processada neste mês
        OR: [{ lastProcessedMonth: { not: currentMonthStr } }, { lastProcessedMonth: null }],
        // Regra de Validade: Data de início já passou e Data fim (se houver) ainda é válida
        startDate: { lte: today },
        AND: [{ OR: [{ endDate: null }, { endDate: { gte: today } }] }],
      },
      include: {
        category: {
          select: { id: true, name: true, icon: true, color: true },
        },
      },
    });

    // Mapeia recorrências para o formato de transação ("Virtual")
    const formattedVirtualTransactions = recurringCandidates.map((rec) => {
      const transactionDate = new Date(today);
      transactionDate.setDate(rec.dayOfPayment); // Define a data para o dia do pagamento deste mês

      // Segurança: Se por algum motivo o dia calculado for maior que o ultimo dia do mês (ex: 31 em Fev), o JS joga pro proximo mês.
      // Nesse caso, ajustamos para o último dia do mês atual.
      if (transactionDate > lastDayOfMonth) {
        transactionDate.setDate(lastDayOfMonth.getDate());
        transactionDate.setMonth(lastDayOfMonth.getMonth());
      }

      return {
        id: `virtual-${rec.id}`, // ID provisório para o frontend não quebrar
        name: rec.name,
        amount: Number(rec.amount),
        date: transactionDate,
        type: rec.type,
        paymentMethod: rec.paymentMethod,
        category: rec.category,
        categoryId: rec.categoryId,
        workspaceId: rec.workspaceId,
        payee: rec.payee,
        isRecurring: true,
        source: 'VIRTUAL',
      };
    });

    // ====================================================
    // 3. UNIFICA E ORDENA
    // ====================================================

    // Combina as listas
    const allBills = [...formattedRealTransactions, ...formattedVirtualTransactions];

    // Ordena por data (mais próximo primeiro)
    return allBills.sort((a, b) => a.date.getTime() - b.date.getTime());
  }
}
