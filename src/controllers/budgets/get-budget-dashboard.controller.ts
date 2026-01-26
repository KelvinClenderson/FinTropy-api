import { Request, Response } from 'express';
import { z } from 'zod';
import { BudgetsRepository } from '../../repositories/budgets.repository';
import { CategoriesRepository } from '../../repositories/categories.repository';
import { GetBudgetDashboardService } from '../../services/budgets/get-budget-dashboard.service';

export class GetBudgetDashboardController {
  async handle(req: Request, res: Response) {
    const querySchema = z.object({
      workspaceId: z.string().min(1),
      month: z.string().length(2), // "01", "12"
      year: z.string().length(4), // "2024"
    });

    try {
      const { workspaceId, month, year } = querySchema.parse(req.query);

      const budgetsRepo = new BudgetsRepository();
      const categoriesRepo = new CategoriesRepository();
      const service = new GetBudgetDashboardService(budgetsRepo, categoriesRepo);

      const data = await service.execute({ workspaceId, month, year });

      return res.json(data);
    } catch (err: any) {
      if (err instanceof z.ZodError) return res.status(400).json({ issues: err.format() });
      return res.status(400).json({ error: err.message });
    }
  }
}
