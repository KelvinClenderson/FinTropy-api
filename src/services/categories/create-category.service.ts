import { TransactionType } from '@prisma/client';
import { CategoriesRepository } from '../../repositories/categories.repository';

interface IRequest {
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  workspaceId: string;
}

export class CreateCategoryService {
  constructor(private categoriesRepository: CategoriesRepository) {}

  async execute({ name, icon, color, type, workspaceId }: IRequest) {
    // Aqui poderíamos validar se já existe categoria com mesmo nome no workspace, se quiser.

    const category = await this.categoriesRepository.create({
      name,
      icon,
      color,
      type,
      workspaceId,
    });

    return category;
  }
}
