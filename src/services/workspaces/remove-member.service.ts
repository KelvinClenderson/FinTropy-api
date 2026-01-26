import { Role } from '@prisma/client';
import { WorkspacesRepository } from '../../repositories/workspaces.repository';

interface IRequest {
  workspaceId: string;
  adminUserId: string; // Quem está removendo
  memberIdToRemove: string; // Quem será removido (ID do Usuário)
}

export class RemoveMemberService {
  constructor(private workspacesRepository: WorkspacesRepository) {}

  async execute({ workspaceId, adminUserId, memberIdToRemove }: IRequest) {
    // 1. Validação de Segurança
    const membership = await this.workspacesRepository.findMembership(workspaceId, adminUserId);

    if (!membership || membership.role !== Role.ADMIN) {
      throw new Error('Apenas administradores podem remover membros.');
    }

    // 2. Previne que o Admin se remova (Opcional, mas recomendado para evitar erro)
    if (adminUserId === memberIdToRemove) {
      throw new Error(
        'Você não pode remover a si mesmo. Saia do workspace ou transfira a propriedade.',
      );
    }

    // 3. Remove
    try {
      await this.workspacesRepository.removeMember(workspaceId, memberIdToRemove);
    } catch (error) {
      throw new Error('Membro não encontrado ou já removido.');
    }
  }
}
