import { Request, Response } from 'express';
import { z } from 'zod';
import { RecurringTransactionsRepository } from '../../repositories/recurring-transactions.repository';
import { TransactionsRepository } from '../../repositories/transactions.repository';
import { GetMonthForecastService } from '../../services/dashboard/get-month-forecast.service';

export class GetMonthForecastController {
  async handle(req: Request, res: Response) {
    const querySchema = z.object({
      workspaceId: z.string().min(1, 'Workspace ID é obrigatório'),
      month: z.coerce.number().min(1).max(12),
      year: z.coerce.number().min(2000),
    });

    try {
      const { workspaceId, month, year } = querySchema.parse(req.query);

      const transactionsRepo = new TransactionsRepository();
      const recurringRepo = new RecurringTransactionsRepository();

      const service = new GetMonthForecastService(transactionsRepo, recurringRepo);

      const forecast = await service.execute({ workspaceId, month, year });

      return res.json(forecast);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ issues: err.format() });
      }
      return res.status(500).json({ error: err.message });
    }
  }
}
