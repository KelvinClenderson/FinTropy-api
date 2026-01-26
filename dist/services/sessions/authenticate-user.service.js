"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticateUserService = void 0;
const bcryptjs_1 = require("bcryptjs");
const jsonwebtoken_1 = require("jsonwebtoken");
const prisma_1 = require("../../lib/prisma"); // Verifique se o caminho do seu prisma client está correto aqui
class AuthenticateUserService {
    async execute({ email, password }) {
        // 1. Busca o usuário e JÁ TRAZ os workspaces vinculados
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
            include: {
                workspaceUsers: {
                    include: {
                        workspace: true, // Traz os dados completos do workspace
                    },
                },
            },
        });
        // 2. Se não achar o usuário
        if (!user) {
            throw new Error('Email or password incorrect.');
        }
        // 3. Verifica se a senha bate com o Hash do banco
        const passwordMatch = await (0, bcryptjs_1.compare)(password, user.passwordHash);
        if (!passwordMatch) {
            throw new Error('Email or password incorrect.');
        }
        // 4. Configuração do Token JWT
        // DICA: O ideal é mover esse "md5_secret_aleatorio" para uma variável de ambiente: process.env.JWT_SECRET
        const secret = process.env.JWT_SECRET || 'default_super_secret_key_fin_alchemy';
        const token = (0, jsonwebtoken_1.sign)({}, secret, {
            subject: user.id, // O ID do usuário vira o "assunto" do token
            expiresIn: '1d', // Expira em 1 dia
        });
        // 5. Define o Workspace Padrão
        // Pega o primeiro workspace da lista (regra simples para MVP)
        const defaultWorkspace = user.workspaceUsers[0]?.workspace || null;
        // 6. Retorna tudo que o Frontend precisa
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
            },
            workspace: defaultWorkspace
                ? {
                    id: defaultWorkspace.id,
                    name: defaultWorkspace.name,
                }
                : null,
            token,
        };
    }
}
exports.AuthenticateUserService = AuthenticateUserService;
