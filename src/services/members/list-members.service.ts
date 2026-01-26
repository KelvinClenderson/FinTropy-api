import { MembersRepository } from '../../repositories/members.repository';

interface IRequest {
  workspaceId: string;
}

export class ListMembersService {
  constructor(private membersRepository: MembersRepository) {}

  async execute({ workspaceId }: IRequest) {
    // Retorna a lista da tabela 'Member'.
    // O frontend usará essa lista para popular o select de "Responsável".
    const members = await this.membersRepository.findByWorkspace(workspaceId);
    return members;
  }
}
