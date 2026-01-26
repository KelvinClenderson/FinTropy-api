"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListCategoriesController = void 0;
const zod_1 = require("zod");
const categories_repository_1 = require("../../repositories/categories.repository");
const list_categories_service_1 = require("../../services/categories/list-categories.service");
class ListCategoriesController {
    async handle(req, res) {
        const querySchema = zod_1.z.object({
            workspaceId: zod_1.z.string().min(1, 'Workspace ID is required'),
        });
        try {
            // Pega o workspaceId da Query String (ex: ?workspaceId=123)
            const { workspaceId } = querySchema.parse(req.query);
            const repo = new categories_repository_1.CategoriesRepository();
            const service = new list_categories_service_1.ListCategoriesService(repo);
            const categories = await service.execute({ workspaceId });
            return res.json(categories);
        }
        catch (err) {
            return res.status(400).json({ error: 'Workspace ID inválido.' });
        }
    }
}
exports.ListCategoriesController = ListCategoriesController;
