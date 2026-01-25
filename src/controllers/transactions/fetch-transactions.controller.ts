import { Request, Response } from 'express';
import { z } from 'zod';
import { TransactionsRepository } from '../../repositories/transactions.repository';
import { FetchTransactionsService } from '../../services/transactions/fetch-transactions.service';

export class FetchTransactionsController {
  async handle(req: Request, res: Response) {
    const querySchema = z.object({
      workspaceId: z.string().cuid(),
      month: z.string().transform(Number),
      year: z.string().transform(Number),
    });

    const { workspaceId, month, year } = querySchema.parse(req.query);

    const repo = new TransactionsRepository();
    const service = new FetchTransactionsService(repo);

    const transactions = await service.execute({ workspaceId, month, year });

    return res.json(transactions);
  }
}
