"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticateController = void 0;
const zod_1 = require("zod");
// Pode remover o import do UsersRepository se não for usar mais nada dele aqui
// import { UsersRepository } from '../../repositories/users.repository';
const authenticate_user_service_1 = require("../../services/sessions/authenticate-user.service");
class AuthenticateController {
    async handle(req, res) {
        const authBodySchema = zod_1.z.object({
            email: zod_1.z.string().email(),
            password: zod_1.z.string(),
        });
        const { email, password } = authBodySchema.parse(req.body);
        const authenticateUserService = new authenticate_user_service_1.AuthenticateUserService();
        try {
            const { user, token, workspace } = await authenticateUserService.execute({
                email,
                password,
            });
            return res.json({ user, token, workspace });
        }
        catch (err) {
            if (err instanceof Error) {
                return res.status(401).json({ error: err.message });
            }
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}
exports.AuthenticateController = AuthenticateController;
