import { Request, Response } from 'express';
import { z } from 'zod';
import { WorkspacesRepository } from '../../repositories/workspaces.repository';
import { UpdateWorkspaceService } from '../../services/workspaces/update-workspace.service';

export class UpdateWorkspaceController {
  async handle(req: Request, res: Response) {
    const paramSchema = z.object({ id: z.string().cuid().or(z.string().uuid()) });
    const bodySchema = z.object({
      name: z.string().min(1),
    });

    try {
      const { id } = paramSchema.parse(req.params);
      const { name } = bodySchema.parse(req.body);
      const userId = req.user.id;

      const repo = new WorkspacesRepository();
      const service = new UpdateWorkspaceService(repo);

      const workspace = await service.execute({ id, userId, name });

      return res.json(workspace);
    } catch (err: any) {
      if (err.message.includes('Apenas administradores'))
        return res.status(403).json({ error: err.message });
      return res.status(400).json({ error: err.message });
    }
  }
}
