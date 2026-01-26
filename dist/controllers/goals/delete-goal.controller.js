"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteGoalController = void 0;
const zod_1 = require("zod");
const goals_repository_1 = require("../../repositories/goals.repository");
const delete_goal_service_1 = require("../../services/goals/delete-goal.service");
class DeleteGoalController {
    async handle(req, res) {
        const paramSchema = zod_1.z.object({ id: zod_1.z.string().cuid().or(zod_1.z.string().uuid()) });
        const querySchema = zod_1.z.object({ workspaceId: zod_1.z.string().min(1) });
        try {
            const { id } = paramSchema.parse(req.params);
            const { workspaceId } = querySchema.parse(req.query);
            const repo = new goals_repository_1.GoalsRepository();
            const service = new delete_goal_service_1.DeleteGoalService(repo);
            await service.execute({ id, workspaceId });
            return res.status(204).send();
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.DeleteGoalController = DeleteGoalController;
