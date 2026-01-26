import { Prisma } from '@prisma/client';
import { GoalsRepository } from '../../repositories/goals.repository';

interface IRequest {
  id: string;
  workspaceId: string;
  name?: string;
  targetAmount?: number;
  deadline?: string | Date;
}

export class UpdateGoalService {
  constructor(private goalsRepository: GoalsRepository) {}

  async execute({ id, workspaceId, ...data }: IRequest) {
    const goal = await this.goalsRepository.findById(id);

    if (!goal) throw new Error('Meta não encontrada.');
    if (goal.workspaceId !== workspaceId) throw new Error('Não autorizado.');

    const dataToUpdate: Prisma.GoalUpdateInput = {};

    if (data.name) dataToUpdate.name = data.name;
    if (data.targetAmount) dataToUpdate.targetAmount = new Prisma.Decimal(data.targetAmount);
    if (data.deadline) dataToUpdate.deadline = new Date(data.deadline);

    return await this.goalsRepository.update(id, dataToUpdate);
  }
}
