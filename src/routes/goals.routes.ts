import { Router } from 'express';
import { CreateGoalController } from '../controllers/goals/create-goal.controller';
import { DeleteGoalController } from '../controllers/goals/delete-goal.controller';
import { ListGoalsController } from '../controllers/goals/list-goals.controller';
import { UpdateGoalController } from '../controllers/goals/update-goal.controller';
import { ensureAuthenticated } from '../middlewares/ensure-authenticated.middleware';

const goalsRoutes = Router();

const createController = new CreateGoalController();
const listController = new ListGoalsController();
const updateController = new UpdateGoalController();
const deleteController = new DeleteGoalController();

goalsRoutes.use(ensureAuthenticated);

goalsRoutes.post('/', createController.handle);
goalsRoutes.get('/', listController.handle); // ?workspaceId=...
goalsRoutes.put('/:id', updateController.handle); // ?workspaceId=...
goalsRoutes.delete('/:id', deleteController.handle); // ?workspaceId=...

export { goalsRoutes };
