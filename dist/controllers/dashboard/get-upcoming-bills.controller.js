"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUpcomingBillsController = void 0;
const zod_1 = require("zod");
const get_upcoming_bills_service_1 = require("../../services/dashboard/get-upcoming-bills.service");
class GetUpcomingBillsController {
    async handle(req, res) {
        const querySchema = zod_1.z.object({
            workspaceId: zod_1.z.string().min(1, 'Workspace ID é obrigatório'),
        });
        try {
            const { workspaceId } = querySchema.parse(req.query);
            const service = new get_upcoming_bills_service_1.GetUpcomingBillsService();
            const bills = await service.execute({ workspaceId });
            return res.json(bills);
        }
        catch (err) {
            if (err instanceof zod_1.z.ZodError) {
                return res.status(400).json({ issues: err.format() });
            }
            return res.status(500).json({ error: err.message });
        }
    }
}
exports.GetUpcomingBillsController = GetUpcomingBillsController;
