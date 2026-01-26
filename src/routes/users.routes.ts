import { Router } from 'express';
import { CompleteOnboardingController } from '../controllers/users/complete-onboarding.controller';
import { UpdateUserSettingsController } from '../controllers/users/update-user-settings.controller';
import { ensureAuthenticated } from '../middlewares/ensure-authenticated.middleware';

const usersRoutes = Router();

const updateSettingsController = new UpdateUserSettingsController();
const completeOnboardingController = new CompleteOnboardingController();

usersRoutes.use(ensureAuthenticated);

// Atualizar Tema e Cor
// PUT /users/me/settings
usersRoutes.put('/me/settings', updateSettingsController.handle);

// Concluir Onboarding
// PATCH /users/me/onboarding
usersRoutes.patch('/me/onboarding', completeOnboardingController.handle);

export { usersRoutes };
