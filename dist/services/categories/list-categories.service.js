"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListCategoriesService = void 0;
class ListCategoriesService {
    constructor(categoriesRepository) {
        this.categoriesRepository = categoriesRepository;
    }
    async execute({ workspaceId }) {
        // Busca no repositório filtrando pelo Workspace
        const categories = await this.categoriesRepository.findByWorkspace(workspaceId);
        return categories;
    }
}
exports.ListCategoriesService = ListCategoriesService;
