"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteWorkspaceController = void 0;
const zod_1 = require("zod");
const workspaces_repository_1 = require("../../repositories/workspaces.repository");
const delete_workspace_service_1 = require("../../services/workspaces/delete-workspace.service");
class DeleteWorkspaceController {
    async handle(req, res) {
        const paramSchema = zod_1.z.object({ id: zod_1.z.string().cuid().or(zod_1.z.string().uuid()) });
        try {
            const { id } = paramSchema.parse(req.params);
            const userId = req.user.id;
            const repo = new workspaces_repository_1.WorkspacesRepository();
            const service = new delete_workspace_service_1.DeleteWorkspaceService(repo);
            await service.execute({ id, userId });
            return res.status(204).send();
        }
        catch (err) {
            if (err.message.includes('Apenas administradores')) {
                return res.status(403).json({ error: err.message });
            }
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.DeleteWorkspaceController = DeleteWorkspaceController;
