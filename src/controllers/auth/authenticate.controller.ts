import { Request, Response } from 'express';
import { z } from 'zod';
import { UsersRepository } from '../../repositories/users.repository';
import { AuthenticateUserService } from '../../services/authenticate-user.service';

export class AuthenticateController {
  async handle(req: Request, res: Response) {
    console.log('Login Request Body:', req.body);
    console.log('Content-Type:', req.headers['content-type']);

    // 1. Validação com Zod
    const authBodySchema = z.object({
      email: z.string().email(),
      password: z.string(),
    });

    const { email, password } = authBodySchema.parse(req.body);

    // 2. Injeção de Dependência
    const usersRepository = new UsersRepository();
    const authenticateUserService = new AuthenticateUserService(usersRepository);

    try {
      // 3. Execução
      const { user, token } = await authenticateUserService.execute({
        email,
        password,
      });

      return res.json({ user, token });
    } catch (err) {
      if (err instanceof Error) {
        return res.status(401).json({ error: err.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
