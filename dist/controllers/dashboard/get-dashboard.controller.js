"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDashboardController = void 0;
const zod_1 = require("zod");
const transactions_repository_1 = require("../../repositories/transactions.repository");
const get_dashboard_stats_service_1 = require("../../services/dashboard/get-dashboard-stats.service");
class GetDashboardController {
    async handle(req, res) {
        const querySchema = zod_1.z.object({
            month: zod_1.z.coerce.number().min(1).max(12),
            year: zod_1.z.coerce.number().min(2000),
            workspaceId: zod_1.z.string().min(1),
        });
        try {
            const { month, year, workspaceId } = querySchema.parse(req.query);
            const repo = new transactions_repository_1.TransactionsRepository();
            const service = new get_dashboard_stats_service_1.GetDashboardStatsService(repo);
            const stats = await service.execute({
                workspaceId,
                month,
                year,
            });
            return res.json(stats);
        }
        catch (err) {
            if (err instanceof zod_1.z.ZodError) {
                return res.status(400).json({ issues: err.format() });
            }
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.GetDashboardController = GetDashboardController;
