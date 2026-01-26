"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListMembersController = void 0;
const zod_1 = require("zod");
const members_repository_1 = require("../../repositories/members.repository");
const list_members_service_1 = require("../../services/members/list-members.service");
class ListMembersController {
    async handle(req, res) {
        const querySchema = zod_1.z.object({
            workspaceId: zod_1.z.string().min(1),
        });
        try {
            const { workspaceId } = querySchema.parse(req.query);
            const repo = new members_repository_1.MembersRepository();
            const service = new list_members_service_1.ListMembersService(repo);
            const members = await service.execute({ workspaceId });
            return res.json(members);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.ListMembersController = ListMembersController;
