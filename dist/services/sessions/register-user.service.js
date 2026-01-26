"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterUserService = void 0;
const bcryptjs_1 = require("bcryptjs");
const prisma_1 = require("../../lib/prisma");
class RegisterUserService {
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async execute({ name, email, password }) {
        // 1. Verificar se e-mail já existe
        const userAlreadyExists = await this.usersRepository.findByEmail(email);
        if (userAlreadyExists) {
            throw new Error('Usuário já cadastrado.');
        }
        // 2. Criptografar senha
        const passwordHash = await (0, bcryptjs_1.hash)(password, 6);
        // 3. Criar Usuário e Workspace Padrão (Transação atômica)
        // Estamos replicando a lógica do seu arquivo `_actions/bootstrap-user/index.ts`
        const user = await prisma_1.prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    name,
                    email,
                    // 👇 CORREÇÃO: Use 'passwordHash' (nome na model), não 'password_hash' (nome no banco)
                    passwordHash: passwordHash,
                },
            });
            // Categorias Padrão (Copiado da lógica do seu frontend)
            const categoriesToCreate = [
                { name: 'Moradia', type: 'EXPENSE' },
                { name: 'Transporte', type: 'EXPENSE' },
                { name: 'Alimentação', type: 'EXPENSE' },
                // ... adicione as outras do seu array original
                { name: 'Salário', type: 'DEPOSIT' },
                { name: 'Investimentos', type: 'INVESTMENT' },
            ];
            // Cria Workspace Padrão
            const workspace = await tx.workspace.create({
                data: {
                    name: 'Pessoal',
                    userId: newUser.id, // O campo legacy_owner, mas bom manter referência
                    workspaceUsers: {
                        create: {
                            userId: newUser.id,
                            role: 'ADMIN',
                        },
                    },
                    categories: {
                        create: categoriesToCreate.map((cat) => ({
                            name: cat.name,
                            // Adapte aqui para importar suas constantes de cores/ícones ou use strings fixas por enquanto
                            color: '#cccccc',
                            icon: 'Tag',
                            type: cat.type,
                        })),
                    },
                },
            });
            return newUser;
        });
        return {
            id: user.id,
            name: user.name,
            email: user.email,
        };
    }
}
exports.RegisterUserService = RegisterUserService;
