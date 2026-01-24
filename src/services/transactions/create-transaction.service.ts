import { TransactionPaymentMethod, TransactionType } from '@prisma/client';
import { addMonths, subMonths } from 'date-fns';
import { prisma } from '../../lib/prisma';
import { TransactionsRepository } from '../../repositories/transactions.repository';

interface IRequest {
  name: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  paymentMethod: TransactionPaymentMethod;
  date?: string | Date;
  workspaceId: string;
  creditCardId?: string | null;
  payee?: string | null;
  goalId?: string | null;
  memberId?: string | null;
  observation?: string | null;
  totalInstallments?: number | null;
  installmentNumber?: number | null;
  isInstallmentValue?: boolean;
}

export class CreateTransactionService {
  constructor(private transactionsRepository: TransactionsRepository) {}

  async execute({
    name,
    amount,
    type,
    categoryId,
    paymentMethod,
    date,
    workspaceId,
    creditCardId,
    payee,
    goalId,
    memberId,
    observation,
    totalInstallments = 1,
    installmentNumber = 1,
    isInstallmentValue = false,
  }: IRequest) {
    // 1. DATA BASE: Pega a data escolhida ou a atual
    const rawDate = date ? new Date(date) : new Date();

    // Variável que vai guardar a data "Financeira"
    let billingDate = new Date(rawDate);

    // Variáveis auxiliares
    const finalTotalInstallments = totalInstallments || 1;
    const currentInstallmentInput = installmentNumber || 1;
    const finalMemberId = memberId === 'none' || memberId === '' ? null : memberId;

    // 2. LÓGICA DE FECHAMENTO DE FATURA (Cartão de Crédito)
    // ⚠️ CORREÇÃO: Só aplicamos a regra de pular mês se for uma COMPRA NOVA (Parcela 1).
    // Se o usuário está lançando a parcela 2, 3, etc., respeitamos a data que ele informou.
    if (currentInstallmentInput === 1) {
      if (paymentMethod === 'CREDIT_CARD' && creditCardId) {
        const card = await this.transactionsRepository.findCreditCardById(creditCardId);

        if (card && card.closingDay) {
          const purchaseDay = rawDate.getDate();

          // Regra: Se o dia da compra for MAIOR ou IGUAL ao fechamento, pula 1 mês
          if (purchaseDay >= card.closingDay) {
            billingDate = addMonths(billingDate, 1);
          }
        }
      }
    } else {
      // Se não é a parcela 1, a billingDate é EXATAMENTE a data informada.
      // O usuário sabe que a parcela 2 vence dia X.
      billingDate = new Date(rawDate);
    }

    // 3. CÁLCULO DO VALOR
    let individualAmount = amount;
    if (finalTotalInstallments > 1 && !isInstallmentValue) {
      individualAmount = Number((amount / finalTotalInstallments).toFixed(2));
    }

    // 4. LÓGICA DE PARCELA RETROATIVA
    // Se a billingDate é da parcela 2 (Jan), a parcela 1 foi em Dezembro.
    let firstInstallmentDate = new Date(billingDate);

    if (currentInstallmentInput > 1) {
      firstInstallmentDate = subMonths(billingDate, currentInstallmentInput - 1);
    }

    const transactionBaseData = {
      name,
      amount: individualAmount,
      type,
      categoryId,
      paymentMethod,
      workspaceId,
      creditCardId: paymentMethod === 'CREDIT_CARD' ? creditCardId : null,
      payee: payee || null,
      goalId: goalId || null,
      memberId: finalMemberId,
      observation: observation || null,
    };

    // 5. CRIAÇÃO COM PARCELAMENTO
    if (finalTotalInstallments > 1) {
      return await prisma.$transaction(async (tx) => {
        const transactionsToCreate = [];
        let parentTxId = null;

        for (let i = 1; i <= finalTotalInstallments; i++) {
          const installmentDate = addMonths(firstInstallmentDate, i - 1);

          if (i === 1) {
            const parentTx = await tx.transaction.create({
              data: {
                ...transactionBaseData,
                date: installmentDate,
                installmentNumber: 1,
                totalInstallments: finalTotalInstallments,
                parentId: null,
              },
            });
            parentTxId = parentTx.id;
          } else {
            transactionsToCreate.push({
              ...transactionBaseData,
              date: installmentDate,
              installmentNumber: i,
              totalInstallments: finalTotalInstallments,
              parentId: parentTxId,
            });
          }
        }

        if (transactionsToCreate.length > 0) {
          await tx.transaction.createMany({
            data: transactionsToCreate,
          });
        }

        // Retornamos a transação "Pai" para a resposta da API
        return { id: parentTxId, ...transactionBaseData, date: firstInstallmentDate };
      });
    }

    // 6. CRIAÇÃO SIMPLES
    return await this.transactionsRepository.create({
      ...transactionBaseData,
      date: billingDate,
      installmentNumber: 1,
      totalInstallments: 1,
    });
  }
}
