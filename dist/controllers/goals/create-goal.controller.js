"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateGoalController = void 0;
const zod_1 = require("zod");
const goals_repository_1 = require("../../repositories/goals.repository");
const create_goal_service_1 = require("../../services/goals/create-goal.service");
class CreateGoalController {
    async handle(req, res) {
        const bodySchema = zod_1.z.object({
            name: zod_1.z.string().min(1),
            targetAmount: zod_1.z.number().positive(),
            deadline: zod_1.z.string().datetime(),
            workspaceId: zod_1.z.string().cuid().or(zod_1.z.string().uuid()),
        });
        try {
            const data = bodySchema.parse(req.body);
            const repo = new goals_repository_1.GoalsRepository();
            const service = new create_goal_service_1.CreateGoalService(repo);
            const goal = await service.execute(data);
            return res.status(201).json(goal);
        }
        catch (err) {
            if (err instanceof zod_1.z.ZodError)
                return res.status(400).json({ issues: err.format() });
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.CreateGoalController = CreateGoalController;
