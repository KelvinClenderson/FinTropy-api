import { TransactionType } from '@prisma/client';
import { CategoriesRepository } from '../../repositories/categories.repository';

interface IRequest {
  id: string;
  workspaceId: string;
  name?: string;
  icon?: string;
  color?: string;
  type?: TransactionType;
}

export class UpdateCategoryService {
  constructor(private categoriesRepository: CategoriesRepository) {}

  async execute({ id, workspaceId, ...data }: IRequest) {
    // 1. Verifica se a categoria existe
    const category = await this.categoriesRepository.findById(id);

    if (!category) {
      throw new Error('Categoria não encontrada.');
    }

    // 2. Segurança: Garante que pertence ao workspace do usuário
    if (category.workspaceId !== workspaceId) {
      throw new Error('Não autorizado.');
    }

    // 3. Atualiza apenas os campos enviados
    const updatedCategory = await this.categoriesRepository.update(id, {
      ...data,
    });

    return updatedCategory;
  }
}
