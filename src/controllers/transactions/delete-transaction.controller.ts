import { Request, Response } from 'express';
import { z } from 'zod';
import { TransactionsRepository } from '../../repositories/transactions.repository';
import { DeleteTransactionService } from '../../services/transactions/delete-transaction.service';

export class DeleteTransactionController {
  async handle(req: Request, res: Response) {
    // Validação de Parâmetros de Rota
    const paramSchema = z.object({
      id: z.string().uuid(), // Alterado para UUID para evitar erro se seu banco usa UUID
    });

    // Validação de Query Params
    const querySchema = z.object({
      workspaceId: z.string(),
      deleteAll: z
        .enum(['true', 'false'])
        .optional()
        .transform((val) => val === 'true'), // Converte string 'true'/'false' para boolean
    });

    try {
      const { id } = paramSchema.parse(req.params);

      // Valida e extrai workspaceId e deleteAll (padrão false se não enviado)
      const { workspaceId, deleteAll } = querySchema.parse(req.query);

      const repo = new TransactionsRepository();
      const service = new DeleteTransactionService(repo);

      await service.execute({
        id,
        workspaceId,
        deleteAll: deleteAll || false, // Passa o boolean para o service
      });

      return res.status(204).send();
    } catch (err: any) {
      // Tratamento básico de erros do Zod ou do Service
      if (err instanceof z.ZodError) {
        return res.status(400).json({ issues: err.format() });
      }
      return res.status(400).json({ error: err.message });
    }
  }
}
