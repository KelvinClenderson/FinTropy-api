import { Request, Response } from 'express';
import { z } from 'zod';
import { TransactionsRepository } from '../../repositories/transactions.repository';
import { GetDashboardStatsService } from '../../services/dashboard/get-dashboard-stats.service';

export class GetDashboardController {
  async handle(req: Request, res: Response) {
    const dashboardQuerySchema = z.object({
      month: z.coerce.number().min(1).max(12),
      year: z.coerce.number().min(2000),
      // 👇 CORREÇÃO: Removemos o .uuid() para aceitar CUID ou qualquer string ID
      workspaceId: z.string().min(1),
    });

    try {
      const { month, year, workspaceId } = dashboardQuerySchema.parse(req.query);

      const transactionsRepository = new TransactionsRepository();
      const getDashboardStatsService = new GetDashboardStatsService(transactionsRepository);

      const stats = await getDashboardStatsService.execute({
        workspaceId,
        month,
        year,
      });

      return res.json(stats);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: 'Dados inválidos', issues: err.format() });
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
