import { CreditCardsRepository } from '../../repositories/credit-cards.repository';

interface IRequest {
  id: string;
  workspaceId: string;
  name?: string;
  limit?: number;
  closingDay?: number;
  dueDay?: number;
  color?: string;
}

export class UpdateCreditCardService {
  constructor(private creditCardsRepository: CreditCardsRepository) {}

  async execute({ id, workspaceId, ...data }: IRequest) {
    // 1. Verifica se o cartão existe
    const card = await this.creditCardsRepository.findById(id);

    if (!card) {
      throw new Error('Cartão de crédito não encontrado.');
    }

    // 2. Segurança: Garante que pertence ao workspace do usuário
    if (card.workspaceId !== workspaceId) {
      throw new Error('Não autorizado.');
    }

    // 3. Atualiza apenas os campos enviados
    const updatedCard = await this.creditCardsRepository.update(id, {
      ...data,
    });

    return updatedCard;
  }
}
