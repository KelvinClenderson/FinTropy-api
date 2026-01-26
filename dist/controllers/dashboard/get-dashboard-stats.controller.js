"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDashboardStatsController = void 0;
const zod_1 = require("zod");
const transactions_repository_1 = require("../../repositories/transactions.repository");
const get_dashboard_stats_service_1 = require("../../services/dashboard/get-dashboard-stats.service");
class GetDashboardStatsController {
    async handle(req, res) {
        const querySchema = zod_1.z.object({
            workspaceId: zod_1.z.string().cuid().or(zod_1.z.string().uuid()),
            month: zod_1.z.string().transform(Number),
            year: zod_1.z.string().transform(Number),
        });
        try {
            const { workspaceId, month, year } = querySchema.parse(req.query);
            const transactionsRepository = new transactions_repository_1.TransactionsRepository();
            const getDashboardStatsService = new get_dashboard_stats_service_1.GetDashboardStatsService(transactionsRepository);
            const stats = await getDashboardStatsService.execute({
                workspaceId,
                month,
                year,
            });
            return res.json(stats);
        }
        catch (err) {
            if (err instanceof zod_1.z.ZodError) {
                return res.status(400).json({ error: 'Parâmetros inválidos', details: err.format() });
            }
            return res.status(500).json({ error: 'Erro interno ao buscar dashboard' });
        }
    }
}
exports.GetDashboardStatsController = GetDashboardStatsController;
