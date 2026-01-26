"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteTransactionController = void 0;
const zod_1 = require("zod");
const transactions_repository_1 = require("../../repositories/transactions.repository");
const delete_transaction_service_1 = require("../../services/transactions/delete-transaction.service");
class DeleteTransactionController {
    async handle(req, res) {
        // Validação de Parâmetros de Rota
        const paramSchema = zod_1.z.object({
            id: zod_1.z.string().uuid(), // Alterado para UUID para evitar erro se seu banco usa UUID
        });
        // Validação de Query Params
        const querySchema = zod_1.z.object({
            workspaceId: zod_1.z.string(),
            deleteAll: zod_1.z
                .enum(['true', 'false'])
                .optional()
                .transform((val) => val === 'true'), // Converte string 'true'/'false' para boolean
        });
        try {
            const { id } = paramSchema.parse(req.params);
            // Valida e extrai workspaceId e deleteAll (padrão false se não enviado)
            const { workspaceId, deleteAll } = querySchema.parse(req.query);
            const repo = new transactions_repository_1.TransactionsRepository();
            const service = new delete_transaction_service_1.DeleteTransactionService(repo);
            await service.execute({
                id,
                workspaceId,
                deleteAll: deleteAll || false, // Passa o boolean para o service
            });
            return res.status(204).send();
        }
        catch (err) {
            // Tratamento básico de erros do Zod ou do Service
            if (err instanceof zod_1.z.ZodError) {
                return res.status(400).json({ issues: err.format() });
            }
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.DeleteTransactionController = DeleteTransactionController;
