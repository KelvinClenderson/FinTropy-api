import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

export class CreditCardsRepository {
  async create(data: Prisma.CreditCardUncheckedCreateInput) {
    return await prisma.creditCard.create({
      data,
    });
  }

  async findByWorkspace(workspaceId: string) {
    return await prisma.creditCard.findMany({
      where: { workspaceId },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    return await prisma.creditCard.findUnique({
      where: { id },
    });
  }

  async delete(id: string) {
    return await prisma.creditCard.delete({
      where: { id },
    });
  }
}
