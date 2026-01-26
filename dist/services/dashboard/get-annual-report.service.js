"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAnnualReportService = void 0;
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
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
class GetAnnualReportService {
    constructor(transactionsRepository) {
        this.transactionsRepository = transactionsRepository;
    }
    async execute({ workspaceId, year }) {
        const startDate = (0, date_fns_1.startOfYear)(new Date(year, 0, 1));
        const endDate = (0, date_fns_1.endOfYear)(new Date(year, 11, 31));
        // 1. Busca todas as transações do ano
        // Reutilizamos o método que já criamos ou usamos o findByWorkspaceAndPeriod
        const transactions = await this.transactionsRepository.findByWorkspaceAndPeriod(workspaceId, startDate, endDate);
        // 2. Inicializa os 12 meses zerados
        const monthlyData = MONTH_NAMES.map((month, index) => ({
            month,
            monthIndex: index,
            deposits: 0,
            expenses: 0,
            investments: 0,
        }));
        // 3. Agrega os valores
        for (const tx of transactions) {
            const monthIndex = (0, date_fns_1.getMonth)(tx.date); // 0 a 11
            const amount = Number(tx.amount); // Converte Decimal para Number
            if (tx.type === client_1.TransactionType.DEPOSIT) {
                monthlyData[monthIndex].deposits += amount;
            }
            else if (tx.type === client_1.TransactionType.EXPENSE) {
                monthlyData[monthIndex].expenses += amount;
            }
            else if (tx.type === client_1.TransactionType.INVESTMENT) {
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
exports.GetAnnualReportService = GetAnnualReportService;
