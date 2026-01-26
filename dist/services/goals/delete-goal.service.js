"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteGoalService = void 0;
class DeleteGoalService {
    constructor(goalsRepository) {
        this.goalsRepository = goalsRepository;
    }
    async execute({ id, workspaceId }) {
        const goal = await this.goalsRepository.findById(id);
        if (!goal)
            throw new Error('Meta não encontrada.');
        if (goal.workspaceId !== workspaceId)
            throw new Error('Não autorizado.');
        // Ao deletar a meta, as transações continuam existindo,
        // mas o campo goalId nelas ficará null (se seu schema tiver onDelete: SetNull)
        // ou você pode querer impedir se tiver vínculos.
        // Vamos assumir deleção simples por enquanto.
        await this.goalsRepository.delete(id);
    }
}
exports.DeleteGoalService = DeleteGoalService;
