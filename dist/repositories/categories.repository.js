"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesRepository = void 0;
const prisma_1 = require("../lib/prisma");
class CategoriesRepository {
    // 1. Criar
    async create(data) {
        return await prisma_1.prisma.category.create({
            data,
        });
    }
    // 2. Listar por Workspace
    async findByWorkspace(workspaceId) {
        return await prisma_1.prisma.category.findMany({
            where: { workspaceId },
            orderBy: { name: 'asc' }, // Ordem alfabética
        });
    }
    // 3. Buscar por ID (para validação)
    async findById(id) {
        return await prisma_1.prisma.category.findUnique({
            where: { id },
        });
    }
    // 4. Atualizar
    async update(id, data) {
        return await prisma_1.prisma.category.update({
            where: { id },
            data,
        });
    }
    // 5. Deletar
    async delete(id) {
        return await prisma_1.prisma.category.delete({
            where: { id },
        });
    }
}
exports.CategoriesRepository = CategoriesRepository;
