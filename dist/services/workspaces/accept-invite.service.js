"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcceptInviteService = void 0;
class AcceptInviteService {
    constructor(workspacesRepository) {
        this.workspacesRepository = workspacesRepository;
    }
    async execute({ inviteId, userId, userEmail }) {
        // 1. Busca o convite
        const invite = await this.workspacesRepository.findInviteById(inviteId);
        if (!invite) {
            throw new Error('Convite não encontrado ou expirado.');
        }
        // 2. Segurança: Garante que quem está aceitando é o dono do e-mail convidado
        if (invite.email !== userEmail) {
            throw new Error('Este convite não pertence ao seu usuário.');
        }
        // 3. Executa a transação (Entra no time + Apaga convite)
        await this.workspacesRepository.acceptInvite(invite.id, userId, invite.workspaceId);
    }
}
exports.AcceptInviteService = AcceptInviteService;
