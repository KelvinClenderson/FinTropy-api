import { Request, Response } from 'express';
import { z } from 'zod';
import { TransactionsRepository } from '../../repositories/transactions.repository';
import { GetDashboardStatsService } from '../../services/dashboard/get-dashboard-stats.service';

export class GetDashboardStatsController {
  async handle(req: Request, res: Response) {
    const querySchema = z.object({
      workspaceId: z.string().cuid().or(z.string().uuid()),
      month: z.string().transform(Number),
      year: z.string().transform(Number),
    });

    try {
      const { workspaceId, month, year } = querySchema.parse(req.query);

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
        return res.status(400).json({ error: 'Parâmetros inválidos', details: err.format() });
      }
      return res.status(500).json({ error: 'Erro interno ao buscar dashboard' });
    }
  }
}
