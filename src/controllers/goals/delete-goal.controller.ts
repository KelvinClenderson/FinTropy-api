import { Request, Response } from 'express';
import { z } from 'zod';
import { GoalsRepository } from '../../repositories/goals.repository';
import { DeleteGoalService } from '../../services/goals/delete-goal.service';

export class DeleteGoalController {
  async handle(req: Request, res: Response) {
    const paramSchema = z.object({ id: z.string().cuid().or(z.string().uuid()) });
    const querySchema = z.object({ workspaceId: z.string().min(1) });

    try {
      const { id } = paramSchema.parse(req.params);
      const { workspaceId } = querySchema.parse(req.query);

      const repo = new GoalsRepository();
      const service = new DeleteGoalService(repo);

      await service.execute({ id, workspaceId });

      return res.status(204).send();
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
