"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCategoryController = void 0;
const zod_1 = require("zod");
const categories_repository_1 = require("../../repositories/categories.repository");
const create_category_service_1 = require("../../services/categories/create-category.service");
class CreateCategoryController {
    async handle(req, res) {
        const bodySchema = zod_1.z.object({
            name: zod_1.z.string().min(1),
            icon: zod_1.z.string(), // O front manda o nome do ícone (ex: "Home", "Car")
            color: zod_1.z.string().startsWith('#').length(7),
            type: zod_1.z.enum(['EXPENSE', 'DEPOSIT', 'INVESTMENT']),
            workspaceId: zod_1.z.string().cuid().or(zod_1.z.string().uuid()),
        });
        try {
            const data = bodySchema.parse(req.body);
            const repo = new categories_repository_1.CategoriesRepository();
            const service = new create_category_service_1.CreateCategoryService(repo);
            const category = await service.execute(data);
            return res.status(201).json(category);
        }
        catch (err) {
            if (err instanceof zod_1.z.ZodError)
                return res.status(400).json({ issues: err.format() });
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.CreateCategoryController = CreateCategoryController;
