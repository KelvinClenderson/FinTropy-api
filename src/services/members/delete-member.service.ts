import { MembersRepository } from '../../repositories/members.repository';

interface IRequest {
  id: string;
  workspaceId: string;
}

export class DeleteMemberService {
  constructor(private membersRepository: MembersRepository) {}

  async execute({ id, workspaceId }: IRequest) {
    const member = await this.membersRepository.findById(id);

    if (!member) throw new Error('Responsável não encontrado.');
    if (member.workspaceId !== workspaceId) throw new Error('Não autorizado.');

    // Ao deletar, o Prisma setará memberId = null nas transações (onDelete: SetNull)
    await this.membersRepository.delete(id);
  }
}
