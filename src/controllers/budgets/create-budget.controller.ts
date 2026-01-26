import { Request, Response } from 'express';
import { z } from 'zod';
import { BudgetsRepository } from '../../repositories/budgets.repository';
import { CreateBudgetService } from '../../services/budgets/create-budget.service';

export class CreateBudgetController {
  async handle(req: Request, res: Response) {
    const bodySchema = z.object({
      workspaceId: z.string().cuid().or(z.string().uuid()),
      categoryId: z.string().cuid().or(z.string().uuid()),
      month: z.string().regex(/^\d{4}-\d{2}$/),
      amount: z.number().positive(),
      isRecurring: z.boolean().default(false).optional(),
    });

    try {
      const data = bodySchema.parse(req.body);
      const repo = new BudgetsRepository();
      const service = new CreateBudgetService(repo);

      const budget = await service.execute(data);

      return res.status(201).json(budget);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
