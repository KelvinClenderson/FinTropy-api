import { WorkspacesRepository } from '../../repositories/workspaces.repository';

interface IRequest {
  userEmail: string;
}

export class ListUserInvitesService {
  constructor(private workspacesRepository: WorkspacesRepository) {}

  async execute({ userEmail }: IRequest) {
    return await this.workspacesRepository.findInvitesByUserEmail(userEmail);
  }
}
