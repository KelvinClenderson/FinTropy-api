import { endOfMonth, getDate, startOfMonth } from 'date-fns';
import { TransactionsRepository } from '../../repositories/transactions.repository';

interface IRequest {
  workspaceId: string;
  month: number;
  year: number;
}

export class GetDashboardStatsService {
  constructor(private transactionsRepository: TransactionsRepository) {}

  async execute({ workspaceId, month, year }: IRequest) {
    const dateReference = new Date(year, month - 1);
    const startDate = startOfMonth(dateReference);
    const endDate = endOfMonth(dateReference);

    // 1. Busca Transações
    const transactions = await this.transactionsRepository.findByWorkspaceAndPeriod(
      workspaceId,
      startDate,
      endDate,
    );

    // 2. Variáveis de Acumulação
    let totalIncome = 0;
    let totalExpense = 0;
    let totalInvestments = 0;

    // Mapas para gráficos
    const expensesByCategoryMap = new Map<string, number>();
    const daysMap = new Map<number, { income: number; expenses: number }>();

    // Inicializa dias do mês (para o gráfico de área não ter buracos)
    const daysInMonth = endDate.getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      daysMap.set(i, { income: 0, expenses: 0 });
    }

    // 3. Processamento Único (Itera apenas uma vez sobre as transações)
    for (const t of transactions) {
      const amount = Number(t.amount);
      const day = getDate(t.date);

      // Totais Gerais
      if (t.type === 'DEPOSIT') {
        totalIncome += amount;

        // Gráfico Diário
        const dayStat = daysMap.get(day) || { income: 0, expenses: 0 };
        dayStat.income += amount;
        daysMap.set(day, dayStat);
      } else if (t.type === 'EXPENSE') {
        totalExpense += amount;

        // Gráfico Diário
        const dayStat = daysMap.get(day) || { income: 0, expenses: 0 };
        dayStat.expenses += amount;
        daysMap.set(day, dayStat);

        // Gráfico de Pizza (Categoria)
        if (t.category) {
          const currentCatTotal = expensesByCategoryMap.get(t.category.name) || 0;
          expensesByCategoryMap.set(t.category.name, currentCatTotal + amount);
        }
      } else if (t.type === 'INVESTMENT') {
        totalInvestments += amount;

        // No gráfico diário, investimentos contam como saída ou neutro?
        // No seu front (get-dashboard), investment conta como saída no cálculo de saldo, mas não no gráfico de expenses.
        // Vamos manter separado aqui.
      }
    }

    // 4. Formata Gráfico de Pizza (Expenses per Category)
    const totalExpensePerCategory = Array.from(expensesByCategoryMap.entries())
      .map(([category, totalAmount]) => ({
        category,
        totalAmount,
        percentageOfTotal: totalExpense > 0 ? Math.round((totalAmount / totalExpense) * 100) : 0,
        // Nota: A cor idealmente viria do banco, mas aqui simplificamos.
        // Se precisar, o findByWorkspaceAndPeriod já traz t.category.color.
        // Para fazer isso perfeito, o map acima deveria guardar o objeto categoria inteiro, não só o nome.
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);

    // 5. Formata Gráfico Diário
    const days = Array.from(daysMap.entries()).map(([day, totals]) => ({
      day,
      income: totals.income,
      expenses: totals.expenses,
    }));

    // 6. Últimas Transações (Já vem ordenado do repository, pegamos as 5 primeiras)
    const lastTransactions = transactions.slice(0, 5).map((t) => ({
      ...t,
      amount: Number(t.amount),
    }));

    const balance = totalIncome - (totalExpense + totalInvestments);

    return {
      balance,
      depositsTotal: totalIncome,
      expensesTotal: totalExpense,
      investmentsTotal: totalInvestments,
      totalExpensePerCategory, // Novo
      days, // Novo
      lastTransactions, // Novo
    };
  }
}
