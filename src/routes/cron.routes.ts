import { Router } from 'express';
import { TriggerCronController } from '../controllers/cron/trigger-cron.controller';

const cronRoutes = Router();
const triggerController = new TriggerCronController();

// POST /cron/process-recurring
// Recomendado proteger esta rota ou deixar pública apenas se usar um Header Secret
cronRoutes.post('/process-recurring', triggerController.handle);

export { cronRoutes };
