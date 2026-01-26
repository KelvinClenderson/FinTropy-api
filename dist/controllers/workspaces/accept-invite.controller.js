"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcceptInviteController = void 0;
const zod_1 = require("zod");
const workspaces_repository_1 = require("../../repositories/workspaces.repository");
const accept_invite_service_1 = require("../../services/workspaces/accept-invite.service");
class AcceptInviteController {
    async handle(req, res) {
        const paramSchema = zod_1.z.object({ id: zod_1.z.string().cuid().or(zod_1.z.string().uuid()) });
        try {
            const { id } = paramSchema.parse(req.params);
            const userId = req.user.id; // Temos certeza que o ID existe pelo middleware
            const repo = new workspaces_repository_1.WorkspacesRepository();
            // 👇 CORREÇÃO: Buscamos o usuário no banco para pegar o email seguro
            const user = await repo.findUserById(userId);
            if (!user)
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            const service = new accept_invite_service_1.AcceptInviteService(repo);
            await service.execute({
                inviteId: id,
                userId,
                userEmail: user.email, // Agora passamos o email vindo do banco
            });
            return res.status(204).send();
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.AcceptInviteController = AcceptInviteController;
