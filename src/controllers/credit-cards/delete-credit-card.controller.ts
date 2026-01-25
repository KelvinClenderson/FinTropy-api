import { Request, Response } from 'express';
import { z } from 'zod';
import { CreditCardsRepository } from '../../repositories/credit-cards.repository';

export class DeleteCreditCardController {
  async handle(req: Request, res: Response) {
    const deleteCardSchema = z.object({
      id: z.string().cuid().or(z.string().uuid()), // Aceita ID do cartão
    });

    try {
      const { id } = deleteCardSchema.parse(req.params);

      const creditCardsRepository = new CreditCardsRepository();

      // TODO: Futuramente, validar se tem transações vinculadas antes de deletar
      // Por enquanto, deleta direto
      await creditCardsRepository.delete(id);

      return res.status(204).send(); // 204 = No Content (Sucesso sem corpo)
    } catch (err) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
  }
}
