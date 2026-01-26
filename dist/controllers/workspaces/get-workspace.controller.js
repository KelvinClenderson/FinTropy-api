"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetWorkspaceController = void 0;
const zod_1 = require("zod");
const workspaces_repository_1 = require("../../repositories/workspaces.repository");
const get_workspace_service_1 = require("../../services/workspaces/get-workspace.service");
class GetWorkspaceController {
    async handle(req, res) {
        const paramSchema = zod_1.z.object({
            id: zod_1.z.string().cuid().or(zod_1.z.string().uuid()),
        });
        try {
            const { id } = paramSchema.parse(req.params);
            const userId = req.user.id; // Vem do token
            const repo = new workspaces_repository_1.WorkspacesRepository();
            const service = new get_workspace_service_1.GetWorkspaceService(repo);
            const workspace = await service.execute({ workspaceId: id, userId });
            return res.json(workspace);
        }
        catch (err) {
            if (err.message.includes('Acesso negado'))
                return res.status(403).json({ error: err.message });
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.GetWorkspaceController = GetWorkspaceController;
