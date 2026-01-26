"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteWorkspaceService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../../lib/prisma"); // Importe o prisma diretamente se o repo não tiver o método count
class DeleteWorkspaceService {
    constructor(workspacesRepository) {
        this.workspacesRepository = workspacesRepository;
    }
    async execute({ id, userId }) {
        // 1. Verifica permissão no workspace alvo
        const membership = await this.workspacesRepository.findMembership(id, userId);
        if (!membership) {
            throw new Error('Workspace não encontrado ou acesso negado.');
        }
        if (membership.role !== client_1.Role.ADMIN) {
            throw new Error('Apenas administradores podem excluir o workspace.');
        }
        // 2. LÓGICA DE PROTEÇÃO: Impedir exclusão se for o único workspace de Admin
        // Conta quantos workspaces esse usuário possui como ADMIN
        const adminCount = await prisma_1.prisma.workspaceUser.count({
            where: {
                userId: userId,
                role: client_1.Role.ADMIN,
            },
        });
        if (adminCount <= 1) {
            throw new Error('Você não pode excluir seu único workspace. Crie outro antes de excluir este.');
        }
        // 3. Deleta (Cascade apagará o resto)
        await this.workspacesRepository.delete(id);
    }
}
exports.DeleteWorkspaceService = DeleteWorkspaceService;
