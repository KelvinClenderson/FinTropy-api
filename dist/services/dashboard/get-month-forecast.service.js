"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMonthForecastService = void 0;
const client_1 = require("@prisma/client"); // 👈 CORREÇÃO: Importar apenas TransactionType
const date_fns_1 = require("date-fns");
class GetMonthForecastService {
    constructor(transactionsRepository, recurringTransactionsRepository) {
        this.transactionsRepository = transactionsRepository;
        this.recurringTransactionsRepository = recurringTransactionsRepository;
    }
    async execute({ workspaceId, month, year }) {
        // 1. Definição de datas
        const dateReference = new Date(year, month - 1); // JS Month é 0-indexado
        const startDate = (0, date_fns_1.startOfMonth)(dateReference);
        const endDate = (0, date_fns_1.endOfMonth)(dateReference);
        const daysInMonth = (0, date_fns_1.getDaysInMonth)(dateReference);
        // Data de "Hoje" para saber onde cortar o realizado vs projetado
        const today = new Date();
        const currentDay = (0, date_fns_1.getDate)(today);
        // Verifica se estamos vendo um mês passado, futuro ou atual
        const isPastMonth = today > endDate;
        const isFutureMonth = today < startDate;
        // Define o dia de corte efetivo (Até onde é "realizado")
        let effectiveToday;
        if (isPastMonth) {
            effectiveToday = daysInMonth; // Mês todo é realizado
        }
        else if (isFutureMonth) {
            effectiveToday = 0; // Nada é realizado, tudo é projeção
        }
        else {
            effectiveToday = currentDay; // Mês atual: mistura até hoje
        }
        // 2. Busca Dados
        // Transações reais (para a parte realizada)
        const transactions = await this.transactionsRepository.findByWorkspaceAndPeriod(workspaceId, startDate, endDate);
        // Recorrências (para a parte projetada)
        const recurring = await this.recurringTransactionsRepository.findByWorkspace(workspaceId);
        // 3. Processamento Dia a Dia
        let currentBalance = 0;
        let totalRealizedExpenses = 0;
        const chartData = [];
        for (let day = 1; day <= daysInMonth; day++) {
            const isProjected = day > effectiveToday;
            let dailyChange = 0;
            if (!isProjected) {
                // --- MODO REALIZADO ---
                // Soma o que realmente aconteceu naquele dia
                const dayTransactions = transactions.filter((t) => (0, date_fns_1.getDate)(t.date) === day);
                const dayIncome = dayTransactions
                    .filter((t) => t.type === client_1.TransactionType.DEPOSIT)
                    .reduce((acc, t) => acc + Number(t.amount), 0);
                const dayExpense = dayTransactions
                    .filter((t) => t.type === client_1.TransactionType.EXPENSE || t.type === client_1.TransactionType.INVESTMENT)
                    .reduce((acc, t) => acc + Number(t.amount), 0);
                dailyChange = dayIncome - dayExpense;
                totalRealizedExpenses += dayExpense;
            }
            else {
                // --- MODO PROJETADO ---
                // Estima com base nas contas fixas
                // Data simulada para verificar validade da recorrência
                const simulationDate = new Date(year, month - 1, day);
                const dayRecurring = recurring.filter((r) => {
                    // É o dia do pagamento?
                    if (r.dayOfPayment !== day)
                        return false;
                    // A recorrência já começou?
                    if ((0, date_fns_1.isBefore)(simulationDate, r.startDate))
                        return false;
                    // A recorrência já acabou?
                    if (r.endDate && (0, date_fns_1.isAfter)(simulationDate, r.endDate))
                        return false;
                    return true;
                });
                const projIncome = dayRecurring
                    // 👇 CORREÇÃO: Usar TransactionType
                    .filter((r) => r.type === client_1.TransactionType.DEPOSIT)
                    .reduce((acc, r) => acc + Number(r.amount), 0);
                const projExpense = dayRecurring
                    // 👇 CORREÇÃO: Usar TransactionType
                    .filter((r) => r.type === client_1.TransactionType.EXPENSE || r.type === client_1.TransactionType.INVESTMENT)
                    .reduce((acc, r) => acc + Number(r.amount), 0);
                dailyChange = projIncome - projExpense;
            }
            currentBalance += dailyChange;
            chartData.push({
                day,
                balance: Number(currentBalance.toFixed(2)),
                status: isProjected ? 'projected' : 'realized',
            });
        }
        // 4. Estatísticas Finais
        const projectedBalance = chartData[chartData.length - 1].balance;
        const avgDailySpend = effectiveToday > 0 ? totalRealizedExpenses / effectiveToday : 0;
        const daysRemaining = daysInMonth - effectiveToday;
        const monthProgress = (effectiveToday / daysInMonth) * 100;
        return {
            chartData,
            stats: {
                projectedBalance: Number(projectedBalance.toFixed(2)),
                avgDailySpend: Number(avgDailySpend.toFixed(2)),
                daysRemaining: Math.max(0, daysRemaining),
                monthProgress: Number(monthProgress.toFixed(2)),
            },
        };
    }
}
exports.GetMonthForecastService = GetMonthForecastService;
