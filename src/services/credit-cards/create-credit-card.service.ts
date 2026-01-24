import { CreditCardsRepository } from '../../repositories/credit-cards.repository';

interface IRequest {
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  color: string;
  workspaceId: string;
}

export class CreateCreditCardService {
  constructor(private creditCardsRepository: CreditCardsRepository) {}

  async execute({ name, limit, closingDay, dueDay, color, workspaceId }: IRequest) {
    // Aqui poderíamos validar se já existe um cartão com mesmo nome, etc.

    const creditCard = await this.creditCardsRepository.create({
      name,
      limit,
      closingDay,
      dueDay,
      color,
      workspaceId,
    });

    return creditCard;
  }
}
