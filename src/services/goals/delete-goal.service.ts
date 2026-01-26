import { GoalsRepository } from '../../repositories/goals.repository';

interface IRequest {
  id: string;
  workspaceId: string;
}

export class DeleteGoalService {
  constructor(private goalsRepository: GoalsRepository) {}

  async execute({ id, workspaceId }: IRequest) {
    const goal = await this.goalsRepository.findById(id);

    if (!goal) throw new Error('Meta não encontrada.');
    if (goal.workspaceId !== workspaceId) throw new Error('Não autorizado.');

    // Ao deletar a meta, as transações continuam existindo,
    // mas o campo goalId nelas ficará null (se seu schema tiver onDelete: SetNull)
    // ou você pode querer impedir se tiver vínculos.
    // Vamos assumir deleção simples por enquanto.
    await this.goalsRepository.delete(id);
  }
}
