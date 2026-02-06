import { Request, Response } from 'express';
import { z } from 'zod';
import { TransactionsRepository } from '../../repositories/transactions.repository';
import { DeleteTransactionService } from '../../services/transactions/delete-transaction.service';

export class DeleteTransactionController {
  async handle(req: Request, res: Response) {
    const paramSchema = z.object({
      id: z.string().cuid(),
    });

    const querySchema = z.object({
      workspaceId: z.string().min(1, 'Workspace ID is required'),
      deleteAll: z
        .enum(['true', 'false'])
        .optional()
        // 👇 CORREÇÃO: Tipagem explícita para 'val'
        .transform((val: string | undefined) => val === 'true'),
    });

    try {
      const { id } = paramSchema.parse(req.params);
      const { workspaceId, deleteAll } = querySchema.parse(req.query);

      const repo = new TransactionsRepository();
      const service = new DeleteTransactionService(repo);

      await service.execute({
        id,
        workspaceId,
        deleteAll: deleteAll || false,
      });

      return res.status(204).send();
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          issues: err.format(),
        });
      }

      if (err.message === 'Transação não encontrada.') {
        return res.status(404).json({ error: err.message });
      }

      return res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  }
}
