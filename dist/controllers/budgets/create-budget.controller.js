"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBudgetController = void 0;
const zod_1 = require("zod");
const budgets_repository_1 = require("../../repositories/budgets.repository");
const create_budget_service_1 = require("../../services/budgets/create-budget.service");
class CreateBudgetController {
    async handle(req, res) {
        const bodySchema = zod_1.z.object({
            workspaceId: zod_1.z.string().cuid().or(zod_1.z.string().uuid()),
            categoryId: zod_1.z.string().cuid().or(zod_1.z.string().uuid()),
            month: zod_1.z.string().regex(/^\d{4}-\d{2}$/),
            amount: zod_1.z.number().positive(),
            isRecurring: zod_1.z.boolean().default(false).optional(),
        });
        try {
            const data = bodySchema.parse(req.body);
            const repo = new budgets_repository_1.BudgetsRepository();
            const service = new create_budget_service_1.CreateBudgetService(repo);
            const budget = await service.execute(data);
            return res.status(201).json(budget);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.CreateBudgetController = CreateBudgetController;
