import { Request, Response } from 'express';
import { z } from 'zod';
// Pode remover o import do UsersRepository se não for usar mais nada dele aqui
// import { UsersRepository } from '../../repositories/users.repository';
import { AuthenticateUserService } from '../../services/sessions/authenticate-user.service';

export class AuthenticateController {
  async handle(req: Request, res: Response) {
    const authBodySchema = z.object({
      email: z.string().email(),
      password: z.string(),
    });

    const { email, password } = authBodySchema.parse(req.body);

    const authenticateUserService = new AuthenticateUserService();

    try {
      const { user, token, workspace } = await authenticateUserService.execute({
        email,
        password,
      });

      return res.json({ user, token, workspace });
    } catch (err) {
      if (err instanceof Error) {
        return res.status(401).json({ error: err.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
