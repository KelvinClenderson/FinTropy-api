import { Request, Response } from 'express';
import { z } from 'zod';
import { RecurringTransactionsRepository } from '../../repositories/recurring-transactions.repository';
import { DeleteRecurringTransactionService } from '../../services/recurring-transactions/delete-recurring-transaction.service';

export class DeleteRecurringTransactionController {
  async handle(req: Request, res: Response) {
    const paramSchema = z.object({ id: z.string().cuid().or(z.string().uuid()) });
    const querySchema = z.object({ workspaceId: z.string().min(1) });

    try {
      const { id } = paramSchema.parse(req.params);
      const { workspaceId } = querySchema.parse(req.query);

      const repo = new RecurringTransactionsRepository();
      const service = new DeleteRecurringTransactionService(repo);

      await service.execute({ id, workspaceId });

      return res.status(204).send();
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
