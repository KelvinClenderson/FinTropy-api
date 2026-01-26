"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveMemberController = void 0;
const zod_1 = require("zod");
const workspaces_repository_1 = require("../../repositories/workspaces.repository");
const remove_member_service_1 = require("../../services/workspaces/remove-member.service");
class RemoveMemberController {
    async handle(req, res) {
        const paramSchema = zod_1.z.object({
            id: zod_1.z.string().cuid().or(zod_1.z.string().uuid()), // Workspace ID
            memberId: zod_1.z.string().cuid().or(zod_1.z.string().uuid()), // ID do Usuário a ser removido
        });
        try {
            const { id, memberId } = paramSchema.parse(req.params);
            const adminUserId = req.user.id;
            const repo = new workspaces_repository_1.WorkspacesRepository();
            const service = new remove_member_service_1.RemoveMemberService(repo);
            await service.execute({
                workspaceId: id,
                adminUserId,
                memberIdToRemove: memberId,
            });
            return res.status(204).send();
        }
        catch (err) {
            if (err.message.includes('Apenas administradores'))
                return res.status(403).json({ error: err.message });
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.RemoveMemberController = RemoveMemberController;
