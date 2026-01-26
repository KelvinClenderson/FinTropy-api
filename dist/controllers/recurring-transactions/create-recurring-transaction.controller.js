"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRecurringTransactionController = void 0;
const zod_1 = require("zod");
const create_recurring_transaction_service_1 = require("../../services/recurring-transactions/create-recurring-transaction.service");
class CreateRecurringTransactionController {
    async handle(req, res) {
        const bodySchema = zod_1.z.object({
            name: zod_1.z.string(),
            amount: zod_1.z.number().positive(),
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
            dayOfPayment: zod_1.z.number().min(1).max(31),
            startDate: zod_1.z.string().datetime(),
            endDate: zod_1.z.string().datetime().optional(),
            categoryId: zod_1.z.string().uuid(),
            workspaceId: zod_1.z.string().cuid().or(zod_1.z.string().uuid()),
            // Opcionais
            creditCardId: zod_1.z.string().uuid().optional().nullable(),
            memberId: zod_1.z.string().uuid().optional().nullable(),
            payee: zod_1.z.string().optional().nullable(),
            observation: zod_1.z.string().nullable().optional(),
        });
        try {
            const data = bodySchema.parse(req.body);
            const service = new create_recurring_transaction_service_1.CreateRecurringTransactionService();
            const result = await service.execute({
                ...data,
                endDate: data.endDate,
                creditCardId: data.creditCardId ?? undefined,
                memberId: data.memberId ?? undefined,
                payee: data.payee ?? undefined,
            });
            return res.status(201).json(result);
        }
        catch (err) {
            if (err instanceof zod_1.z.ZodError)
                return res.status(400).json({ issues: err.format() });
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.CreateRecurringTransactionController = CreateRecurringTransactionController;
