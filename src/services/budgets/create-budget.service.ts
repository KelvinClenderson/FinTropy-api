import { Prisma } from '@prisma/client';
import { BudgetsRepository } from '../../repositories/budgets.repository';

interface IRequest {
  workspaceId: string;
  categoryId: string;
  month: string;
  amount: number;
  isRecurring?: boolean;
}

export class CreateBudgetService {
  constructor(private budgetsRepository: BudgetsRepository) {}

  async execute({ workspaceId, categoryId, month, amount, isRecurring }: IRequest) {
    // 1. Verifica se já existe (Regra do POST: não deve sobrescrever silenciosamente)
    const existingBudget = await this.budgetsRepository.findByMonthAndCategory(
      workspaceId,
      categoryId,
      month,
    );

    if (existingBudget) {
      throw new Error(
        'Já existe um orçamento para esta categoria neste mês. Use a rota de edição.',
      );
    }

    const amountDecimal = new Prisma.Decimal(amount);

    // 2. Cria
    const budget = await this.budgetsRepository.create({
      workspaceId,
      categoryId,
      month,
      amount: amountDecimal,
    });

    // 3. Aplica recorrência se solicitado
    if (isRecurring) {
      await this.budgetsRepository.upsertRecurringBudget(workspaceId, categoryId, amountDecimal);
    }

    return budget;
  }
}
