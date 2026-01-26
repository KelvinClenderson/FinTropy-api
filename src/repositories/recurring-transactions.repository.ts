import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

export class RecurringTransactionsRepository {
  // Cria uma nova recorrência
  async create(data: Prisma.RecurringTransactionUncheckedCreateInput) {
    return await prisma.recurringTransaction.create({
      data,
    });
  }

  // Lista todas do workspace (com dados da categoria e cartão)
  async findByWorkspace(workspaceId: string) {
    return await prisma.recurringTransaction.findMany({
      where: { workspaceId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
        creditCard: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Busca por ID (para validações)
  async findById(id: string) {
    return await prisma.recurringTransaction.findUnique({
      where: { id },
    });
  }

  // Deleta a recorrência (cancela assinatura)
  async delete(id: string) {
    return await prisma.recurringTransaction.delete({
      where: { id },
    });
  }
}
