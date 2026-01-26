import { Goal, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

export class GoalsRepository {
  async create(data: Prisma.GoalUncheckedCreateInput): Promise<Goal> {
    return await prisma.goal.create({
      data,
    });
  }

  // Busca metas e já calcula o total economizado (soma das transações vinculadas)
  async findByWorkspace(workspaceId: string) {
    const goals = await prisma.goal.findMany({
      where: { workspaceId },
      orderBy: { deadline: 'asc' }, // As que vencem antes aparecem primeiro
      include: {
        _count: {
          select: { transactions: true }, // Conta quantas transações tem
        },
      },
    });

    // Precisamos calcular a soma manualmente ou via aggregate para cada meta
    // Uma forma performática é fazer um groupBy nas transações
    const transactionsSum = await prisma.transaction.groupBy({
      by: ['goalId'],
      where: {
        workspaceId,
        goalId: { not: null },
      },
      _sum: {
        amount: true,
      },
    });

    // Mescla os dados
    return goals.map((goal) => {
      const sumData = transactionsSum.find((t) => t.goalId === goal.id);
      const currentAmount = sumData?._sum.amount ? Number(sumData._sum.amount) : 0;

      return {
        ...goal,
        currentAmount, // Campo virtual com o valor já guardado
        progressPercentage: goal.targetAmount
          ? Math.min(Math.round((currentAmount / Number(goal.targetAmount)) * 100), 100)
          : 0,
      };
    });
  }

  async findById(id: string) {
    return await prisma.goal.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.GoalUpdateInput) {
    return await prisma.goal.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return await prisma.goal.delete({
      where: { id },
    });
  }
}
