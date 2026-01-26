"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTransactionController = void 0;
const zod_1 = require("zod");
const transactions_repository_1 = require("../../repositories/transactions.repository");
const update_transaction_service_1 = require("../../services/transactions/update-transaction.service");
class UpdateTransactionController {
    async handle(req, res) {
        // Validação da URL
        const paramSchema = zod_1.z.object({
            id: zod_1.z.string().cuid(),
        });
        // Validação da Query
        const querySchema = zod_1.z.object({
            workspaceId: zod_1.z.string().min(1, 'Workspace ID is required'),
        });
        // Validação do Body
        const bodySchema = zod_1.z.object({
            name: zod_1.z.string().optional(),
            amount: zod_1.z.number().optional(), // Pode ser parcela ou total, depende do booleano abaixo
            date: zod_1.z.string().datetime().optional(), // ISO String
            categoryId: zod_1.z.string().uuid().optional(),
            type: zod_1.z.enum(['EXPENSE', 'DEPOSIT', 'INVESTMENT']).optional(),
            paymentMethod: zod_1.z
                .enum(['CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'BANK_SLIP', 'CASH', 'PIX', 'OTHER'])
                .optional(),
            observation: zod_1.z.string().nullable().optional(),
            payee: zod_1.z.string().nullable().optional(),
            memberId: zod_1.z.string().uuid().nullable().optional(),
            // CAMPOS DE INTELIGÊNCIA DE PARCELAMENTO
            installments: zod_1.z.number().min(1).optional(), // Equivalente a totalInstallments
            installmentNumber: zod_1.z.number().min(1).optional(), // "Esta é a parcela X"
            isInstallmentValue: zod_1.z.boolean().optional(), // "O valor amount refere-se à parcela?"
            // Meta associada
            goalId: zod_1.z.string().uuid().nullable().optional(),
        });
        try {
            const { id } = paramSchema.parse(req.params);
            const { workspaceId } = querySchema.parse(req.query);
            const data = bodySchema.parse(req.body);
            const transactionsRepository = new transactions_repository_1.TransactionsRepository();
            const updateTransactionService = new update_transaction_service_1.UpdateTransactionService(transactionsRepository);
            const updatedTransaction = await updateTransactionService.execute({
                id,
                workspaceId,
                ...data,
                totalInstallments: data.installments, // Mapping
            });
            return res.json(updatedTransaction);
        }
        catch (err) {
            console.error('❌ Erro no UpdateTransactionController:', err);
            if (err instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    error: 'Validation error',
                    issues: err.format(),
                });
            }
            if (err.message === 'Transação não encontrada.')
                return res.status(404).json({ error: err.message });
            if (err.message === 'Não autorizado.')
                return res.status(403).json({ error: err.message });
            return res.status(500).json({ error: 'Internal Server Error', message: err.message });
        }
    }
}
exports.UpdateTransactionController = UpdateTransactionController;
