import { endOfMonth, isBefore, isSameMonth, startOfMonth } from 'date-fns';
import { TransactionsRepository } from '../../repositories/transactions.repository';

interface IRequest {
  workspaceId: string;
  month: number;
  year: number;
}

export class GetDashboardStatsService {
  constructor(private transactionsRepository: TransactionsRepository) {}

  async execute({ workspaceId, month, year }: IRequest) {
    // 1. Definir intervalo do mês selecionado
    const dateReference = new Date(year, month - 1);
    const startDate = startOfMonth(dateReference);
    const endDate = endOfMonth(dateReference);

    // 2. Definir a "Data de Corte" (Agora)
    const today = new Date();

    // Lógica da Data de Corte:
    // Começamos assumindo que o corte é o final do mês selecionado (para meses passados)
    let cutOffDate = endDate;

    // Se estivermos olhando para o mês atual, o corte é AGORA.
    if (isSameMonth(today, dateReference)) {
      cutOffDate = today;
    }
    // Se o mês selecionado for no futuro (start > today), o corte é antes do start.
    // Isso fará com que 'Latest' venha vazio e 'Upcoming' pegue tudo.
    else if (isBefore(today, startDate)) {
      cutOffDate = new Date(startDate.getTime() - 1); // 1ms antes do começo
    }

    // 3. Buscar Dados
    const [balanceStats, expensesByCategory, latestTransactions, upcomingExpenses] =
      await Promise.all([
        // Resumo Financeiro (Saldo) - Pega o mês inteiro
        this.transactionsRepository.getBalanceStats(workspaceId, startDate, endDate),

        // Gráfico de Pizza (Categorias) - Pega o mês inteiro
        this.transactionsRepository.getExpensesByCategory(workspaceId, startDate, endDate),

        // Lista "Últimas Transações" (Histórico até o momento)
        this.transactionsRepository.findLatestInPeriod(workspaceId, startDate, cutOffDate),

        // Lista "Contas a Pagar" (Futuro a partir do momento)
        this.transactionsRepository.findUpcomingExpenses(workspaceId, cutOffDate, endDate),
      ]);

    // 4. Processar Balanço
    let income = 0;
    let expense = 0;
    let investment = 0;

    balanceStats.forEach((stat) => {
      const amount = stat._sum.amount ? Number(stat._sum.amount) : 0;
      if (stat.type === 'DEPOSIT') income += amount;
      if (stat.type === 'EXPENSE') expense += amount;
      if (stat.type === 'INVESTMENT') investment += amount;
    });
    const balance = income - expense;

    // 5. Processar Gráfico de Pizza
    const categoryIds = expensesByCategory.map((e) => e.categoryId);
    const categoriesInfo = await this.transactionsRepository.findCategoriesByIds(categoryIds);

    const expenseChartData = expensesByCategory
      .map((item) => {
        const category = categoriesInfo.find((c) => c.id === item.categoryId);
        const total = item._sum.amount ? Number(item._sum.amount) : 0;
        return {
          categoryId: item.categoryId,
          name: category?.name || 'Desconhecido',
          color: category?.color || '#ccc',
          total,
        };
      })
      .sort((a, b) => b.total - a.total);

    // 6. Retorno
    return {
      summary: {
        balance,
        income,
        expense,
        investment,
      },
      expenseChart: expenseChartData,
      latestTransactions, // O que já aconteceu
      upcomingExpenses, // O que vai acontecer (Contas a Pagar)
    };
  }
}
