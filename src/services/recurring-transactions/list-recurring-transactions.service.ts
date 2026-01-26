import { RecurringTransactionsRepository } from '../../repositories/recurring-transactions.repository';

interface IRequest {
  workspaceId: string;
}

export class ListRecurringTransactionsService {
  constructor(private recurringTransactionsRepository: RecurringTransactionsRepository) {}

  async execute({ workspaceId }: IRequest) {
    return await this.recurringTransactionsRepository.findByWorkspace(workspaceId);
  }
}
