"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoriesRoutes = void 0;
const express_1 = require("express");
const create_category_controller_1 = require("../controllers/categories/create-category.controller");
const delete_category_controller_1 = require("../controllers/categories/delete-category.controller");
const ensure_authenticated_middleware_1 = require("../middlewares/ensure-authenticated.middleware");
// 👇 Novos imports
const list_categories_controller_1 = require("../controllers/categories/list-categories.controller");
const update_category_controller_1 = require("../controllers/categories/update-category.controller");
const categoriesRoutes = (0, express_1.Router)();
exports.categoriesRoutes = categoriesRoutes;
const createController = new create_category_controller_1.CreateCategoryController();
const deleteController = new delete_category_controller_1.DeleteCategoryController();
// 👇 Instâncias
const listController = new list_categories_controller_1.ListCategoriesController();
const updateController = new update_category_controller_1.UpdateCategoryController();
categoriesRoutes.use(ensure_authenticated_middleware_1.ensureAuthenticated);
// Rotas existentes
categoriesRoutes.post('/', createController.handle);
categoriesRoutes.delete('/:id', deleteController.handle);
// 👇 Novas rotas
categoriesRoutes.get('/', listController.handle); // GET /categories?workspaceId=...
categoriesRoutes.put('/:id', updateController.handle); // PUT /categories/:id?workspaceId=...
