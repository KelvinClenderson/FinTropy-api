import { subDays } from 'date-fns';
import { prisma } from '../../lib/prisma';
import { TransactionsRepository } from '../../repositories/transactions.repository';

// 👇 CORREÇÃO: Tipo agora é boolean
interface IRequest {
  id: string;
  workspaceId: string;
  deleteScope: boolean;
}

export class DeleteTransactionService {
  constructor(private transactionsRepository: TransactionsRepository) {}

  async execute({ id, workspaceId, deleteScope }: IRequest) {
    const transaction = await this.transactionsRepository.findById(id);

    if (!transaction) throw new Error('Transação não encontrada.');
    if (transaction.workspaceId !== workspaceId) throw new Error('Não autorizado.');

    // 1. Lógica para Recorrência
    if (transaction.recurringTransactionId) {
      // Caso TRUE: Deletar TUDO (Histórico e Futuro)
      if (deleteScope === true) {
        await this.transactionsRepository.deleteRecurringAndTransactions(
          transaction.recurringTransactionId,
        );
        return;
      }

      // Caso FALSE: Deletar DAQUI PRA FRENTE (Next)
      if (deleteScope === false) {
        await prisma.$transaction(async (tx) => {
          // Encerra a regra um dia antes da transação atual
          const newEndDate = subDays(transaction.date, 1);

          await tx.recurringTransaction.update({
            where: { id: transaction.recurringTransactionId! },
            data: { endDate: newEndDate },
          });

          // Apaga a atual e as futuras
          await tx.transaction.deleteMany({
            where: {
              recurringTransactionId: transaction.recurringTransactionId,
              date: {
                gte: transaction.date,
              },
            },
          });
        });
        return;
      }
    }

    // 2. Lógica para Parcelas (Mantém deletar tudo por segurança)
    if (
      transaction.parentId ||
      (transaction.totalInstallments && transaction.totalInstallments > 1)
    ) {
      const parentId = transaction.parentId || transaction.id;
      await this.transactionsRepository.deleteByParentId(parentId);
      return;
    }

    // 3. Transação Comum
    await this.transactionsRepository.delete(id);
  }
}
