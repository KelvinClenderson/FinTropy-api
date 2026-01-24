import { Request, Response } from 'express';
import { TransactionsRepository } from '../../repositories/transactions.repository';

// Lista de métodos padrão do sistema (Enums)
// Removemos CREDIT_CARD dessa lista para não duplicar, já que listaremos os cartões reais
const STANDARD_METHODS = [
  { key: 'CASH', label: 'Dinheiro' },
  { key: 'PIX', label: 'Pix' },
  { key: 'DEBIT_CARD', label: 'Cartão de Débito' },
  { key: 'BANK_TRANSFER', label: 'Transferência Bancária' },
  { key: 'BANK_SLIP', label: 'Boleto' },
  { key: 'OTHER', label: 'Outro' },
];

export class GetPaymentMethodsController {
  async handle(req: Request, res: Response) {
    try {
      // Precisamos do workspaceId. Podemos pegar do query param ou assumir o do usuário
      // Para garantir, vamos pegar via Query Param, pois um usuário pode ter vários workspaces
      const { workspaceId } = req.query;

      if (!workspaceId) {
        return res.status(400).json({ error: 'Workspace ID is required' });
      }

      const transactionsRepository = new TransactionsRepository();

      // Buscar métodos customizados (Cartões)
      const creditCards = await transactionsRepository.findCreditCardsByWorkspace(
        String(workspaceId),
      );

      // Formatar os cartões para o mesmo padrão visual
      const creditCardMethods = creditCards.map((card) => ({
        key: 'CREDIT_CARD', // O tipo no banco continua sendo CREDIT_CARD
        id: card.id, // Mas enviamos o ID específico
        label: card.name, // O nome que o usuário deu (ex: "Nubank")
        type: 'CUSTOM', // Flag para o front saber que é customizado
      }));

      // Unir as listas
      const response = {
        standards: STANDARD_METHODS.map((m) => ({ ...m, type: 'STANDARD' })),
        userMethods: creditCardMethods,
      };

      return res.json(response);
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
