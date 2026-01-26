"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetBudgetDashboardService = void 0;
const date_fns_1 = require("date-fns");
class GetBudgetDashboardService {
    constructor(budgetsRepository, categoriesRepository) {
        this.budgetsRepository = budgetsRepository;
        this.categoriesRepository = categoriesRepository;
    }
    async execute({ workspaceId, month, year }) {
        const monthIndex = parseInt(month) - 1;
        const yearNum = parseInt(year);
        const date = new Date(yearNum, monthIndex, 1);
        const startDate = (0, date_fns_1.startOfMonth)(date);
        const endDate = (0, date_fns_1.endOfMonth)(date);
        // Formato "YYYY-MM" para buscar no banco
        const monthStr = `${year}-${month.padStart(2, '0')}`;
        // 1. Busca todas as categorias
        const categories = await this.categoriesRepository.findByWorkspace(workspaceId);
        // 2. Busca orçamentos definidos para o mês
        const budgets = await this.budgetsRepository.findBudgetsByMonth(workspaceId, monthStr);
        // 3. Busca gastos reais agrupados
        const expenses = await this.budgetsRepository.getExpensesByCategoryInPeriod(workspaceId, startDate, endDate);
        // 4. Processamento e Cruzamento (Igual ao Next.js)
        const data = categories.map((category) => {
            const budget = budgets.find((b) => b.categoryId === category.id);
            const expense = expenses.find((e) => e.categoryId === category.id);
            const amountSpent = Number(expense?._sum.amount || 0);
            const budgetAmount = budget ? Number(budget.amount) : null;
            const percentage = budgetAmount ? Math.min((amountSpent / budgetAmount) * 100, 100) : 0;
            return {
                categoryId: category.id,
                categoryName: category.name,
                categoryIcon: category.icon,
                categoryColor: category.color,
                budgetAmount, // null se não tiver orçamento
                amountSpent,
                percentage,
                budgetId: budget?.id,
            };
        });
        const definedBudgets = data.filter((item) => item.budgetAmount !== null);
        const undefinedBudgets = data.filter((item) => item.budgetAmount === null);
        return {
            definedBudgets,
            undefinedBudgets,
        };
    }
}
exports.GetBudgetDashboardService = GetBudgetDashboardService;
