"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditCardsRepository = void 0;
const prisma_1 = require("../lib/prisma");
class CreditCardsRepository {
    async create(data) {
        return await prisma_1.prisma.creditCard.create({
            data,
        });
    }
    async findByWorkspace(workspaceId) {
        return await prisma_1.prisma.creditCard.findMany({
            where: { workspaceId },
            orderBy: { name: 'asc' },
        });
    }
    async findById(id) {
        return await prisma_1.prisma.creditCard.findUnique({
            where: { id },
        });
    }
    // 👇 NOVO MÉTODO
    async update(id, data) {
        return await prisma_1.prisma.creditCard.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return await prisma_1.prisma.creditCard.delete({
            where: { id },
        });
    }
}
exports.CreditCardsRepository = CreditCardsRepository;
