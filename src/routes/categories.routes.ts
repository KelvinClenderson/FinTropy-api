import { Router } from 'express';
import { CreateCategoryController } from '../controllers/categories/create-category.controller';
import { DeleteCategoryController } from '../controllers/categories/delete-category.controller';
import { ensureAuthenticated } from '../middlewares/ensure-authenticated.middleware';
// 👇 Novos imports
import { ListCategoriesController } from '../controllers/categories/list-categories.controller';
import { UpdateCategoryController } from '../controllers/categories/update-category.controller';

const categoriesRoutes = Router();

const createController = new CreateCategoryController();
const deleteController = new DeleteCategoryController();
// 👇 Instâncias
const listController = new ListCategoriesController();
const updateController = new UpdateCategoryController();

categoriesRoutes.use(ensureAuthenticated);

// Rotas existentes
categoriesRoutes.post('/', createController.handle);
categoriesRoutes.delete('/:id', deleteController.handle);

// 👇 Novas rotas
categoriesRoutes.get('/', listController.handle); // GET /categories?workspaceId=...
categoriesRoutes.put('/:id', updateController.handle); // PUT /categories/:id?workspaceId=...

export { categoriesRoutes };
