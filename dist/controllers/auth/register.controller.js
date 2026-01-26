"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterController = void 0;
const zod_1 = require("zod");
const users_repository_1 = require("../../repositories/users.repository");
const register_user_service_1 = require("../../services/sessions/register-user.service");
class RegisterController {
    async handle(req, res) {
        // 1. Validação dos dados de entrada
        const registerBodySchema = zod_1.z.object({
            name: zod_1.z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
            email: zod_1.z.string().email('E-mail inválido'),
            password: zod_1.z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
        });
        try {
            const { name, email, password } = registerBodySchema.parse(req.body);
            // 2. Injeção de dependências
            const usersRepository = new users_repository_1.UsersRepository();
            const registerUserService = new register_user_service_1.RegisterUserService(usersRepository);
            // 3. Execução do serviço
            const user = await registerUserService.execute({
                name,
                email,
                password,
            });
            // Retorna 201 (Created)
            return res.status(201).json(user);
        }
        catch (err) {
            if (err instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    message: 'Erro de validação',
                    issues: err.format(),
                });
            }
            if (err instanceof Error) {
                return res.status(400).json({ error: err.message });
            }
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}
exports.RegisterController = RegisterController;
