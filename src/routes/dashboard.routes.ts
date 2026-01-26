import { Router } from 'express';
import { GetAnnualReportController } from '../controllers/dashboard/get-annual-report.controller'; // 👈 Importe
import { GetDashboardController } from '../controllers/dashboard/get-dashboard.controller';
import { GetUpcomingBillsController } from '../controllers/dashboard/get-upcoming-bills.controller';
import { ensureAuthenticated } from '../middlewares/ensure-authenticated.middleware';

const dashboardRoutes = Router();
const getDashboardController = new GetDashboardController();
const getAnnualReportController = new GetAnnualReportController();
const getUpcomingBillsController = new GetUpcomingBillsController();

dashboardRoutes.use(ensureAuthenticated);

dashboardRoutes.get('/', getDashboardController.handle);
dashboardRoutes.get('/annual', getAnnualReportController.handle);
dashboardRoutes.get('/upcoming-bills', getUpcomingBillsController.handle);

export { dashboardRoutes };
