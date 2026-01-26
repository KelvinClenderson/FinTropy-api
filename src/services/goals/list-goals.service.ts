import { GoalsRepository } from '../../repositories/goals.repository';

interface IRequest {
  workspaceId: string;
}

export class ListGoalsService {
  constructor(private goalsRepository: GoalsRepository) {}

  async execute({ workspaceId }: IRequest) {
    // O repositório já cuida de calcular o progresso
    return await this.goalsRepository.findByWorkspace(workspaceId);
  }
}
