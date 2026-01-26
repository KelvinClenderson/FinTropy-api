import { prisma } from '../../lib/prisma'; // Importamos o prisma para usar transaction
import { CategoriesRepository } from '../../repositories/categories.repository';

interface IRequest {
  id: string; // Categoria Antiga (Vai sumir)
  workspaceId: string;
  substituteCategoryId: string; // Categoria Nova (Herdeira)
}

export class DeleteCategoryService {
  constructor(private categoriesRepository: CategoriesRepository) {}

  async execute({ id, workspaceId, substituteCategoryId }: IRequest) {
    // 1. Buscar a Categoria a ser Deletada
    const categoryToDelete = await this.categoriesRepository.findById(id);
    if (!categoryToDelete) throw new Error('Categoria a ser excluída não encontrada.');
    if (categoryToDelete.workspaceId !== workspaceId) throw new Error('Não autorizado.');

    // 2. Buscar a Categoria Substituta
    const substituteCategory = await this.categoriesRepository.findById(substituteCategoryId);
    if (!substituteCategory) throw new Error('Categoria substituta não encontrada.');
    if (substituteCategory.workspaceId !== workspaceId)
      throw new Error('A categoria substituta deve pertencer ao mesmo workspace.');

    // 3. Executar Transação Atômica (Tudo ou Nada)
    await prisma.$transaction(async (tx) => {
      // A. Migrar Transações (Histórico e Futuro)
      await tx.transaction.updateMany({
        where: { categoryId: id },
        data: { categoryId: substituteCategoryId },
      });

      // B. Migrar Regras de Recorrência (Para que novos lançamentos já nasçam na nova categoria)
      await tx.recurringTransaction.updateMany({
        where: { categoryId: id },
        data: { categoryId: substituteCategoryId },
      });

      // C. Deletar a Categoria Original
      // Como não tem mais nada vinculado a ela (updateMany rodou antes), a deleção funcionará sem erro de Foreign Key
      await tx.category.delete({
        where: { id: id },
      });
    });
  }
}
