import { Router } from 'express';
import { GetAnnualReportController } from '../controllers/dashboard/get-annual-report.controller'; // 👈 Importe
import { GetDashboardController } from '../controllers/dashboard/get-dashboard.controller';
import { GetMonthForecastController } from '../controllers/dashboard/get-month-forecast.controller';
import { GetUpcomingBillsController } from '../controllers/dashboard/get-upcoming-bills.controller';
import { ensureAuthenticated } from '../middlewares/ensure-authenticated.middleware';
import { ensureWorkspaceMember } from '../middlewares/ensure-workspace-member.middleware';

const dashboardRoutes = Router();
const getDashboardController = new GetDashboardController();
const getAnnualReportController = new GetAnnualReportController();
const getUpcomingBillsController = new GetUpcomingBillsController();
const getMonthForecastController = new GetMonthForecastController();

dashboardRoutes.use(ensureAuthenticated);
dashboardRoutes.use(ensureWorkspaceMember);

dashboardRoutes.get('/', getDashboardController.handle);
dashboardRoutes.get('/annual', getAnnualReportController.handle);
dashboardRoutes.get('/upcoming-bills', getUpcomingBillsController.handle);
dashboardRoutes.get('/forecast', getMonthForecastController.handle);

export { dashboardRoutes };
