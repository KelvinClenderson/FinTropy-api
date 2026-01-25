import { Request, Response } from 'express';
import { z } from 'zod';
import { TransactionsRepository } from '../../repositories/transactions.repository';
import { DeleteTransactionService } from '../../services/transactions/delete-transaction.service';

export class DeleteTransactionController {
  async handle(req: Request, res: Response) {
    const paramSchema = z.object({
      id: z.string().cuid(),
    });

    // Validamos se o usuário quer deletar tudo
    const querySchema = z.object({
      workspaceId: z.string(),
      deleteAll: z
        .enum(['true', 'false'])
        .optional()
        .transform((val) => val === 'true'),
    });

    const { id } = paramSchema.parse(req.params);
    // Aqui assumimos que o Zod vai garantir que workspaceId existe na query
    const { workspaceId, deleteAll } = querySchema.parse(req.query);

    const repo = new TransactionsRepository();
    const service = new DeleteTransactionService(repo);

    await service.execute({
      id,
      workspaceId,
      deleteAll: deleteAll || false,
    });

    return res.status(204).send();
  }
}
