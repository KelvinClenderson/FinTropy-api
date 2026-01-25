import { Prisma, RecurringTransaction } from '@prisma/client';
import { prisma } from '../lib/prisma';

export class RecurringTransactionsRepository {
  // 1. Criar nova recorrência
  async create(
    data: Prisma.RecurringTransactionUncheckedCreateInput,
  ): Promise<RecurringTransaction> {
    return await prisma.recurringTransaction.create({
      data,
    });
  }

  // 2. Listar por Workspace
  async findByWorkspace(workspaceId: string) {
    return await prisma.recurringTransaction.findMany({
      where: { workspaceId },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
    });
  }

  // 3. Deletar (Já fizemos a lógica no TransactionRepo, mas é bom ter aqui o básico)
  async delete(id: string) {
    await prisma.recurringTransaction.delete({
      where: { id },
    });
  }
}
