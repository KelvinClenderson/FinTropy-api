"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveMemberService = void 0;
const client_1 = require("@prisma/client");
class RemoveMemberService {
    constructor(workspacesRepository) {
        this.workspacesRepository = workspacesRepository;
    }
    async execute({ workspaceId, adminUserId, memberIdToRemove }) {
        // 1. Validação de Segurança
        const membership = await this.workspacesRepository.findMembership(workspaceId, adminUserId);
        if (!membership || membership.role !== client_1.Role.ADMIN) {
            throw new Error('Apenas administradores podem remover membros.');
        }
        // 2. Previne que o Admin se remova (Opcional, mas recomendado para evitar erro)
        if (adminUserId === memberIdToRemove) {
            throw new Error('Você não pode remover a si mesmo. Saia do workspace ou transfira a propriedade.');
        }
        // 3. Remove
        try {
            await this.workspacesRepository.removeMember(workspaceId, memberIdToRemove);
        }
        catch (error) {
            throw new Error('Membro não encontrado ou já removido.');
        }
    }
}
exports.RemoveMemberService = RemoveMemberService;
