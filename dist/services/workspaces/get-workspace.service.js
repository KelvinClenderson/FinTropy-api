"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetWorkspaceService = void 0;
class GetWorkspaceService {
    constructor(workspacesRepository) {
        this.workspacesRepository = workspacesRepository;
    }
    async execute({ workspaceId, userId }) {
        // 1. Segurança: Verifica se o usuário pertence ao workspace
        const membership = await this.workspacesRepository.findMembership(workspaceId, userId);
        if (!membership) {
            throw new Error('Acesso negado: Você não é membro deste workspace.');
        }
        // 2. Busca os dados completos
        const workspace = await this.workspacesRepository.findByIdWithDetails(workspaceId);
        if (!workspace) {
            throw new Error('Workspace não encontrado.');
        }
        // 3. Retorna formatado, indicando qual é o papel do usuário atual
        return {
            ...workspace,
            myRole: membership.role, // ADMIN ou MEMBER
        };
    }
}
exports.GetWorkspaceService = GetWorkspaceService;
