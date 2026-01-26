"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateGoalService = void 0;
const client_1 = require("@prisma/client");
class CreateGoalService {
    constructor(goalsRepository) {
        this.goalsRepository = goalsRepository;
    }
    async execute({ name, targetAmount, deadline, workspaceId }) {
        const goal = await this.goalsRepository.create({
            name,
            targetAmount: new client_1.Prisma.Decimal(targetAmount),
            deadline: new Date(deadline),
            workspaceId,
        });
        return goal;
    }
}
exports.CreateGoalService = CreateGoalService;
