import { Request, Response } from 'express';
import { WorkspacesRepository } from '../../repositories/workspaces.repository';
import { ListUserInvitesService } from '../../services/workspaces/list-user-invites.service';

export class ListUserInvitesController {
  async handle(req: Request, res: Response) {
    try {
      const userId = req.user.id;

      const repo = new WorkspacesRepository();

      // 👇 CORREÇÃO: Buscamos o usuário para garantir o email
      const user = await repo.findUserById(userId);
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

      const service = new ListUserInvitesService(repo);

      const invites = await service.execute({ userEmail: user.email });

      return res.json(invites);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
