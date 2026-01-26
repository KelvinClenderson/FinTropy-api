import { Request, Response } from 'express';
import { z } from 'zod';
import { GoalsRepository } from '../../repositories/goals.repository';
import { CreateGoalService } from '../../services/goals/create-goal.service';

export class CreateGoalController {
  async handle(req: Request, res: Response) {
    const bodySchema = z.object({
      name: z.string().min(1),
      targetAmount: z.number().positive(),
      deadline: z.string().datetime(),
      workspaceId: z.string().cuid().or(z.string().uuid()),
    });

    try {
      const data = bodySchema.parse(req.body);
      const repo = new GoalsRepository();
      const service = new CreateGoalService(repo);

      const goal = await service.execute(data);

      return res.status(201).json(goal);
    } catch (err: any) {
      if (err instanceof z.ZodError) return res.status(400).json({ issues: err.format() });
      return res.status(400).json({ error: err.message });
    }
  }
}
