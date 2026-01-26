"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMemberController = void 0;
const zod_1 = require("zod");
const members_repository_1 = require("../../repositories/members.repository");
const update_member_service_1 = require("../../services/members/update-member.service");
class UpdateMemberController {
    async handle(req, res) {
        const paramSchema = zod_1.z.object({ id: zod_1.z.string().uuid() });
        const bodySchema = zod_1.z.object({
            name: zod_1.z.string().min(1),
            workspaceId: zod_1.z.string().min(1), // Validação de segurança
        });
        try {
            const { id } = paramSchema.parse(req.params);
            const { name, workspaceId } = bodySchema.parse(req.body);
            const repo = new members_repository_1.MembersRepository();
            const service = new update_member_service_1.UpdateMemberService(repo);
            const member = await service.execute({ id, workspaceId, name });
            return res.json(member);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.UpdateMemberController = UpdateMemberController;
