"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListGoalsService = void 0;
class ListGoalsService {
    constructor(goalsRepository) {
        this.goalsRepository = goalsRepository;
    }
    async execute({ workspaceId }) {
        // O repositório já cuida de calcular o progresso
        return await this.goalsRepository.findByWorkspace(workspaceId);
    }
}
exports.ListGoalsService = ListGoalsService;
