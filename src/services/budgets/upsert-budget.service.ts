import { Prisma } from '@prisma/client';
import { BudgetsRepository } from '../../repositories/budgets.repository';

interface IRequest {
  id: string; // ID do orçamento a ser editado
  workspaceId: string; // Para segurança
  amount: number;
  isRecurring?: boolean;
}

export class UpdateBudgetService {
  constructor(private budgetsRepository: BudgetsRepository) {}

  async execute({ id, workspaceId, amount, isRecurring }: IRequest) {
    // 1. Busca o orçamento existente
    const budget = await this.budgetsRepository.findById(id);

    if (!budget) {
      throw new Error('Orçamento não encontrado.');
    }

    // 2. Garante que pertence ao workspace correto
    if (budget.workspaceId !== workspaceId) {
      throw new Error('Não autorizado.');
    }

    const amountDecimal = new Prisma.Decimal(amount);

    // 3. Atualiza
    const updatedBudget = await this.budgetsRepository.update(id, amountDecimal);

    // 4. Aplica recorrência se solicitado (usa o categoryId do orçamento original)
    if (isRecurring) {
      await this.budgetsRepository.upsertRecurringBudget(
        workspaceId,
        budget.categoryId,
        amountDecimal,
      );
    }

    return updatedBudget;
  }
}
