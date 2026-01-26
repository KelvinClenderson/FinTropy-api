import { Role } from '@prisma/client';
import { prisma } from '../../lib/prisma'; // Importe o prisma diretamente se o repo não tiver o método count
import { WorkspacesRepository } from '../../repositories/workspaces.repository';

interface IRequest {
  id: string;
  userId: string;
}

export class DeleteWorkspaceService {
  constructor(private workspacesRepository: WorkspacesRepository) {}

  async execute({ id, userId }: IRequest) {
    // 1. Verifica permissão no workspace alvo
    const membership = await this.workspacesRepository.findMembership(id, userId);

    if (!membership) {
      throw new Error('Workspace não encontrado ou acesso negado.');
    }

    if (membership.role !== Role.ADMIN) {
      throw new Error('Apenas administradores podem excluir o workspace.');
    }

    // 2. LÓGICA DE PROTEÇÃO: Impedir exclusão se for o único workspace de Admin
    // Conta quantos workspaces esse usuário possui como ADMIN
    const adminCount = await prisma.workspaceUser.count({
      where: {
        userId: userId,
        role: Role.ADMIN,
      },
    });

    if (adminCount <= 1) {
      throw new Error(
        'Você não pode excluir seu único workspace. Crie outro antes de excluir este.',
      );
    }

    // 3. Deleta (Cascade apagará o resto)
    await this.workspacesRepository.delete(id);
  }
}
