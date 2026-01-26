"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateWorkspaceController = void 0;
const zod_1 = require("zod");
const workspaces_repository_1 = require("../../repositories/workspaces.repository");
const update_workspace_service_1 = require("../../services/workspaces/update-workspace.service");
class UpdateWorkspaceController {
    async handle(req, res) {
        const paramSchema = zod_1.z.object({ id: zod_1.z.string().cuid().or(zod_1.z.string().uuid()) });
        const bodySchema = zod_1.z.object({
            name: zod_1.z.string().min(1),
        });
        try {
            const { id } = paramSchema.parse(req.params);
            const { name } = bodySchema.parse(req.body);
            const userId = req.user.id;
            const repo = new workspaces_repository_1.WorkspacesRepository();
            const service = new update_workspace_service_1.UpdateWorkspaceService(repo);
            const workspace = await service.execute({ id, userId, name });
            return res.json(workspace);
        }
        catch (err) {
            if (err.message.includes('Apenas administradores'))
                return res.status(403).json({ error: err.message });
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.UpdateWorkspaceController = UpdateWorkspaceController;
