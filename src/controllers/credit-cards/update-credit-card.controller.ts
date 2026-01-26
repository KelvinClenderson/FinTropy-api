import { Request, Response } from 'express';
import { z } from 'zod';
import { CreditCardsRepository } from '../../repositories/credit-cards.repository';
import { UpdateCreditCardService } from '../../services/credit-cards/update-credit-card.service';

export class UpdateCreditCardController {
  async handle(req: Request, res: Response) {
    // Validação dos Parâmetros
    const paramSchema = z.object({ id: z.string().cuid().or(z.string().uuid()) });
    const querySchema = z.object({ workspaceId: z.string().min(1) });

    // Validação do Body (Tudo opcional para edição parcial)
    const bodySchema = z.object({
      name: z.string().min(1).optional(),
      limit: z.number().positive().optional(),
      closingDay: z.number().min(1).max(31).optional(),
      dueDay: z.number().min(1).max(31).optional(),
      color: z.string().startsWith('#').length(7).optional(),
    });

    try {
      const { id } = paramSchema.parse(req.params);
      const { workspaceId } = querySchema.parse(req.query);
      const data = bodySchema.parse(req.body);

      const repo = new CreditCardsRepository();
      const service = new UpdateCreditCardService(repo);

      const updatedCard = await service.execute({
        id,
        workspaceId,
        ...data,
      });

      return res.json(updatedCard);
    } catch (err: any) {
      if (err instanceof z.ZodError) return res.status(400).json({ issues: err.format() });
      if (err.message === 'Não autorizado.') return res.status(403).json({ error: err.message });
      if (err.message === 'Cartão de crédito não encontrado.')
        return res.status(404).json({ error: err.message });

      return res.status(500).json({ error: err.message });
    }
  }
}
