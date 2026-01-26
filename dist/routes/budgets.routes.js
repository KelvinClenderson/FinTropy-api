"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.budgetsRoutes = void 0;
const express_1 = require("express");
const create_budget_controller_1 = require("../controllers/budgets/create-budget.controller");
const get_budget_dashboard_controller_1 = require("../controllers/budgets/get-budget-dashboard.controller");
const upsert_budget_controller_1 = require("../controllers/budgets/upsert-budget.controller");
const ensure_authenticated_middleware_1 = require("../middlewares/ensure-authenticated.middleware");
const budgetsRoutes = (0, express_1.Router)();
exports.budgetsRoutes = budgetsRoutes;
const createController = new create_budget_controller_1.CreateBudgetController();
const updateController = new upsert_budget_controller_1.UpdateBudgetController();
const getDashboardController = new get_budget_dashboard_controller_1.GetBudgetDashboardController();
budgetsRoutes.use(ensure_authenticated_middleware_1.ensureAuthenticated);
// POST /budgets (Criação)
budgetsRoutes.post('/', createController.handle);
// PUT /budgets/:id (Edição - ID do orçamento na URL)
budgetsRoutes.put('/:id', updateController.handle);
// GET /budgets (Listagem)
budgetsRoutes.get('/', getDashboardController.handle);
