"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCategoryService = void 0;
class UpdateCategoryService {
    constructor(categoriesRepository) {
        this.categoriesRepository = categoriesRepository;
    }
    async execute({ id, workspaceId, ...data }) {
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
exports.UpdateCategoryService = UpdateCategoryService;
