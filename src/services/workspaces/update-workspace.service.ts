import { Role } from '@prisma/client';
import { WorkspacesRepository } from '../../repositories/workspaces.repository';

interface IRequest {
  id: string;
  userId: string;
  name?: string;
}

export class UpdateWorkspaceService {
  constructor(private workspacesRepository: WorkspacesRepository) {}

  async execute({ id, userId, name }: IRequest) {
    // 1. Verifica permissão
    const membership = await this.workspacesRepository.findMembership(id, userId);

    if (!membership) {
      throw new Error('Acesso negado.');
    }

    // 2. Regra de Negócio: Apenas ADMIN edita dados estruturais
    if (membership.role !== Role.ADMIN) {
      throw new Error('Apenas administradores podem editar o workspace.');
    }

    // 3. Atualiza
    const workspace = await this.workspacesRepository.update(id, {
      name,
    });

    return workspace;
  }
}
