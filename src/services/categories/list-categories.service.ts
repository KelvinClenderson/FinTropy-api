import { CategoriesRepository } from '../../repositories/categories.repository';

interface IRequest {
  workspaceId: string;
}

export class ListCategoriesService {
  constructor(private categoriesRepository: CategoriesRepository) {}

  async execute({ workspaceId }: IRequest) {
    // Busca no repositório filtrando pelo Workspace
    const categories = await this.categoriesRepository.findByWorkspace(workspaceId);
    return categories;
  }
}
