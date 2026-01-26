import { TransactionType } from '@prisma/client';
import { endOfYear, getMonth, startOfYear } from 'date-fns';
import { TransactionsRepository } from '../../repositories/transactions.repository';

interface IRequest {
  workspaceId: string;
  year: number;
}

type AnnualDataPoint = {
  month: string;
  monthIndex: number;
  deposits: number;
  expenses: number;
  investments: number;
};

const MONTH_NAMES = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

export class GetAnnualReportService {
  constructor(private transactionsRepository: TransactionsRepository) {}

  async execute({ workspaceId, year }: IRequest) {
    const startDate = startOfYear(new Date(year, 0, 1));
    const endDate = endOfYear(new Date(year, 11, 31));

    // 1. Busca todas as transações do ano
    // Reutilizamos o método que já criamos ou usamos o findByWorkspaceAndPeriod
    const transactions = await this.transactionsRepository.findByWorkspaceAndPeriod(
      workspaceId,
      startDate,
      endDate,
    );

    // 2. Inicializa os 12 meses zerados
    const monthlyData: AnnualDataPoint[] = MONTH_NAMES.map((month, index) => ({
      month,
      monthIndex: index,
      deposits: 0,
      expenses: 0,
      investments: 0,
    }));

    // 3. Agrega os valores
    for (const tx of transactions) {
      const monthIndex = getMonth(tx.date); // 0 a 11
      const amount = Number(tx.amount); // Converte Decimal para Number

      if (tx.type === TransactionType.DEPOSIT) {
        monthlyData[monthIndex].deposits += amount;
      } else if (tx.type === TransactionType.EXPENSE) {
        monthlyData[monthIndex].expenses += amount;
      } else if (tx.type === TransactionType.INVESTMENT) {
        monthlyData[monthIndex].investments += amount;
      }
    }

    // 4. Calcula Totais Anuais
    const totalDeposits = monthlyData.reduce((sum, m) => sum + m.deposits, 0);
    const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0);
    const totalInvestments = monthlyData.reduce((sum, m) => sum + m.investments, 0);
    const totalBalance = totalDeposits - totalExpenses - totalInvestments;

    return {
      year,
      monthlyData,
      totalDeposits: Number(totalDeposits.toFixed(2)),
      totalExpenses: Number(totalExpenses.toFixed(2)),
      totalInvestments: Number(totalInvestments.toFixed(2)),
      totalBalance: Number(totalBalance.toFixed(2)),
    };
  }
}
