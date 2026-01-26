import { CreditCardsRepository } from '../../repositories/credit-cards.repository';
import { TransactionsRepository } from '../../repositories/transactions.repository';
import { calculateCardLimit } from '../../utils/credit-card.utils';

interface IRequest {
  workspaceId: string;
}

export class ListCreditCardsService {
  constructor(private creditCardsRepository: CreditCardsRepository) {}

  async execute({ workspaceId }: IRequest) {
    // 1. Busca os cartões
    const cards = await this.creditCardsRepository.findByWorkspace(workspaceId);

    // Precisamos de um repo de transações para buscar o histórico
    // Nota: Em um cenário ideal, injetaríamos isso no construtor
    const transactionsRepo = new TransactionsRepository();

    // 2. Para cada cartão, calcula o limite em tempo real
    const cardsWithLimit = await Promise.all(
      cards.map(async (card) => {
        // Busca transações que impactam o limite (não pagas ou futuras)
        // Otimização: Buscamos todas, mas poderíamos filtrar por data > data_corte_segura
        const transactions = await transactionsRepo.findAllByCardId(card.id);

        const { availableLimit, usedLimit } = calculateCardLimit(card, transactions);

        return {
          ...card,
          limit: Number(card.limit), // Garante number
          availableLimit,
          usedLimit,
        };
      }),
    );

    return cardsWithLimit;
  }
}
