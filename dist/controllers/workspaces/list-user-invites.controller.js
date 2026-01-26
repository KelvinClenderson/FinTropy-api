"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListUserInvitesController = void 0;
const workspaces_repository_1 = require("../../repositories/workspaces.repository");
const list_user_invites_service_1 = require("../../services/workspaces/list-user-invites.service");
class ListUserInvitesController {
    async handle(req, res) {
        try {
            const userId = req.user.id;
            const repo = new workspaces_repository_1.WorkspacesRepository();
            // 👇 CORREÇÃO: Buscamos o usuário para garantir o email
            const user = await repo.findUserById(userId);
            if (!user)
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            const service = new list_user_invites_service_1.ListUserInvitesService(repo);
            const invites = await service.execute({ userEmail: user.email });
            return res.json(invites);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.ListUserInvitesController = ListUserInvitesController;
