import { Request, Response } from 'express';
import { z } from 'zod';
import { TransactionsRepository } from '../../repositories/transactions.repository';
import { UpdateTransactionService } from '../../services/transactions/update-transaction.service';

export class UpdateTransactionController {
  async handle(req: Request, res: Response) {
    // 1. Validação do ID na URL
    const paramSchema = z.object({
      id: z.string().cuid(),
    });

    // 2. Validação do Workspace na Query (Para segurança)
    const querySchema = z.object({
      workspaceId: z.string().min(1, 'Workspace ID is required'),
    });

    // 3. Validação do Corpo (Body) - Todos opcionais pois é uma edição parcial (PATCH/PUT)
    const bodySchema = z.object({
      name: z.string().optional(),
      amount: z.number().optional(), // Recebe number (ex: 150.00)
      date: z.string().datetime().optional(), // Espera ISO String (ex: "2026-02-15T10:00:00Z")
      categoryId: z.string().uuid().optional(),

      // Enums exatos do seu Schema Prisma
      type: z.enum(['EXPENSE', 'DEPOSIT', 'INVESTMENT']).optional(),
      paymentMethod: z
        .enum(['CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'BANK_SLIP', 'CASH', 'PIX', 'OTHER'])
        .optional(),

      observation: z.string().nullable().optional(),
      payee: z.string().nullable().optional(),
    });

    try {
      // Parse dos dados
      const { id } = paramSchema.parse(req.params);
      const { workspaceId } = querySchema.parse(req.query);
      const data = bodySchema.parse(req.body);

      // Injeção de Dependência
      const transactionsRepository = new TransactionsRepository();
      const updateTransactionService = new UpdateTransactionService(transactionsRepository);

      // Execução
      const updatedTransaction = await updateTransactionService.execute({
        id,
        workspaceId,
        ...data,
      });

      return res.json(updatedTransaction);
    } catch (err: any) {
      // Log do erro no terminal para facilitar seu debug
      console.error('❌ Erro no UpdateTransactionController:', err);

      // Erros de Validação do Zod
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          issues: err.format(),
        });
      }

      // Erros conhecidos do Service
      if (err.message === 'Transação não encontrada.') {
        return res.status(404).json({ error: err.message });
      }

      if (err.message === 'Não autorizado.') {
        return res.status(403).json({ error: err.message });
      }

      // Erro Genérico
      return res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
      });
    }
  }
}
