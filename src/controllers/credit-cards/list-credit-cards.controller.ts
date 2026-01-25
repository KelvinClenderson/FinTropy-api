import { Request, Response } from 'express';
import { z } from 'zod';
import { CreditCardsRepository } from '../../repositories/credit-cards.repository';

export class ListCreditCardsController {
  async handle(req: Request, res: Response) {
    const listCardsSchema = z.object({
      workspaceId: z.string(),
    });

    try {
      // Pega o workspaceId da URL (Query Params)
      const { workspaceId } = listCardsSchema.parse(req.query);

      const creditCardsRepository = new CreditCardsRepository();
      const creditCards = await creditCardsRepository.findByWorkspace(workspaceId);

      return res.json(creditCards);
    } catch (err) {
      return res.status(400).json({ error: 'Workspace ID is required' });
    }
  }
}
