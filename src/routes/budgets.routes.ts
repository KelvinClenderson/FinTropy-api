import { Router } from 'express';
import { CreateBudgetController } from '../controllers/budgets/create-budget.controller';
import { GetBudgetDashboardController } from '../controllers/budgets/get-budget-dashboard.controller';
import { UpdateBudgetController } from '../controllers/budgets/upsert-budget.controller';
import { ensureAuthenticated } from '../middlewares/ensure-authenticated.middleware';

const budgetsRoutes = Router();

const createController = new CreateBudgetController();
const updateController = new UpdateBudgetController();
const getDashboardController = new GetBudgetDashboardController();

budgetsRoutes.use(ensureAuthenticated);

// POST /budgets (Criação)
budgetsRoutes.post('/', createController.handle);

// PUT /budgets/:id (Edição - ID do orçamento na URL)
budgetsRoutes.put('/:id', updateController.handle);

// GET /budgets (Listagem)
budgetsRoutes.get('/', getDashboardController.handle);

export { budgetsRoutes };
