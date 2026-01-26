import { Request, Response } from 'express';
import { z } from 'zod';
import { TransactionsRepository } from '../../repositories/transactions.repository';
import { UpdateTransactionService } from '../../services/transactions/update-transaction.service';

export class UpdateTransactionController {
  async handle(req: Request, res: Response) {
    // Validação da URL
    const paramSchema = z.object({
      id: z.string().cuid(),
    });

    // Validação da Query
    const querySchema = z.object({
      workspaceId: z.string().min(1, 'Workspace ID is required'),
    });

    // Validação do Body
    const bodySchema = z.object({
      name: z.string().optional(),
      amount: z.number().optional(), // Pode ser parcela ou total, depende do booleano abaixo
      date: z.string().datetime().optional(), // ISO String
      categoryId: z.string().uuid().optional(),

      type: z.enum(['EXPENSE', 'DEPOSIT', 'INVESTMENT']).optional(),
      paymentMethod: z
        .enum(['CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'BANK_SLIP', 'CASH', 'PIX', 'OTHER'])
        .optional(),

      observation: z.string().nullable().optional(),
      payee: z.string().nullable().optional(),
      memberId: z.string().uuid().nullable().optional(),

      // CAMPOS DE INTELIGÊNCIA DE PARCELAMENTO
      installments: z.number().min(1).optional(), // Equivalente a totalInstallments
      installmentNumber: z.number().min(1).optional(), // "Esta é a parcela X"
      isInstallmentValue: z.boolean().optional(), // "O valor amount refere-se à parcela?"

      // Meta associada
      goalId: z.string().uuid().nullable().optional(),
    });

    try {
      const { id } = paramSchema.parse(req.params);
      const { workspaceId } = querySchema.parse(req.query);
      const data = bodySchema.parse(req.body);

      const transactionsRepository = new TransactionsRepository();
      const updateTransactionService = new UpdateTransactionService(transactionsRepository);

      const updatedTransaction = await updateTransactionService.execute({
        id,
        workspaceId,
        ...data,
        totalInstallments: data.installments, // Mapping
      });

      return res.json(updatedTransaction);
    } catch (err: any) {
      console.error('❌ Erro no UpdateTransactionController:', err);

      if (err instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          issues: err.format(),
        });
      }

      if (err.message === 'Transação não encontrada.')
        return res.status(404).json({ error: err.message });
      if (err.message === 'Não autorizado.') return res.status(403).json({ error: err.message });

      return res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }
}
