"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembersRepository = void 0;
const prisma_1 = require("../lib/prisma");
class MembersRepository {
    // Cria um novo responsável (sem login)
    async create(data) {
        return await prisma_1.prisma.member.create({
            data,
        });
    }
    // Lista os responsáveis de um workspace
    async findByWorkspace(workspaceId) {
        return await prisma_1.prisma.member.findMany({
            where: { workspaceId },
            orderBy: { name: 'asc' },
        });
    }
    // Busca por ID
    async findById(id) {
        return await prisma_1.prisma.member.findUnique({
            where: { id },
        });
    }
    // Busca por Nome no Workspace (para evitar duplicatas)
    async findByNameAndWorkspace(name, workspaceId) {
        return await prisma_1.prisma.member.findFirst({
            where: {
                workspaceId,
                name: { equals: name, mode: 'insensitive' },
            },
        });
    }
    // Atualiza
    async update(id, data) {
        return await prisma_1.prisma.member.update({
            where: { id },
            data,
        });
    }
    // Deleta
    async delete(id) {
        return await prisma_1.prisma.member.delete({
            where: { id },
        });
    }
}
exports.MembersRepository = MembersRepository;
