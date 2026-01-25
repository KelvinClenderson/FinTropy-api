import { Request, Response } from 'express';
import { z } from 'zod';
import { CreateRecurringTransactionService } from '../../services/recurring-transactions/create-recurring-transaction.service';

export class CreateRecurringTransactionController {
  async handle(req: Request, res: Response) {
    const bodySchema = z.object({
      name: z.string(),
      amount: z.number().positive(),
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
      dayOfPayment: z.number().min(1).max(31),
      startDate: z.string().datetime(),
      endDate: z.string().datetime().optional(),
      categoryId: z.string().uuid(),
      workspaceId: z.string().cuid().or(z.string().uuid()),

      // Opcionais
      creditCardId: z.string().uuid().optional().nullable(),
      memberId: z.string().uuid().optional().nullable(),
      payee: z.string().optional().nullable(),
      observation: z.string().nullable().optional(),
    });

    try {
      const data = bodySchema.parse(req.body);
      const service = new CreateRecurringTransactionService();

      const result = await service.execute({
        ...data,
        endDate: data.endDate,
        creditCardId: data.creditCardId ?? undefined,
        memberId: data.memberId ?? undefined,
        payee: data.payee ?? undefined,
      });

      return res.status(201).json(result);
    } catch (err: any) {
      if (err instanceof z.ZodError) return res.status(400).json({ issues: err.format() });
      return res.status(400).json({ error: err.message });
    }
  }
}
