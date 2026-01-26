"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMonthForecastController = void 0;
const zod_1 = require("zod");
const recurring_transactions_repository_1 = require("../../repositories/recurring-transactions.repository");
const transactions_repository_1 = require("../../repositories/transactions.repository");
const get_month_forecast_service_1 = require("../../services/dashboard/get-month-forecast.service");
class GetMonthForecastController {
    async handle(req, res) {
        const querySchema = zod_1.z.object({
            workspaceId: zod_1.z.string().min(1, 'Workspace ID é obrigatório'),
            month: zod_1.z.coerce.number().min(1).max(12),
            year: zod_1.z.coerce.number().min(2000),
        });
        try {
            const { workspaceId, month, year } = querySchema.parse(req.query);
            const transactionsRepo = new transactions_repository_1.TransactionsRepository();
            const recurringRepo = new recurring_transactions_repository_1.RecurringTransactionsRepository();
            const service = new get_month_forecast_service_1.GetMonthForecastService(transactionsRepo, recurringRepo);
            const forecast = await service.execute({ workspaceId, month, year });
            return res.json(forecast);
        }
        catch (err) {
            if (err instanceof zod_1.z.ZodError) {
                return res.status(400).json({ issues: err.format() });
            }
            return res.status(500).json({ error: err.message });
        }
    }
}
exports.GetMonthForecastController = GetMonthForecastController;
