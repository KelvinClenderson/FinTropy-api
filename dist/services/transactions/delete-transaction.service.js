"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteTransactionService = void 0;
const date_fns_1 = require("date-fns");
const prisma_1 = require("../../lib/prisma"); // Certifique-se que o caminho está correto
class DeleteTransactionService {
    constructor(transactionsRepository) {
        this.transactionsRepository = transactionsRepository;
    }
    async execute({ id, workspaceId, deleteAll }) {
        const transaction = await this.transactionsRepository.findById(id);
        if (!transaction)
            throw new Error('Transação não encontrada.');
        if (transaction.workspaceId !== workspaceId)
            throw new Error('Não autorizado.');
        // 1. Lógica para Recorrência
        if (transaction.recurringTransactionId) {
            // Caso TRUE: Deletar TUDO (Histórico e Futuro)
            if (deleteAll === true) {
                // Assume que este método existe no seu repositório ou usa deleteMany
                await this.transactionsRepository.deleteRecurringAndTransactions(transaction.recurringTransactionId);
                return;
            }
            // Caso FALSE: Deletar DAQUI PRA FRENTE (Next)
            // "Desconecta" o histórico mantendo o passado, e apaga o futuro.
            if (deleteAll === false) {
                await prisma_1.prisma.$transaction(async (tx) => {
                    // A recorrência antiga "termina" ontem
                    const newEndDate = (0, date_fns_1.subDays)(transaction.date, 1);
                    // Atualiza a recorrência original para parar de gerar
                    await tx.recurringTransaction.update({
                        where: { id: transaction.recurringTransactionId },
                        data: { endDate: newEndDate },
                    });
                    // Apaga a transação atual e todas as futuras vinculadas a essa série
                    await tx.transaction.deleteMany({
                        where: {
                            recurringTransactionId: transaction.recurringTransactionId,
                            date: {
                                gte: transaction.date, // Maior ou igual a data atual
                            },
                        },
                    });
                });
                return;
            }
        }
        // 2. Lógica para Parcelas (Mantém deletar tudo por segurança/consistência)
        if (transaction.parentId ||
            (transaction.totalInstallments && transaction.totalInstallments > 1)) {
            const parentId = transaction.parentId || transaction.id;
            // Garante que apaga a série de parcelas inteira
            await this.transactionsRepository.deleteByParentId(parentId);
            return;
        }
        // 3. Transação Comum (Única)
        await this.transactionsRepository.delete(id);
    }
}
exports.DeleteTransactionService = DeleteTransactionService;
