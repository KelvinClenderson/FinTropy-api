import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { UsersRepository } from '../repositories/users.repository';

interface IRequest {
  email: string;
  password: string;
}

interface IResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  token: string;
}

export class AuthenticateUserService {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ email, password }: IRequest): Promise<IResponse> {
    // 1. Verificar se usuário existe
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new Error('E-mail ou senha incorretos.');
    }

    // 2. Comparar a senha enviada com o hash no banco
    // 👇 CORREÇÃO: Usar 'passwordHash' (propriedade do objeto) em vez de 'password_hash'
    const passwordMatch = await compare(password, user.passwordHash);

    if (!passwordMatch) {
      throw new Error('E-mail ou senha incorretos.');
    }

    // 3. Gerar Token JWT
    if (!process.env.JWT_SECRET) {
      throw new Error('Erro interno: JWT_SECRET não definido.');
    }

    const token = sign({}, process.env.JWT_SECRET, {
      subject: user.id,
      expiresIn: '1d',
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  }
}
