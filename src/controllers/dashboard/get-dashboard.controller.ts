import { Request, Response } from 'express';
import { z } from 'zod';
import { TransactionsRepository } from '../../repositories/transactions.repository';
import { GetDashboardStatsService } from '../../services/dashboard/get-dashboard-stats.service';

export class GetDashboardController {
  async handle(req: Request, res: Response) {
    const querySchema = z.object({
      month: z.coerce.number().min(1).max(12),
      year: z.coerce.number().min(2000),
      workspaceId: z.string().min(1),
    });

    try {
      const { month, year, workspaceId } = querySchema.parse(req.query);

      const repo = new TransactionsRepository();
      const service = new GetDashboardStatsService(repo);

      const stats = await service.execute({
        workspaceId,
        month,
        year,
      });

      return res.json(stats);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ issues: err.format() });
      }
      return res.status(400).json({ error: err.message });
    }
  }
}
