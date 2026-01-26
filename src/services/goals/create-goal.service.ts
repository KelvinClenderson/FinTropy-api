import { Prisma } from '@prisma/client';
import { GoalsRepository } from '../../repositories/goals.repository';

interface IRequest {
  name: string;
  targetAmount: number;
  deadline: string | Date;
  workspaceId: string;
}

export class CreateGoalService {
  constructor(private goalsRepository: GoalsRepository) {}

  async execute({ name, targetAmount, deadline, workspaceId }: IRequest) {
    const goal = await this.goalsRepository.create({
      name,
      targetAmount: new Prisma.Decimal(targetAmount),
      deadline: new Date(deadline),
      workspaceId,
    });

    return goal;
  }
}
