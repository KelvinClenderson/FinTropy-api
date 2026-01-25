import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { prisma } from '../../lib/prisma'; // Verifique se o caminho do seu prisma client está correto aqui

interface IRequest {
  email: string;
  password: string;
}

interface IResponse {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
  workspace: {
    id: string;
    name: string;
  } | null; // Pode ser null se o usuário não tiver workspace (raro)
  token: string;
}

class AuthenticateUserService {
  async execute({ email, password }: IRequest): Promise<IResponse> {
    // 1. Busca o usuário e JÁ TRAZ os workspaces vinculados
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        workspaceUsers: {
          include: {
            workspace: true, // Traz os dados completos do workspace
          },
        },
      },
    });

    // 2. Se não achar o usuário
    if (!user) {
      throw new Error('Email or password incorrect.');
    }

    // 3. Verifica se a senha bate com o Hash do banco
    const passwordMatch = await compare(password, user.passwordHash);

    if (!passwordMatch) {
      throw new Error('Email or password incorrect.');
    }

    // 4. Configuração do Token JWT
    // DICA: O ideal é mover esse "md5_secret_aleatorio" para uma variável de ambiente: process.env.JWT_SECRET
    const secret = process.env.JWT_SECRET || 'default_super_secret_key_fin_alchemy';

    const token = sign({}, secret, {
      subject: user.id, // O ID do usuário vira o "assunto" do token
      expiresIn: '1d', // Expira em 1 dia
    });

    // 5. Define o Workspace Padrão
    // Pega o primeiro workspace da lista (regra simples para MVP)
    const defaultWorkspace = user.workspaceUsers[0]?.workspace || null;

    // 6. Retorna tudo que o Frontend precisa
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      workspace: defaultWorkspace
        ? {
            id: defaultWorkspace.id,
            name: defaultWorkspace.name,
          }
        : null,
      token,
    };
  }
}

export { AuthenticateUserService };
