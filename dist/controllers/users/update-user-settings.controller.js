"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserSettingsController = void 0;
const zod_1 = require("zod");
const users_repository_1 = require("../../repositories/users.repository");
const update_user_settings_service_1 = require("../../services/users/update-user-settings.service");
class UpdateUserSettingsController {
    async handle(req, res) {
        const updateSettingsSchema = zod_1.z.object({
            themeMode: zod_1.z.enum(['LIGHT', 'DARK']),
            primaryColor: zod_1.z
                .string()
                .startsWith('#', 'A cor deve ser um Hexadecimal (ex: #000000)')
                .length(7),
        });
        try {
            const userId = req.user.id; // Pega do token JWT
            const { themeMode, primaryColor } = updateSettingsSchema.parse(req.body);
            const usersRepository = new users_repository_1.UsersRepository();
            const updateUserSettingsService = new update_user_settings_service_1.UpdateUserSettingsService(usersRepository);
            const user = await updateUserSettingsService.execute({
                userId,
                themeMode: themeMode,
                primaryColor,
            });
            return res.json(user);
        }
        catch (err) {
            if (err instanceof zod_1.z.ZodError) {
                return res.status(400).json({ message: 'Erro de validação', issues: err.format() });
            }
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.UpdateUserSettingsController = UpdateUserSettingsController;
