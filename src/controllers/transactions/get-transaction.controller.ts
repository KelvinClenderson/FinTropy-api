import { Request, Response } from 'express';
import { TransactionsRepository } from '../../repositories/transactions.repository';

export class GetTransactionController {
  async handle(req: Request, res: Response) {
    // 👇 Correção: Forçamos a tipagem para garantir que é string
    const { id } = req.params as { id: string };

    const repo = new TransactionsRepository();
    const transaction = await repo.findById(id);

    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

    return res.json(transaction);
  }
}
