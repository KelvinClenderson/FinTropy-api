"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCategoryService = void 0;
class CreateCategoryService {
    constructor(categoriesRepository) {
        this.categoriesRepository = categoriesRepository;
    }
    async execute({ name, icon, color, type, workspaceId }) {
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
exports.CreateCategoryService = CreateCategoryService;
