"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompleteOnboardingService = void 0;
class CompleteOnboardingService {
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async execute({ userId }) {
        const user = await this.usersRepository.findById(userId);
        if (!user) {
            throw new Error('Usuário não encontrado.');
        }
        await this.usersRepository.completeOnboarding(userId);
    }
}
exports.CompleteOnboardingService = CompleteOnboardingService;
