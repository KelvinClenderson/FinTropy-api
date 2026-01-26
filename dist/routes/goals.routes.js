"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.goalsRoutes = void 0;
const express_1 = require("express");
const create_goal_controller_1 = require("../controllers/goals/create-goal.controller");
const delete_goal_controller_1 = require("../controllers/goals/delete-goal.controller");
const list_goals_controller_1 = require("../controllers/goals/list-goals.controller");
const update_goal_controller_1 = require("../controllers/goals/update-goal.controller");
const ensure_authenticated_middleware_1 = require("../middlewares/ensure-authenticated.middleware");
const goalsRoutes = (0, express_1.Router)();
exports.goalsRoutes = goalsRoutes;
const createController = new create_goal_controller_1.CreateGoalController();
const listController = new list_goals_controller_1.ListGoalsController();
const updateController = new update_goal_controller_1.UpdateGoalController();
const deleteController = new delete_goal_controller_1.DeleteGoalController();
goalsRoutes.use(ensure_authenticated_middleware_1.ensureAuthenticated);
goalsRoutes.post('/', createController.handle);
goalsRoutes.get('/', listController.handle); // ?workspaceId=...
goalsRoutes.put('/:id', updateController.handle); // ?workspaceId=...
goalsRoutes.delete('/:id', deleteController.handle); // ?workspaceId=...
