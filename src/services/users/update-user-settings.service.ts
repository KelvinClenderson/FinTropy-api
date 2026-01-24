import { UsersRepository } from '../../repositories/users.repository';

interface IRequest {
  userId: string;
  themeMode: 'LIGHT' | 'DARK';
  primaryColor: string;
}

export class UpdateUserSettingsService {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ userId, themeMode, primaryColor }: IRequest) {
    // Verifica se o usuário existe
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    // Atualiza
    const updatedUser = await this.usersRepository.updateSettings(userId, themeMode, primaryColor);

    return updatedUser;
  }
}
