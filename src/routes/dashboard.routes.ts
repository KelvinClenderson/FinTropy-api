import { Router } from 'express';
import { GetDashboardController } from '../controllers/dashboard/get-dashboard.controller';
import { ensureAuthenticated } from '../middlewares/ensure-authenticated.middleware';

const dashboardRoutes = Router();
const getDashboardController = new GetDashboardController();

dashboardRoutes.use(ensureAuthenticated);

dashboardRoutes.get('/', getDashboardController.handle);

export { dashboardRoutes };
