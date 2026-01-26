"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InviteMemberService = void 0;
const client_1 = require("@prisma/client");
class InviteMemberService {
    constructor(workspacesRepository) {
        this.workspacesRepository = workspacesRepository;
    }
    async execute({ workspaceId, adminUserId, emailToInvite }) {
        // 1. Verifica se quem está convidando é ADMIN
        const membership = await this.workspacesRepository.findMembership(workspaceId, adminUserId);
        if (!membership || membership.role !== client_1.Role.ADMIN) {
            throw new Error('Apenas administradores podem enviar convites.');
        }
        // 2. Verifica se o usuário convidado JÁ ESTÁ no workspace
        // Primeiro buscamos se existe um usuário com esse email
        const user = await this.workspacesRepository.findUserByEmail(emailToInvite);
        if (user) {
            const isAlreadyMember = await this.workspacesRepository.findMembership(workspaceId, user.id);
            if (isAlreadyMember) {
                throw new Error('Este usuário já é membro do workspace.');
            }
        }
        // 3. Verifica se já existe convite pendente
        const inviteExists = await this.workspacesRepository.findInvite(workspaceId, emailToInvite);
        if (inviteExists) {
            throw new Error('Já existe um convite pendente para este e-mail.');
        }
        // 4. Cria o convite
        const invite = await this.workspacesRepository.createInvite(workspaceId, emailToInvite);
        return invite;
    }
}
exports.InviteMemberService = InviteMemberService;
