import { Request, Response } from 'express';
import { z } from 'zod';
import { WorkspacesRepository } from '../../repositories/workspaces.repository';
import { GetWorkspaceService } from '../../services/workspaces/get-workspace.service';

export class GetWorkspaceController {
  async handle(req: Request, res: Response) {
    const paramSchema = z.object({
      id: z.string().cuid().or(z.string().uuid()),
    });

    try {
      const { id } = paramSchema.parse(req.params);
      const userId = req.user.id; // Vem do token

      const repo = new WorkspacesRepository();
      const service = new GetWorkspaceService(repo);

      const workspace = await service.execute({ workspaceId: id, userId });

      return res.json(workspace);
    } catch (err: any) {
      if (err.message.includes('Acesso negado'))
        return res.status(403).json({ error: err.message });
      return res.status(400).json({ error: err.message });
    }
  }
}
