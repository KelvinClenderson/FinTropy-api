import { CreditCard, Transaction } from '@prisma/client';
import { addMonths, isBefore, setDate, startOfDay } from 'date-fns';

/**
 * Calcula a data de vencimento da fatura para uma transação específica.
 */
export const getInvoiceDueDate = (
  transactionDate: Date,
  closingDay: number,
  dueDay: number,
): Date => {
  const txDate = startOfDay(new Date(transactionDate));

  // Data de fechamento no mês da transação
  const closingDate = setDate(txDate, closingDay);

  let invoiceMonthDate = txDate;

  // Se a compra foi feita DEPOIS ou NO DIA do fechamento, ela entra na fatura do mês seguinte
  if (!isBefore(txDate, closingDate)) {
    invoiceMonthDate = addMonths(invoiceMonthDate, 1);
  }

  // Define o dia do vencimento base
  let dueDate = setDate(invoiceMonthDate, dueDay);

  // Regra de virada de mês: Se o dia de vencimento for menor que o fechamento
  // (ex: Fecha dia 25, Vence dia 05), o vencimento é no mês seguinte ao fechamento.
  if (dueDay < closingDay) {
    dueDate = addMonths(dueDate, 1);
  }

  return dueDate;
};

/**
 * Calcula quanto do limite está consumido e quanto está disponível.
 * Regra: Consome limite qualquer transação cuja fatura ainda não venceu (Hoje <= Data Vencimento).
 */
export const calculateCardLimit = (
  card: CreditCard,
  transactions: Pick<Transaction, 'amount' | 'date'>[],
) => {
  const totalLimit = Number(card.limit);
  const today = startOfDay(new Date());

  // Soma tudo que ainda está "em aberto" ou "a vencer"
  const usedLimit = transactions.reduce((acc, tx) => {
    const dueDate = getInvoiceDueDate(tx.date, card.closingDay, card.dueDay);

    // Se o vencimento é HOJE ou no FUTURO, o limite está ocupado.
    // Se o vencimento já passou (Ontem ou antes), o limite foi liberado (conta paga).
    if (!isBefore(dueDate, today)) {
      return acc + Number(tx.amount);
    }

    return acc;
  }, 0);

  return {
    totalLimit,
    usedLimit,
    availableLimit: totalLimit - usedLimit,
  };
};
