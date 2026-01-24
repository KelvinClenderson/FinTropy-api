import { Request, Response } from 'express';
import { z } from 'zod';
import { CreditCardsRepository } from '../../repositories/credit-cards.repository';
import { CreateCreditCardService } from '../../services/credit-cards/create-credit-card.service';

export class CreateCreditCardController {
  async handle(req: Request, res: Response) {
    const createCardSchema = z.object({
      name: z.string().min(1),
      limit: z.number().positive(),
      closingDay: z.number().min(1).max(31),
      dueDay: z.number().min(1).max(31),
      color: z.string().startsWith('#').length(7),
      workspaceId: z.string().uuid().or(z.string().cuid()), // Aceita ambos formatos
    });

    try {
      const data = createCardSchema.parse(req.body);

      const creditCardsRepository = new CreditCardsRepository();
      const createCreditCardService = new CreateCreditCardService(creditCardsRepository);

      const creditCard = await createCreditCardService.execute(data);

      return res.status(201).json(creditCard);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: 'Erro de validação', issues: err.format() });
      }
      return res.status(400).json({ error: (err as Error).message });
    }
  }
}
