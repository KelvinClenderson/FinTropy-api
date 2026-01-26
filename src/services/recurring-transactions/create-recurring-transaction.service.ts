import { Prisma, TransactionPaymentMethod, TransactionType } from '@prisma/client';
import { addMonths, addYears, isAfter, isBefore, setDate, startOfDay } from 'date-fns';
import { prisma } from '../../lib/prisma';

interface IRequest {
  name: string;
  amount: number;
  type: TransactionType;
  paymentMethod: TransactionPaymentMethod;
  dayOfPayment: number;
  startDate: string | Date;
  endDate?: string | Date;
  workspaceId: string;
  categoryId: string;
  creditCardId?: string;
  memberId?: string;
  payee?: string;
  observation?: string | null;
}

export class CreateRecurringTransactionService {
  async execute(data: IRequest) {
    const { amount, creditCardId, memberId, startDate, dayOfPayment, ...rest } = data;

    const startDateTime = startOfDay(new Date(startDate));

    // Data final (default 2 anos)
    let endDateTime: Date;
    if (data.endDate) {
      endDateTime = startOfDay(new Date(data.endDate));
    } else {
      endDateTime = addYears(startDateTime, 2);
    }

    if (isAfter(startDateTime, endDateTime)) {
      throw new Error('A data inicial não pode ser maior que a data final.');
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Cria a Regra
      const recurringRule = await tx.recurringTransaction.create({
        data: {
          ...rest,
          startDate: startDateTime,
          endDate: endDateTime,
          dayOfPayment,
          amount: new Prisma.Decimal(amount),
          creditCardId: creditCardId || null,
          memberId: memberId || null,
        },
      });

      // 2. Loop de Pré-geração
      const transactionsToCreate: Prisma.TransactionCreateManyInput[] = [];
      let currentMonthDate = startDateTime;

      while (
        isBefore(currentMonthDate, endDateTime) ||
        currentMonthDate.getTime() === endDateTime.getTime()
      ) {
        let transactionDate = setDate(currentMonthDate, dayOfPayment);

        if (isBefore(transactionDate, startDateTime)) {
          transactionDate = addMonths(transactionDate, 1);
          currentMonthDate = transactionDate;
        }

        if (isAfter(transactionDate, endDateTime)) break;

        transactionsToCreate.push({
          workspaceId: data.workspaceId,
          categoryId: data.categoryId,
          name: data.name,
          amount: new Prisma.Decimal(amount),
          totalAmount: new Prisma.Decimal(amount), // Recorrência: Total = Parcela
          type: data.type,
          paymentMethod: data.paymentMethod,
          date: transactionDate,
          observation: data.observation,
          payee: data.payee,
          memberId: memberId || null,
          creditCardId: creditCardId || null,
          recurringTransactionId: recurringRule.id,
          installmentNumber: null,
          totalInstallments: null,
          parentId: null,
        });

        currentMonthDate = addMonths(currentMonthDate, 1);
      }

      if (transactionsToCreate.length > 0) {
        await tx.transaction.createMany({ data: transactionsToCreate });
      }

      return recurringRule;
    });

    return result;
  }
}
