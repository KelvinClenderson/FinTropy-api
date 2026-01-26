import { MembersRepository } from '../../repositories/members.repository';

interface IRequest {
  id: string;
  workspaceId: string;
  name: string;
}

export class UpdateMemberService {
  constructor(private membersRepository: MembersRepository) {}

  async execute({ id, workspaceId, name }: IRequest) {
    const member = await this.membersRepository.findById(id);

    if (!member) throw new Error('Responsável não encontrado.');
    if (member.workspaceId !== workspaceId) throw new Error('Não autorizado.');

    return await this.membersRepository.update(id, { name });
  }
}
