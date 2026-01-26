"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecurringTransactionsRepository = void 0;
const prisma_1 = require("../lib/prisma");
class RecurringTransactionsRepository {
    // Cria uma nova recorrência
    async create(data) {
        return await prisma_1.prisma.recurringTransaction.create({
            data,
        });
    }
    // Lista todas do workspace (com dados da categoria e cartão)
    async findByWorkspace(workspaceId) {
        return await prisma_1.prisma.recurringTransaction.findMany({
            where: { workspaceId },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                        color: true,
                    },
                },
                creditCard: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    // Busca por ID (para validações)
    async findById(id) {
        return await prisma_1.prisma.recurringTransaction.findUnique({
            where: { id },
        });
    }
    // Deleta a recorrência (cancela assinatura)
    async delete(id) {
        return await prisma_1.prisma.recurringTransaction.delete({
            where: { id },
        });
    }
}
exports.RecurringTransactionsRepository = RecurringTransactionsRepository;
