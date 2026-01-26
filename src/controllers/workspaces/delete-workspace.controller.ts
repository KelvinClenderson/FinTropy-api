import { Request, Response } from 'express';
import { z } from 'zod';
import { WorkspacesRepository } from '../../repositories/workspaces.repository';
import { DeleteWorkspaceService } from '../../services/workspaces/delete-workspace.service';

export class DeleteWorkspaceController {
  async handle(req: Request, res: Response) {
    const paramSchema = z.object({ id: z.string().cuid().or(z.string().uuid()) });

    try {
      const { id } = paramSchema.parse(req.params);
      const userId = req.user.id;

      const repo = new WorkspacesRepository();
      const service = new DeleteWorkspaceService(repo);

      await service.execute({ id, userId });

      return res.status(204).send();
    } catch (err: any) {
      if (err.message.includes('Apenas administradores')) {
        return res.status(403).json({ error: err.message });
      }
      return res.status(400).json({ error: err.message });
    }
  }
}
