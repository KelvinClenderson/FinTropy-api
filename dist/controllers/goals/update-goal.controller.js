"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateGoalController = void 0;
const zod_1 = require("zod");
const goals_repository_1 = require("../../repositories/goals.repository");
const update_goal_service_1 = require("../../services/goals/update-goal.service");
class UpdateGoalController {
    async handle(req, res) {
        const paramSchema = zod_1.z.object({ id: zod_1.z.string().cuid().or(zod_1.z.string().uuid()) });
        const querySchema = zod_1.z.object({ workspaceId: zod_1.z.string().min(1) });
        const bodySchema = zod_1.z.object({
            name: zod_1.z.string().optional(),
            targetAmount: zod_1.z.number().positive().optional(),
            deadline: zod_1.z.string().datetime().optional(),
        });
        try {
            const { id } = paramSchema.parse(req.params);
            const { workspaceId } = querySchema.parse(req.query);
            const data = bodySchema.parse(req.body);
            const repo = new goals_repository_1.GoalsRepository();
            const service = new update_goal_service_1.UpdateGoalService(repo);
            const goal = await service.execute({ id, workspaceId, ...data });
            return res.json(goal);
        }
        catch (err) {
            if (err instanceof zod_1.z.ZodError)
                return res.status(400).json({ issues: err.format() });
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.UpdateGoalController = UpdateGoalController;
