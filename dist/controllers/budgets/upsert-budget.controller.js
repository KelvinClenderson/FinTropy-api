"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBudgetController = void 0;
const zod_1 = require("zod");
const budgets_repository_1 = require("../../repositories/budgets.repository");
const upsert_budget_service_1 = require("../../services/budgets/upsert-budget.service");
class UpdateBudgetController {
    async handle(req, res) {
        const paramSchema = zod_1.z.object({ id: zod_1.z.string().cuid().or(zod_1.z.string().uuid()) });
        const bodySchema = zod_1.z.object({
            workspaceId: zod_1.z.string().min(1), // Necessário para validação de segurança
            amount: zod_1.z.number().positive(),
            isRecurring: zod_1.z.boolean().default(false).optional(),
        });
        try {
            const { id } = paramSchema.parse(req.params);
            const { workspaceId, amount, isRecurring } = bodySchema.parse(req.body);
            const repo = new budgets_repository_1.BudgetsRepository();
            const service = new upsert_budget_service_1.UpdateBudgetService(repo);
            const budget = await service.execute({ id, workspaceId, amount, isRecurring });
            return res.json(budget);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.UpdateBudgetController = UpdateBudgetController;
