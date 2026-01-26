"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InviteMemberController = void 0;
const zod_1 = require("zod");
const workspaces_repository_1 = require("../../repositories/workspaces.repository");
const invite_member_service_1 = require("../../services/workspaces/invite-member.service");
class InviteMemberController {
    async handle(req, res) {
        const paramSchema = zod_1.z.object({ id: zod_1.z.string().cuid().or(zod_1.z.string().uuid()) }); // Workspace ID
        const bodySchema = zod_1.z.object({
            email: zod_1.z.string().email(),
        });
        try {
            const { id } = paramSchema.parse(req.params);
            const { email } = bodySchema.parse(req.body);
            const adminUserId = req.user.id;
            const repo = new workspaces_repository_1.WorkspacesRepository();
            const service = new invite_member_service_1.InviteMemberService(repo);
            const invite = await service.execute({
                workspaceId: id,
                adminUserId,
                emailToInvite: email,
            });
            return res.status(201).json(invite);
        }
        catch (err) {
            if (err.message.includes('Apenas administradores'))
                return res.status(403).json({ error: err.message });
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.InviteMemberController = InviteMemberController;
