import { WorkspacesRepository } from '../../repositories/workspaces.repository';

interface IRequest {
  inviteId: string;
  userId: string;
  userEmail: string; // E-mail de quem está tentando aceitar
}

export class AcceptInviteService {
  constructor(private workspacesRepository: WorkspacesRepository) {}

  async execute({ inviteId, userId, userEmail }: IRequest) {
    // 1. Busca o convite
    const invite = await this.workspacesRepository.findInviteById(inviteId);

    if (!invite) {
      throw new Error('Convite não encontrado ou expirado.');
    }

    // 2. Segurança: Garante que quem está aceitando é o dono do e-mail convidado
    if (invite.email !== userEmail) {
      throw new Error('Este convite não pertence ao seu usuário.');
    }

    // 3. Executa a transação (Entra no time + Apaga convite)
    await this.workspacesRepository.acceptInvite(invite.id, userId, invite.workspaceId);
  }
}
