import { Request, Response } from 'express';
import { z } from 'zod';
import { GoalsRepository } from '../../repositories/goals.repository';
import { ListGoalsService } from '../../services/goals/list-goals.service';

export class ListGoalsController {
  async handle(req: Request, res: Response) {
    const querySchema = z.object({
      workspaceId: z.string().min(1),
    });

    try {
      const { workspaceId } = querySchema.parse(req.query);
      const repo = new GoalsRepository();
      const service = new ListGoalsService(repo);

      const goals = await service.execute({ workspaceId });

      return res.json(goals);
    } catch (err: any) {
      return res.status(400).json({ error: 'Workspace ID inválido.' });
    }
  }
}
