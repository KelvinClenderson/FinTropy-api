import { Request, Response } from 'express';
import { z } from 'zod';
import { WorkspacesRepository } from '../../repositories/workspaces.repository';
import { AcceptInviteService } from '../../services/workspaces/accept-invite.service';

export class AcceptInviteController {
  async handle(req: Request, res: Response) {
    const paramSchema = z.object({ id: z.string().cuid().or(z.string().uuid()) });

    try {
      const { id } = paramSchema.parse(req.params);
      const userId = req.user.id; // Temos certeza que o ID existe pelo middleware

      const repo = new WorkspacesRepository();

      // 👇 CORREÇÃO: Buscamos o usuário no banco para pegar o email seguro
      const user = await repo.findUserById(userId);
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

      const service = new AcceptInviteService(repo);

      await service.execute({
        inviteId: id,
        userId,
        userEmail: user.email, // Agora passamos o email vindo do banco
      });

      return res.status(204).send();
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
