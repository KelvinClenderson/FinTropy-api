import { Request, Response } from 'express';
import { z } from 'zod';
import { RecurringTransactionsRepository } from '../../repositories/recurring-transactions.repository';
import { ListRecurringTransactionsService } from '../../services/recurring-transactions/list-recurring-transactions.service';

export class ListRecurringTransactionsController {
  async handle(req: Request, res: Response) {
    const querySchema = z.object({ workspaceId: z.string().min(1) });

    try {
      const { workspaceId } = querySchema.parse(req.query);

      const repo = new RecurringTransactionsRepository();
      const service = new ListRecurringTransactionsService(repo);

      const transactions = await service.execute({ workspaceId });

      return res.json(transactions);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
