"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspacesRepository = void 0;
const prisma_1 = require("../lib/prisma");
class WorkspacesRepository {
    // 1. Busca Workspace com TODAS as dependências
    async findByIdWithDetails(id) {
        return await prisma_1.prisma.workspace.findUnique({
            where: { id },
            include: {
                // Usuários com acesso (Login)
                workspaceUsers: {
                    select: {
                        role: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatarUrl: true,
                                primaryColor: true,
                            },
                        },
                    },
                },
                // Convites pendentes
                invites: true,
                // Etiquetas de transação (Antigos "Membros")
                membersList: true,
            },
        });
    }
    // 2. Verifica se o usuário logado tem acesso e qual o cargo (Role)
    async findMembership(workspaceId, userId) {
        return await prisma_1.prisma.workspaceUser.findUnique({
            where: {
                userId_workspaceId: {
                    userId,
                    workspaceId,
                },
            },
        });
    }
    // 3. Atualizar dados do Workspace
    async update(id, data) {
        return await prisma_1.prisma.workspace.update({
            where: { id },
            data,
        });
    }
    // 4. Buscar usuário por E-mail (Para saber se ele já existe no sistema)
    async findUserByEmail(email) {
        return await prisma_1.prisma.user.findUnique({
            where: { email },
        });
    }
    // 5. Verificar se já existe um convite pendente para este e-mail neste workspace
    async findInvite(workspaceId, email) {
        return await prisma_1.prisma.workspaceInvite.findUnique({
            where: {
                workspaceId_email: {
                    workspaceId,
                    email,
                },
            },
        });
    }
    // 6. Criar o convite
    async createInvite(workspaceId, email) {
        return await prisma_1.prisma.workspaceInvite.create({
            data: {
                workspaceId,
                email,
                status: 'PENDING',
            },
        });
    }
    // 7. Remover um membro do workspace
    async removeMember(workspaceId, userId) {
        return await prisma_1.prisma.workspaceUser.delete({
            where: {
                userId_workspaceId: {
                    workspaceId,
                    userId,
                },
            },
        });
    }
    // 8. Buscar convite pelo ID
    async findInviteById(id) {
        return await prisma_1.prisma.workspaceInvite.findUnique({
            where: { id },
        });
    }
    // 9. Listar convites recebidos por um e-mail
    async findInvitesByUserEmail(email) {
        return await prisma_1.prisma.workspaceInvite.findMany({
            where: { email, status: 'PENDING' },
            include: {
                workspace: {
                    select: { name: true, id: true },
                },
            },
        });
    }
    // 10. Aceitar convite: Cria o usuário no workspace e apaga o convite (Transação)
    async acceptInvite(inviteId, userId, workspaceId) {
        return await prisma_1.prisma.$transaction([
            // Cria o vínculo
            prisma_1.prisma.workspaceUser.create({
                data: {
                    userId,
                    workspaceId,
                    role: 'MEMBER', // Entra como membro comum
                },
            }),
            // Apaga o convite pendente (já foi usado)
            prisma_1.prisma.workspaceInvite.delete({
                where: { id: inviteId },
            }),
        ]);
    }
    // 11. Recusar convite: Apenas apaga
    async declineInvite(inviteId) {
        return await prisma_1.prisma.workspaceInvite.delete({
            where: { id: inviteId },
        });
    }
    // 12. Buscar usuário pelo ID (Para recuperar email)
    async findUserById(id) {
        return await prisma_1.prisma.user.findUnique({
            where: { id },
        });
    }
    async delete(id) {
        await prisma_1.prisma.workspace.delete({
            where: { id },
        });
    }
    // Buscar papel do usuário no workspace (já existe findMembership, podemos reutilizar ou garantir que exista)
    async getUserRole(workspaceId, userId) {
        const member = await prisma_1.prisma.workspaceUser.findUnique({
            where: { userId_workspaceId: { userId, workspaceId } },
        });
        return member?.role;
    }
}
exports.WorkspacesRepository = WorkspacesRepository;
