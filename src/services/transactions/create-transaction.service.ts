import { Prisma, TransactionPaymentMethod, TransactionType } from '@prisma/client';
import { addMonths, startOfDay, subMonths } from 'date-fns';
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

  // Opcionais
  creditCardId?: string | null;
  payee?: string | null;
  goalId?: string | null;
  memberId?: string | null;
  observation?: string | null;

  // Parcelamento
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
    // 1. DATA BASE: Normaliza para o início do dia para evitar problemas de fuso/hora
    const rawDate = date ? startOfDay(new Date(date)) : startOfDay(new Date());

    // Variável que vai guardar a data "Financeira" (vencimento/pagamento)
    let billingDate = new Date(rawDate);

    // Variáveis auxiliares
    const finalTotalInstallments = totalInstallments || 1;
    const currentInstallmentInput = installmentNumber || 1;
    const finalMemberId = memberId === 'none' || memberId === '' ? null : memberId;

    // 2. LÓGICA DE FECHAMENTO DE FATURA (Apenas Cartão de Crédito)
    // Só aplicamos a regra de pular mês se for uma COMPRA NOVA (input diz ser parcela 1).
    if (currentInstallmentInput === 1) {
      if (paymentMethod === 'CREDIT_CARD' && creditCardId) {
        const card = await this.transactionsRepository.findCreditCardById(creditCardId);

        if (card && card.closingDay) {
          const purchaseDay = rawDate.getDate();

          // Regra: Se o dia da compra for MAIOR ou IGUAL ao fechamento, o vencimento é no próximo mês
          if (purchaseDay >= card.closingDay) {
            billingDate = addMonths(billingDate, 1);
          }
        }
      }
    } else {
      // Se o usuário está lançando a parcela "3 de 10", respeitamos a data que ele informou como sendo a data daquela parcela.
      billingDate = new Date(rawDate);
    }

    // 3. CÁLCULO DO VALOR INDIVIDUAL
    let individualAmount = amount;

    // Se não for valor da parcela (é valor total) e tem parcelas, divide.
    if (finalTotalInstallments > 1 && !isInstallmentValue) {
      individualAmount = Number((amount / finalTotalInstallments).toFixed(2));
    }

    // 4. LÓGICA DE PARCELA RETROATIVA (Reconstrução da linha do tempo)
    // Se a billingDate informada é da parcela 3, precisamos descobrir quando foi a parcela 1.
    let firstInstallmentDate = new Date(billingDate);

    if (currentInstallmentInput > 1) {
      firstInstallmentDate = subMonths(billingDate, currentInstallmentInput - 1);
    }

    // Objeto base para reutilizar
    const transactionBaseData = {
      name,
      // ⚠️ Importante: Converter number para Decimal para o Prisma
      amount: new Prisma.Decimal(individualAmount),
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

    // 5. CRIAÇÃO COM PARCELAMENTO (Múltiplas Transações)
    if (finalTotalInstallments > 1) {
      return await prisma.$transaction(async (tx) => {
        const transactionsToCreate: Prisma.TransactionCreateManyInput[] = [];
        let parentTxId: string | null = null;
        let parentTxData = null;

        for (let i = 1; i <= finalTotalInstallments; i++) {
          // Calcula a data desta parcela específica baseada na primeira
          const installmentDate = addMonths(firstInstallmentDate, i - 1);

          if (i === 1) {
            // A primeira parcela é a "Mãe" (Parent)
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
            parentTxData = parentTx;
          } else {
            // As outras entram no array para createMany (performance)
            transactionsToCreate.push({
              ...transactionBaseData,
              date: installmentDate,
              installmentNumber: i,
              totalInstallments: finalTotalInstallments,
              // Se parentTxId for null aqui, algo deu errado na lógica, mas o TS exige verificação
              parentId: parentTxId,
            });
          }
        }

        // Cria as parcelas filhas em lote
        if (transactionsToCreate.length > 0) {
          await tx.transaction.createMany({
            data: transactionsToCreate,
          });
        }

        // Retorna a transação Pai (ou a primeira criada) para o Controller
        return parentTxData;
      });
    }

    // 6. CRIAÇÃO SIMPLES (Transação única)
    // Aqui usamos o repository padrão que já deve tratar a conversão interna ou aceitar Decimal
    return await this.transactionsRepository.create({
      ...transactionBaseData,
      date: billingDate,
      installmentNumber: 1,
      totalInstallments: 1,
      parentId: null,
    });
  }
}
