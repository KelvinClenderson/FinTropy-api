"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMemberController = void 0;
const zod_1 = require("zod");
const members_repository_1 = require("../../repositories/members.repository");
const create_member_service_1 = require("../../services/members/create-member.service");
class CreateMemberController {
    async handle(req, res) {
        const bodySchema = zod_1.z.object({
            name: zod_1.z.string().min(1),
            workspaceId: zod_1.z.string().min(1),
        });
        try {
            const { name, workspaceId } = bodySchema.parse(req.body);
            const repo = new members_repository_1.MembersRepository();
            const service = new create_member_service_1.CreateMemberService(repo);
            const member = await service.execute({ name, workspaceId });
            return res.status(201).json(member);
        }
        catch (err) {
            if (err instanceof zod_1.z.ZodError)
                return res.status(400).json({ issues: err.format() });
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.CreateMemberController = CreateMemberController;
