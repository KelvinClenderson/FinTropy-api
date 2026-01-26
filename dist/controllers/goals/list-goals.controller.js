"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListGoalsController = void 0;
const zod_1 = require("zod");
const goals_repository_1 = require("../../repositories/goals.repository");
const list_goals_service_1 = require("../../services/goals/list-goals.service");
class ListGoalsController {
    async handle(req, res) {
        const querySchema = zod_1.z.object({
            workspaceId: zod_1.z.string().min(1),
        });
        try {
            const { workspaceId } = querySchema.parse(req.query);
            const repo = new goals_repository_1.GoalsRepository();
            const service = new list_goals_service_1.ListGoalsService(repo);
            const goals = await service.execute({ workspaceId });
            return res.json(goals);
        }
        catch (err) {
            return res.status(400).json({ error: 'Workspace ID inválido.' });
        }
    }
}
exports.ListGoalsController = ListGoalsController;
