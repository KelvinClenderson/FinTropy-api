import { TransactionsRepository } from '../../repositories/transactions.repository';

interface IRequest {
  workspaceId: string;
  month: number;
  year: number;
}

export class FetchTransactionsService {
  constructor(private transactionsRepository: TransactionsRepository) {}

  async execute({ workspaceId, month, year }: IRequest) {
    return await this.transactionsRepository.findAllByMonth({ workspaceId, month, year });
  }
}
