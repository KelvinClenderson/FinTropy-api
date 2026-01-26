"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAnnualReportController = void 0;
const zod_1 = require("zod");
const transactions_repository_1 = require("../../repositories/transactions.repository");
const get_annual_report_service_1 = require("../../services/dashboard/get-annual-report.service");
class GetAnnualReportController {
    async handle(req, res) {
        const querySchema = zod_1.z.object({
            workspaceId: zod_1.z.string().min(1, 'Workspace ID obrigatório'),
            year: zod_1.z
                .string()
                .optional()
                .default(() => new Date().getFullYear().toString())
                .transform(Number),
        });
        try {
            const { workspaceId, year } = querySchema.parse(req.query);
            const repo = new transactions_repository_1.TransactionsRepository();
            const service = new get_annual_report_service_1.GetAnnualReportService(repo);
            const report = await service.execute({ workspaceId, year });
            return res.json(report);
        }
        catch (err) {
            if (err instanceof zod_1.z.ZodError) {
                return res.status(400).json({ issues: err.format() });
            }
            return res.status(500).json({ error: err.message });
        }
    }
}
exports.GetAnnualReportController = GetAnnualReportController;
