import { Request, Response } from 'express';
import { z } from 'zod';
import { CreateWorkspaceService } from '../../services/workspaces/create-workspace.service';

export class CreateWorkspaceController {
  async handle(req: Request, res: Response) {
    const bodySchema = z.object({
      name: z.string().min(1, 'O nome do workspace é obrigatório.'),
    });

    try {
      const { name } = bodySchema.parse(req.body);
      const userId = req.user.id;

      const service = new CreateWorkspaceService();

      const workspace = await service.execute({
        name,
        userId,
      });

      return res.status(201).json(workspace);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ issues: err.format() });
      }
      return res.status(500).json({ error: err.message });
    }
  }
}
