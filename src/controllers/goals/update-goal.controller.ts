import { Request, Response } from 'express';
import { z } from 'zod';
import { GoalsRepository } from '../../repositories/goals.repository';
import { UpdateGoalService } from '../../services/goals/update-goal.service';

export class UpdateGoalController {
  async handle(req: Request, res: Response) {
    const paramSchema = z.object({ id: z.string().cuid().or(z.string().uuid()) });
    const querySchema = z.object({ workspaceId: z.string().min(1) });
    const bodySchema = z.object({
      name: z.string().optional(),
      targetAmount: z.number().positive().optional(),
      deadline: z.string().datetime().optional(),
    });

    try {
      const { id } = paramSchema.parse(req.params);
      const { workspaceId } = querySchema.parse(req.query);
      const data = bodySchema.parse(req.body);

      const repo = new GoalsRepository();
      const service = new UpdateGoalService(repo);

      const goal = await service.execute({ id, workspaceId, ...data });

      return res.json(goal);
    } catch (err: any) {
      if (err instanceof z.ZodError) return res.status(400).json({ issues: err.format() });
      return res.status(400).json({ error: err.message });
    }
  }
}
