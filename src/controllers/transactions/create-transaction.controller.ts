import { Request, Response } from 'express';
import { z } from 'zod';
import { TransactionsRepository } from '../../repositories/transactions.repository';
import { CreateTransactionService } from '../../services/transactions/create-transaction.service';

export class CreateTransactionController {
  async handle(req: Request, res: Response) {
    const bodySchema = z.object({
      name: z.string(),
      amount: z.number(),
      date: z.string().datetime(),
      categoryId: z.string().uuid(),
      workspaceId: z.string().cuid().or(z.string().uuid()),
      type: z.enum(['EXPENSE', 'DEPOSIT', 'INVESTMENT']),
      paymentMethod: z.enum([
        'CREDIT_CARD',
        'DEBIT_CARD',
        'BANK_TRANSFER',
        'BANK_SLIP',
        'CASH',
        'PIX',
        'OTHER',
      ]),

      // Opcionais
      observation: z.string().nullable().optional(),
      payee: z.string().nullable().optional(),
      memberId: z.string().uuid().nullable().optional(),
      creditCardId: z.string().uuid().nullable().optional(),

      // Parcelamento (Opcional, caso implemente no front futuramente)
      installments: z.number().min(1).optional(),
    });

    try {
      const data = bodySchema.parse(req.body);

      const repo = new TransactionsRepository();
      const service = new CreateTransactionService(repo);

      const transaction = await service.execute({
        ...data,
        date: new Date(data.date),
      });

      return res.status(201).json(transaction);
    } catch (err: any) {
      if (err instanceof z.ZodError) return res.status(400).json({ issues: err.format() });
      return res.status(400).json({ error: err.message });
    }
  }
}
