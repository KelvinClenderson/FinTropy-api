import { MembersRepository } from '../../repositories/members.repository';

interface IRequest {
  name: string;
  workspaceId: string;
}

export class CreateMemberService {
  constructor(private membersRepository: MembersRepository) {}

  async execute({ name, workspaceId }: IRequest) {
    // 1. Verifica se já existe um responsável com esse nome (evita duplicidade visual)
    const memberAlreadyExists = await this.membersRepository.findByNameAndWorkspace(
      name,
      workspaceId,
    );

    if (memberAlreadyExists) {
      throw new Error('Já existe um responsável com este nome neste workspace.');
    }

    // 2. Cria o membro (Este membro NÃO TEM acesso ao sistema, é apenas um registro)
    const member = await this.membersRepository.create({
      name,
      workspaceId,
    });

    return member;
  }
}
