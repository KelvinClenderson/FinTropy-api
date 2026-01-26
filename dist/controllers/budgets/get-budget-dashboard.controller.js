"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetBudgetDashboardController = void 0;
const zod_1 = require("zod");
const budgets_repository_1 = require("../../repositories/budgets.repository");
const categories_repository_1 = require("../../repositories/categories.repository");
const get_budget_dashboard_service_1 = require("../../services/budgets/get-budget-dashboard.service");
class GetBudgetDashboardController {
    async handle(req, res) {
        const querySchema = zod_1.z.object({
            workspaceId: zod_1.z.string().min(1),
            month: zod_1.z.string().length(2), // "01", "12"
            year: zod_1.z.string().length(4), // "2024"
        });
        try {
            const { workspaceId, month, year } = querySchema.parse(req.query);
            const budgetsRepo = new budgets_repository_1.BudgetsRepository();
            const categoriesRepo = new categories_repository_1.CategoriesRepository();
            const service = new get_budget_dashboard_service_1.GetBudgetDashboardService(budgetsRepo, categoriesRepo);
            const data = await service.execute({ workspaceId, month, year });
            return res.json(data);
        }
        catch (err) {
            if (err instanceof zod_1.z.ZodError)
                return res.status(400).json({ issues: err.format() });
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.GetBudgetDashboardController = GetBudgetDashboardController;
