"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRecurringTransactionService = void 0;
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
const prisma_1 = require("../../lib/prisma");
class CreateRecurringTransactionService {
    async execute(data) {
        const { amount, creditCardId, memberId, startDate, dayOfPayment, ...rest } = data;
        const startDateTime = (0, date_fns_1.startOfDay)(new Date(startDate));
        // Data final (default 2 anos)
        let endDateTime;
        if (data.endDate) {
            endDateTime = (0, date_fns_1.startOfDay)(new Date(data.endDate));
        }
        else {
            endDateTime = (0, date_fns_1.addYears)(startDateTime, 2);
        }
        if ((0, date_fns_1.isAfter)(startDateTime, endDateTime)) {
            throw new Error('A data inicial não pode ser maior que a data final.');
        }
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            // 1. Cria a Regra
            const recurringRule = await tx.recurringTransaction.create({
                data: {
                    ...rest,
                    startDate: startDateTime,
                    endDate: endDateTime,
                    dayOfPayment,
                    amount: new client_1.Prisma.Decimal(amount),
                    creditCardId: creditCardId || null,
                    memberId: memberId || null,
                },
            });
            // 2. Loop de Pré-geração
            const transactionsToCreate = [];
            let currentMonthDate = startDateTime;
            while ((0, date_fns_1.isBefore)(currentMonthDate, endDateTime) ||
                currentMonthDate.getTime() === endDateTime.getTime()) {
                let transactionDate = (0, date_fns_1.setDate)(currentMonthDate, dayOfPayment);
                if ((0, date_fns_1.isBefore)(transactionDate, startDateTime)) {
                    transactionDate = (0, date_fns_1.addMonths)(transactionDate, 1);
                    currentMonthDate = transactionDate;
                }
                if ((0, date_fns_1.isAfter)(transactionDate, endDateTime))
                    break;
                transactionsToCreate.push({
                    workspaceId: data.workspaceId,
                    categoryId: data.categoryId,
                    name: data.name,
                    amount: new client_1.Prisma.Decimal(amount),
                    totalAmount: new client_1.Prisma.Decimal(amount), // Recorrência: Total = Parcela
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
                currentMonthDate = (0, date_fns_1.addMonths)(currentMonthDate, 1);
            }
            if (transactionsToCreate.length > 0) {
                await tx.transaction.createMany({ data: transactionsToCreate });
            }
            return recurringRule;
        });
        return result;
    }
}
exports.CreateRecurringTransactionService = CreateRecurringTransactionService;
