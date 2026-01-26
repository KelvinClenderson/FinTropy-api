"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteCategoryController = void 0;
const zod_1 = require("zod");
const categories_repository_1 = require("../../repositories/categories.repository");
const delete_category_service_1 = require("../../services/categories/delete-category.service");
class DeleteCategoryController {
    async handle(req, res) {
        const paramSchema = zod_1.z.object({
            id: zod_1.z.string().uuid(), // ID da categoria a ser excluída
        });
        const querySchema = zod_1.z.object({
            workspaceId: zod_1.z.string().min(1),
            // 👇 Agora é obrigatório informar quem vai herdar as transações
            substituteCategoryId: zod_1.z.string().uuid(),
        });
        try {
            const { id } = paramSchema.parse(req.params);
            const { workspaceId, substituteCategoryId } = querySchema.parse(req.query);
            // Validação básica para evitar erros bobos
            if (id === substituteCategoryId) {
                return res
                    .status(400)
                    .json({ error: 'A categoria substituta não pode ser a mesma que será excluída.' });
            }
            const repo = new categories_repository_1.CategoriesRepository();
            const service = new delete_category_service_1.DeleteCategoryService(repo);
            await service.execute({
                id,
                workspaceId,
                substituteCategoryId,
            });
            return res.status(204).send();
        }
        catch (err) {
            if (err instanceof zod_1.z.ZodError)
                return res.status(400).json({ issues: err.format() });
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.DeleteCategoryController = DeleteCategoryController;
