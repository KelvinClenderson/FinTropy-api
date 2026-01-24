import { Request, Response } from 'express';
import { z } from 'zod';
import { UsersRepository } from '../../repositories/users.repository';
import { UpdateUserSettingsService } from '../../services/users/update-user-settings.service';

export class UpdateUserSettingsController {
  async handle(req: Request, res: Response) {
    const updateSettingsSchema = z.object({
      themeMode: z.enum(['LIGHT', 'DARK']),
      primaryColor: z
        .string()
        .startsWith('#', 'A cor deve ser um Hexadecimal (ex: #000000)')
        .length(7),
    });

    try {
      const userId = req.user.id; // Pega do token JWT
      const { themeMode, primaryColor } = updateSettingsSchema.parse(req.body);

      const usersRepository = new UsersRepository();
      const updateUserSettingsService = new UpdateUserSettingsService(usersRepository);

      const user = await updateUserSettingsService.execute({
        userId,
        themeMode: themeMode as 'LIGHT' | 'DARK',
        primaryColor,
      });

      return res.json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: 'Erro de validação', issues: err.format() });
      }
      return res.status(400).json({ error: (err as Error).message });
    }
  }
}
