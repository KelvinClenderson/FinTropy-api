import { Request, Response } from 'express';
import { z } from 'zod';
import { UsersRepository } from '../../repositories/users.repository';
import { RegisterUserService } from '../../services/sessions/register-user.service';

export class RegisterController {
  async handle(req: Request, res: Response) {
    // 1. Validação dos dados de entrada
    const registerBodySchema = z.object({
      name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
      email: z.string().email('E-mail inválido'),
      password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    });

    try {
      const { name, email, password } = registerBodySchema.parse(req.body);

      // 2. Injeção de dependências
      const usersRepository = new UsersRepository();
      const registerUserService = new RegisterUserService(usersRepository);

      // 3. Execução do serviço
      const user = await registerUserService.execute({
        name,
        email,
        password,
      });

      // Retorna 201 (Created)
      return res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Erro de validação',
          issues: err.format(),
        });
      }

      if (err instanceof Error) {
        return res.status(400).json({ error: err.message });
      }

      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
