"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCardLimit = exports.getInvoiceDueDate = void 0;
const date_fns_1 = require("date-fns");
/**
 * Calcula a data de vencimento da fatura para uma transação específica.
 */
const getInvoiceDueDate = (transactionDate, closingDay, dueDay) => {
    const txDate = (0, date_fns_1.startOfDay)(new Date(transactionDate));
    // Data de fechamento no mês da transação
    const closingDate = (0, date_fns_1.setDate)(txDate, closingDay);
    let invoiceMonthDate = txDate;
    // Se a compra foi feita DEPOIS ou NO DIA do fechamento, ela entra na fatura do mês seguinte
    if (!(0, date_fns_1.isBefore)(txDate, closingDate)) {
        invoiceMonthDate = (0, date_fns_1.addMonths)(invoiceMonthDate, 1);
    }
    // Define o dia do vencimento base
    let dueDate = (0, date_fns_1.setDate)(invoiceMonthDate, dueDay);
    // Regra de virada de mês: Se o dia de vencimento for menor que o fechamento
    // (ex: Fecha dia 25, Vence dia 05), o vencimento é no mês seguinte ao fechamento.
    if (dueDay < closingDay) {
        dueDate = (0, date_fns_1.addMonths)(dueDate, 1);
    }
    return dueDate;
};
exports.getInvoiceDueDate = getInvoiceDueDate;
/**
 * Calcula quanto do limite está consumido e quanto está disponível.
 * Regra: Consome limite qualquer transação cuja fatura ainda não venceu (Hoje <= Data Vencimento).
 */
const calculateCardLimit = (card, transactions) => {
    const totalLimit = Number(card.limit);
    const today = (0, date_fns_1.startOfDay)(new Date());
    // Soma tudo que ainda está "em aberto" ou "a vencer"
    const usedLimit = transactions.reduce((acc, tx) => {
        const dueDate = (0, exports.getInvoiceDueDate)(tx.date, card.closingDay, card.dueDay);
        // Se o vencimento é HOJE ou no FUTURO, o limite está ocupado.
        // Se o vencimento já passou (Ontem ou antes), o limite foi liberado (conta paga).
        if (!(0, date_fns_1.isBefore)(dueDate, today)) {
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
exports.calculateCardLimit = calculateCardLimit;
