"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRoutes = void 0;
const express_1 = require("express");
const complete_onboarding_controller_1 = require("../controllers/users/complete-onboarding.controller");
const update_user_settings_controller_1 = require("../controllers/users/update-user-settings.controller");
const ensure_authenticated_middleware_1 = require("../middlewares/ensure-authenticated.middleware");
const usersRoutes = (0, express_1.Router)();
exports.usersRoutes = usersRoutes;
const updateSettingsController = new update_user_settings_controller_1.UpdateUserSettingsController();
const completeOnboardingController = new complete_onboarding_controller_1.CompleteOnboardingController();
usersRoutes.use(ensure_authenticated_middleware_1.ensureAuthenticated);
// Atualizar Tema e Cor
// PUT /users/me/settings
usersRoutes.put('/me/settings', updateSettingsController.handle);
// Concluir Onboarding
// PATCH /users/me/onboarding
usersRoutes.patch('/me/onboarding', completeOnboardingController.handle);
