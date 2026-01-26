import { RecurringTransactionsRepository } from '../../repositories/recurring-transactions.repository';

interface IRequest {
  id: string;
  workspaceId: string;
}

export class DeleteRecurringTransactionService {
  constructor(private recurringTransactionsRepository: RecurringTransactionsRepository) {}

  async execute({ id, workspaceId }: IRequest) {
    const recurring = await this.recurringTransactionsRepository.findById(id);

    if (!recurring) {
      throw new Error('Assinatura não encontrada.');
    }

    if (recurring.workspaceId !== workspaceId) {
      throw new Error('Não autorizado.');
    }

    await this.recurringTransactionsRepository.delete(id);
  }
}
