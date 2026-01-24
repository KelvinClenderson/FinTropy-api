import { Request, Response } from 'express';
import { z } from 'zod';
import { TransactionsRepository } from '../../repositories/transactions.repository';
import { CreateTransactionService } from '../../services/transactions/create-transaction.service';

export class CreateTransactionController {
  async handle(req: Request, res: Response) {
    const createTransactionSchema = z.object({
      name: z.string().trim().min(1, 'Nome é obrigatório'),
      amount: z.number().positive('O valor deve ser positivo'),
      type: z.enum(['DEPOSIT', 'EXPENSE', 'INVESTMENT']),
      categoryId: z.string().min(1, 'Categoria é obrigatória'),
      paymentMethod: z.enum([
        'CREDIT_CARD',
        'DEBIT_CARD',
        'BANK_TRANSFER',
        'BANK_SLIP',
        'CASH',
        'PIX',
        'OTHER',
      ]),
      date: z.coerce.date(),
      workspaceId: z.string().min(1),

      // Opcionais
      creditCardId: z.string().nullable().optional(),
      payee: z.string().trim().optional().nullable(),
      goalId: z.string().nullable().optional(),
      observation: z.string().max(255).optional().nullable(),
      memberId: z.string().optional().nullable(),

      totalInstallments: z.number().min(1).max(72).default(1).nullable().optional(),
      installmentNumber: z.number().min(1).max(72).default(1).nullable().optional(),

      // 👇 NOVO CAMPO: Define se o valor enviado é da parcela ou total
      isInstallmentValue: z.boolean().default(false).optional(),
    });

    try {
      const { ...data } = createTransactionSchema.parse(req.body);

      const transactionsRepository = new TransactionsRepository();
      const createTransactionService = new CreateTransactionService(transactionsRepository);

      const transaction = await createTransactionService.execute(data);

      return res.status(201).json(transaction);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Erro de validação',
          issues: err.format(),
        });
      }
      return res.status(400).json({ error: (err as Error).message });
    }
  }
}
