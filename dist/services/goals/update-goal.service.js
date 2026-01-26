"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateGoalService = void 0;
const client_1 = require("@prisma/client");
class UpdateGoalService {
    constructor(goalsRepository) {
        this.goalsRepository = goalsRepository;
    }
    async execute({ id, workspaceId, ...data }) {
        const goal = await this.goalsRepository.findById(id);
        if (!goal)
            throw new Error('Meta não encontrada.');
        if (goal.workspaceId !== workspaceId)
            throw new Error('Não autorizado.');
        const dataToUpdate = {};
        if (data.name)
            dataToUpdate.name = data.name;
        if (data.targetAmount)
            dataToUpdate.targetAmount = new client_1.Prisma.Decimal(data.targetAmount);
        if (data.deadline)
            dataToUpdate.deadline = new Date(data.deadline);
        return await this.goalsRepository.update(id, dataToUpdate);
    }
}
exports.UpdateGoalService = UpdateGoalService;
