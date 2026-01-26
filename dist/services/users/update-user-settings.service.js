"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserSettingsService = void 0;
class UpdateUserSettingsService {
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async execute({ userId, themeMode, primaryColor }) {
        // Verifica se o usuário existe
        const user = await this.usersRepository.findById(userId);
        if (!user) {
            throw new Error('Usuário não encontrado.');
        }
        // Atualiza
        const updatedUser = await this.usersRepository.updateSettings(userId, themeMode, primaryColor);
        return updatedUser;
    }
}
exports.UpdateUserSettingsService = UpdateUserSettingsService;
