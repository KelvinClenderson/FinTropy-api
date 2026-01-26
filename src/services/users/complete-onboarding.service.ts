import { UsersRepository } from '../../repositories/users.repository';

interface IRequest {
  userId: string;
}

export class CompleteOnboardingService {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ userId }: IRequest) {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    await this.usersRepository.completeOnboarding(userId);
  }
}
