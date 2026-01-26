"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateWorkspaceController = void 0;
const zod_1 = require("zod");
const create_workspace_service_1 = require("../../services/workspaces/create-workspace.service");
class CreateWorkspaceController {
    async handle(req, res) {
        const bodySchema = zod_1.z.object({
            name: zod_1.z.string().min(1, 'O nome do workspace é obrigatório.'),
        });
        try {
            const { name } = bodySchema.parse(req.body);
            const userId = req.user.id;
            const service = new create_workspace_service_1.CreateWorkspaceService();
            const workspace = await service.execute({
                name,
                userId,
            });
            return res.status(201).json(workspace);
        }
        catch (err) {
            if (err instanceof zod_1.z.ZodError) {
                return res.status(400).json({ issues: err.format() });
            }
            return res.status(500).json({ error: err.message });
        }
    }
}
exports.CreateWorkspaceController = CreateWorkspaceController;
