"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteMemberController = void 0;
const zod_1 = require("zod");
const members_repository_1 = require("../../repositories/members.repository");
const delete_member_service_1 = require("../../services/members/delete-member.service");
class DeleteMemberController {
    async handle(req, res) {
        const paramSchema = zod_1.z.object({ id: zod_1.z.string().uuid() });
        const querySchema = zod_1.z.object({ workspaceId: zod_1.z.string().min(1) });
        try {
            const { id } = paramSchema.parse(req.params);
            const { workspaceId } = querySchema.parse(req.query);
            const repo = new members_repository_1.MembersRepository();
            const service = new delete_member_service_1.DeleteMemberService(repo);
            await service.execute({ id, workspaceId });
            return res.status(204).send();
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.DeleteMemberController = DeleteMemberController;
