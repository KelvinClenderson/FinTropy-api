"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompleteOnboardingController = void 0;
const users_repository_1 = require("../../repositories/users.repository");
const complete_onboarding_service_1 = require("../../services/users/complete-onboarding.service");
class CompleteOnboardingController {
    async handle(req, res) {
        try {
            const userId = req.user.id;
            const repo = new users_repository_1.UsersRepository();
            const service = new complete_onboarding_service_1.CompleteOnboardingService(repo);
            await service.execute({ userId });
            return res.status(204).send();
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.CompleteOnboardingController = CompleteOnboardingController;
