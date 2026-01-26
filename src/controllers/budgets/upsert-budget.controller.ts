import { Request, Response } from 'express';
import { z } from 'zod';
import { BudgetsRepository } from '../../repositories/budgets.repository';
import { UpdateBudgetService } from '../../services/budgets/upsert-budget.service';

export class UpdateBudgetController {
  async handle(req: Request, res: Response) {
    const paramSchema = z.object({ id: z.string().cuid().or(z.string().uuid()) });
    const bodySchema = z.object({
      workspaceId: z.string().min(1), // Necessário para validação de segurança
      amount: z.number().positive(),
      isRecurring: z.boolean().default(false).optional(),
    });

    try {
      const { id } = paramSchema.parse(req.params);
      const { workspaceId, amount, isRecurring } = bodySchema.parse(req.body);

      const repo = new BudgetsRepository();
      const service = new UpdateBudgetService(repo);

      const budget = await service.execute({ id, workspaceId, amount, isRecurring });

      return res.json(budget);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
