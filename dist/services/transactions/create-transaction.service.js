"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTransactionService = void 0;
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
const prisma_1 = require("../../lib/prisma");
const credit_card_utils_1 = require("../../utils/credit-card.utils");
class CreateTransactionService {
    constructor(transactionsRepository) {
        this.transactionsRepository = transactionsRepository;
    }
    async execute({ name, amount, type, categoryId, paymentMethod, date, workspaceId, creditCardId, payee, goalId, memberId, observation, totalInstallments = 1, installmentNumber = 1, isInstallmentValue = false, }) {
        // 1. DATA BASE: Normaliza para o início do dia
        const rawDate = date ? (0, date_fns_1.startOfDay)(new Date(date)) : (0, date_fns_1.startOfDay)(new Date());
        let billingDate = new Date(rawDate);
        const finalTotalInstallments = totalInstallments || 1;
        const currentInstallmentInput = installmentNumber || 1;
        const finalMemberId = memberId === 'none' || memberId === '' ? null : memberId;
        // 2. LÓGICA DE FECHAMENTO DE FATURA (Apenas se for Cartão de Crédito e for a parcela base)
        if (currentInstallmentInput === 1) {
            if (paymentMethod === 'CREDIT_CARD' && creditCardId) {
                const card = await this.transactionsRepository.findCreditCardById(creditCardId);
                if (card && card.closingDay) {
                    const purchaseDay = rawDate.getDate();
                    // Se o dia da compra for >= fechamento, joga para o próximo mês
                    if (purchaseDay >= card.closingDay) {
                        billingDate = (0, date_fns_1.addMonths)(billingDate, 1);
                    }
                }
            }
        }
        else {
            // Se não for a primeira parcela (ex: recriação), respeita a data recebida
            billingDate = new Date(rawDate);
        }
        // 3. CÁLCULO DOS VALORES (Individual vs Total)
        let individualAmount = amount;
        let totalPurchaseAmount = amount;
        if (finalTotalInstallments > 1) {
            if (!isInstallmentValue) {
                // Input é o TOTAL (ex: Notebook 5000 em 10x) -> Parcela será 500
                totalPurchaseAmount = amount;
                individualAmount = Number((amount / finalTotalInstallments).toFixed(2));
            }
            else {
                // Input é a PARCELA (ex: Notebook, parcela de 500 em 10x) -> Total será 5000
                individualAmount = amount;
                totalPurchaseAmount = Number((amount * finalTotalInstallments).toFixed(2));
            }
        }
        // 4. VERIFICAÇÃO DE LIMITE DO CARTÃO (NOVO)
        if (paymentMethod === 'CREDIT_CARD' && creditCardId && type === 'EXPENSE') {
            const card = await this.transactionsRepository.findCreditCardById(creditCardId);
            if (card) {
                // Busca todas as transações atuais desse cartão para calcular o consumo atual
                const cardTransactions = await this.transactionsRepository.findAllByCardId(creditCardId);
                // Calcula quanto já está usado e quanto está livre
                const { availableLimit } = (0, credit_card_utils_1.calculateCardLimit)(card, cardTransactions);
                // Verifica se o valor TOTAL da compra cabe no limite disponível
                // (Compras parceladas consomem o limite total imediatamente)
                if (totalPurchaseAmount > availableLimit) {
                    throw new Error(`Limite insuficiente. Disponível: R$ ${availableLimit.toFixed(2).replace('.', ',')}`);
                }
            }
        }
        // 5. CÁLCULO DA DATA BASE (TIME TRAVEL)
        // Se a requisição diz "Esta é a parcela 3", precisamos achar quando foi a parcela 1.
        let firstInstallmentDate = new Date(billingDate);
        if (currentInstallmentInput > 1) {
            firstInstallmentDate = (0, date_fns_1.subMonths)(billingDate, currentInstallmentInput - 1);
        }
        // Objeto Base
        const transactionBaseData = {
            name,
            amount: new client_1.Prisma.Decimal(individualAmount),
            totalAmount: new client_1.Prisma.Decimal(totalPurchaseAmount), // Persistência do Total
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
        // 6. CRIAÇÃO DE PARCELAMENTO (Múltiplas Transações)
        if (finalTotalInstallments > 1) {
            return await prisma_1.prisma.$transaction(async (tx) => {
                const transactionsToCreate = [];
                let parentTxId = null;
                let parentTxData = null;
                for (let i = 1; i <= finalTotalInstallments; i++) {
                    const installmentDate = (0, date_fns_1.addMonths)(firstInstallmentDate, i - 1);
                    if (i === 1) {
                        // Cria a transação PAI
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
                    }
                    else {
                        // Cria as transações FILHAS
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
                return parentTxData;
            });
        }
        // 7. CRIAÇÃO SIMPLES (Transação Única)
        return await this.transactionsRepository.create({
            ...transactionBaseData,
            date: billingDate,
            installmentNumber: 1,
            totalInstallments: 1,
            parentId: null,
        });
    }
}
exports.CreateTransactionService = CreateTransactionService;
