import { Category, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

export class CategoriesRepository {
  // 1. Criar
  async create(data: Prisma.CategoryUncheckedCreateInput): Promise<Category> {
    return await prisma.category.create({
      data,
    });
  }

  // 2. Listar por Workspace
  async findByWorkspace(workspaceId: string) {
    return await prisma.category.findMany({
      where: { workspaceId },
      orderBy: { name: 'asc' }, // Ordem alfabética
    });
  }

  // 3. Buscar por ID (para validação)
  async findById(id: string) {
    return await prisma.category.findUnique({
      where: { id },
    });
  }

  // 4. Atualizar
  async update(id: string, data: Prisma.CategoryUpdateInput) {
    return await prisma.category.update({
      where: { id },
      data,
    });
  }

  // 5. Deletar
  async delete(id: string) {
    return await prisma.category.delete({
      where: { id },
    });
  }
}
