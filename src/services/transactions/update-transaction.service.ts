import { Prisma, TransactionPaymentMethod, TransactionType } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { TransactionsRepository } from '../../repositories/transactions.repository';

interface IRequest {
  id: string;
  workspaceId: string;
  name?: string;
  amount?: number;
  date?: string | Date;
  categoryId?: string;
  type?: TransactionType;
  paymentMethod?: TransactionPaymentMethod;
  observation?: string | null;
  payee?: string | null;
  memberId?: string | null;
}

export class UpdateTransactionService {
  constructor(private transactionsRepository: TransactionsRepository) {}

  async execute({ id, workspaceId, ...data }: IRequest) {
    const transaction = await this.transactionsRepository.findById(id);

    if (!transaction) throw new Error('Transação não encontrada.');
    if (transaction.workspaceId !== workspaceId) throw new Error('Não autorizado.');

    // Preparar objeto de atualização
    const dataToUpdate: Prisma.TransactionUpdateInput = {};

    if (data.name) dataToUpdate.name = data.name;
    if (data.amount) dataToUpdate.amount = new Prisma.Decimal(data.amount);
    if (data.type) dataToUpdate.type = data.type;
    if (data.paymentMethod) dataToUpdate.paymentMethod = data.paymentMethod;
    if (data.observation !== undefined) dataToUpdate.observation = data.observation;
    if (data.payee !== undefined) dataToUpdate.payee = data.payee;

    // Atualização usando Relation Connect (padrão para single update fora de loop complexo)
    if (data.categoryId) dataToUpdate.category = { connect: { id: data.categoryId } };

    // Member (Responsável)
    if (data.memberId !== undefined) {
      dataToUpdate.member = data.memberId
        ? { connect: { id: data.memberId } }
        : { disconnect: true };
    }

    // CENÁRIO 1: Transação Comum (Sem Recorrência)
    if (!transaction.recurringTransactionId) {
      if (data.date) dataToUpdate.date = new Date(data.date);
      return await this.transactionsRepository.update(id, dataToUpdate);
    }

    // CENÁRIO 2: Transação Recorrente (Propagar para todas)
    const recurringId = transaction.recurringTransactionId;

    await prisma.$transaction(async (tx) => {
      // A. Atualiza a Regra Mestra
      // CORREÇÃO: Usamos memberId e categoryId diretos aqui para evitar conflito de tipos
      await tx.recurringTransaction.update({
        where: { id: recurringId },
        data: {
          name: data.name,
          amount: data.amount ? new Prisma.Decimal(data.amount) : undefined,
          type: data.type,
          paymentMethod: data.paymentMethod,
          observation: data.observation,
          payee: data.payee,

          // 👇 AQUI A MUDANÇA: Usando scalar fields (IDs diretos)
          // O Prisma aceita isso como 'UncheckedUpdateInput' e para de reclamar
          categoryId: data.categoryId,
          memberId: data.memberId,
        },
      });

      // B. Atualiza TODAS as transações filhas dessa recorrência
      await tx.transaction.updateMany({
        where: { recurringTransactionId: recurringId },
        data: {
          name: data.name, // Strings diretas são aceitas no updateMany
          amount: data.amount ? new Prisma.Decimal(data.amount) : undefined,
          type: data.type,
          paymentMethod: data.paymentMethod,
          observation: data.observation,
          payee: data.payee,
          categoryId: data.categoryId, // UpdateMany só aceita IDs diretos mesmo
          memberId: data.memberId, // UpdateMany só aceita IDs diretos mesmo
        },
      });

      // C. Se editou a DATA, atualiza ESPECIFICAMENTE esta transação
      if (data.date) {
        await tx.transaction.update({
          where: { id: id },
          data: { date: new Date(data.date) },
        });
      }
    });

    return await this.transactionsRepository.findById(id);
  }
}
