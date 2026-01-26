"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateWorkspaceService = void 0;
const client_1 = require("@prisma/client");
class UpdateWorkspaceService {
    constructor(workspacesRepository) {
        this.workspacesRepository = workspacesRepository;
    }
    async execute({ id, userId, name }) {
        // 1. Verifica permissão
        const membership = await this.workspacesRepository.findMembership(id, userId);
        if (!membership) {
            throw new Error('Acesso negado.');
        }
        // 2. Regra de Negócio: Apenas ADMIN edita dados estruturais
        if (membership.role !== client_1.Role.ADMIN) {
            throw new Error('Apenas administradores podem editar o workspace.');
        }
        // 3. Atualiza
        const workspace = await this.workspacesRepository.update(id, {
            name,
        });
        return workspace;
    }
}
exports.UpdateWorkspaceService = UpdateWorkspaceService;
