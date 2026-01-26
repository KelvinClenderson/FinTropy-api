"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCategoryController = void 0;
const zod_1 = require("zod");
const categories_repository_1 = require("../../repositories/categories.repository");
const update_category_service_1 = require("../../services/categories/update-category.service");
class UpdateCategoryController {
    async handle(req, res) {
        // Validação dos Parâmetros da Rota
        const paramSchema = zod_1.z.object({ id: zod_1.z.string().uuid() });
        // Validação da Query (Segurança)
        const querySchema = zod_1.z.object({ workspaceId: zod_1.z.string().min(1) });
        // Validação do Corpo (Body) - Tudo opcional para permitir edição parcial
        const bodySchema = zod_1.z.object({
            name: zod_1.z.string().optional(),
            icon: zod_1.z.string().optional(),
            color: zod_1.z.string().startsWith('#').length(7).optional(),
            type: zod_1.z.enum(['EXPENSE', 'DEPOSIT', 'INVESTMENT']).optional(),
        });
        try {
            const { id } = paramSchema.parse(req.params);
            const { workspaceId } = querySchema.parse(req.query);
            const data = bodySchema.parse(req.body);
            const repo = new categories_repository_1.CategoriesRepository();
            const service = new update_category_service_1.UpdateCategoryService(repo);
            const category = await service.execute({
                id,
                workspaceId,
                ...data,
            });
            return res.json(category);
        }
        catch (err) {
            if (err instanceof zod_1.z.ZodError)
                return res.status(400).json({ issues: err.format() });
            if (err.message === 'Não autorizado.')
                return res.status(403).json({ error: err.message });
            if (err.message === 'Categoria não encontrada.')
                return res.status(404).json({ error: err.message });
            return res.status(500).json({ error: err.message });
        }
    }
}
exports.UpdateCategoryController = UpdateCategoryController;
