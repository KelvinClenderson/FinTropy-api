import { endOfMonth, startOfMonth } from 'date-fns';
import { TransactionsRepository } from '../../repositories/transactions.repository';

interface IRequest {
  workspaceId: string;
  month: number;
  year: number;
}

export class GetDashboardStatsService {
  constructor(private transactionsRepository: TransactionsRepository) {}

  async execute({ workspaceId, month, year }: IRequest) {
    // 1. Define o intervalo do mês (Dia 1 até o último dia)
    const dateReference = new Date(year, month - 1); // JS conta meses de 0 a 11
    const startDate = startOfMonth(dateReference);
    const endDate = endOfMonth(dateReference);

    // 2. Busca TODAS as transações do período (Unified Query)
    // Isso traz gastos de todos os membros do workspace
    const transactions = await this.transactionsRepository.findByWorkspaceAndPeriod(
      workspaceId,
      startDate,
      endDate,
    );

    // 3. Calculadora de Totais
    let totalIncome = 0; // Receitas
    let totalExpense = 0; // Despesas
    let totalInvestments = 0; // Investimentos

    // Formatamos as transações para garantir que 'amount' seja número e somamos
    const formattedTransactions = transactions.map((t) => {
      const amount = Number(t.amount); // Converte de Prisma Decimal para Number

      // Soma nos baldes corretos
      if (t.type === 'DEPOSIT') {
        totalIncome += amount;
      } else if (t.type === 'EXPENSE') {
        totalExpense += amount;
      } else if (t.type === 'INVESTMENT') {
        totalInvestments += amount;
      }

      return {
        ...t,
        amount,
      };
    });

    // 4. Saldo do Período
    // Lógica: Ganhou - (Gastou + Investiu)
    const periodBalance = totalIncome - (totalExpense + totalInvestments);

    return {
      summary: {
        income: Number(totalIncome.toFixed(2)),
        expense: Number(totalExpense.toFixed(2)),
        investment: Number(totalInvestments.toFixed(2)),
        balance: Number(periodBalance.toFixed(2)),
      },
      transactions: formattedTransactions, // Lista completa para o extrato
    };
  }
}
