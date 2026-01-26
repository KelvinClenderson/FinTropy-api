"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTransactionController = void 0;
const zod_1 = require("zod");
const transactions_repository_1 = require("../../repositories/transactions.repository");
const create_transaction_service_1 = require("../../services/transactions/create-transaction.service");
class CreateTransactionController {
    async handle(req, res) {
        const bodySchema = zod_1.z.object({
            name: zod_1.z.string(),
            amount: zod_1.z.number(),
            date: zod_1.z.string().datetime(),
            categoryId: zod_1.z.string().uuid(),
            workspaceId: zod_1.z.string().cuid().or(zod_1.z.string().uuid()),
            type: zod_1.z.enum(['EXPENSE', 'DEPOSIT', 'INVESTMENT']),
            paymentMethod: zod_1.z.enum([
                'CREDIT_CARD',
                'DEBIT_CARD',
                'BANK_TRANSFER',
                'BANK_SLIP',
                'CASH',
                'PIX',
                'OTHER',
            ]),
            // Opcionais
            observation: zod_1.z.string().nullable().optional(),
            payee: zod_1.z.string().nullable().optional(),
            memberId: zod_1.z.string().uuid().nullable().optional(),
            creditCardId: zod_1.z.string().uuid().nullable().optional(),
            // Parcelamento
            installments: zod_1.z.number().min(1).optional(),
            isInstallmentValue: zod_1.z.boolean().optional(),
            // Meta associada
            goalId: zod_1.z.string().uuid().nullable().optional(),
        });
        try {
            const data = bodySchema.parse(req.body);
            const repo = new transactions_repository_1.TransactionsRepository();
            const service = new create_transaction_service_1.CreateTransactionService(repo);
            const transaction = await service.execute({
                ...data,
                date: new Date(data.date),
                // FIX: Mapeamento explícito de 'installments' (frontend) para 'totalInstallments' (serviço)
                totalInstallments: data.installments,
            });
            return res.status(201).json(transaction);
        }
        catch (err) {
            if (err instanceof zod_1.z.ZodError)
                return res.status(400).json({ issues: err.format() });
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.CreateTransactionController = CreateTransactionController;
