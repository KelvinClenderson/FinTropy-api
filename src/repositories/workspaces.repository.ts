import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

export class WorkspacesRepository {
  // 1. Busca Workspace com TODAS as dependências
  async findByIdWithDetails(id: string) {
    return await prisma.workspace.findUnique({
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
  async findMembership(workspaceId: string, userId: string) {
    return await prisma.workspaceUser.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });
  }

  // 3. Atualizar dados do Workspace
  async update(id: string, data: Prisma.WorkspaceUpdateInput) {
    return await prisma.workspace.update({
      where: { id },
      data,
    });
  }

  // 4. Buscar usuário por E-mail (Para saber se ele já existe no sistema)
  async findUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  // 5. Verificar se já existe um convite pendente para este e-mail neste workspace
  async findInvite(workspaceId: string, email: string) {
    return await prisma.workspaceInvite.findUnique({
      where: {
        workspaceId_email: {
          workspaceId,
          email,
        },
      },
    });
  }

  // 6. Criar o convite
  async createInvite(workspaceId: string, email: string) {
    return await prisma.workspaceInvite.create({
      data: {
        workspaceId,
        email,
        status: 'PENDING',
      },
    });
  }

  // 7. Remover um membro do workspace
  async removeMember(workspaceId: string, userId: string) {
    return await prisma.workspaceUser.delete({
      where: {
        userId_workspaceId: {
          workspaceId,
          userId,
        },
      },
    });
  }

  // 8. Buscar convite pelo ID
  async findInviteById(id: string) {
    return await prisma.workspaceInvite.findUnique({
      where: { id },
    });
  }

  // 9. Listar convites recebidos por um e-mail
  async findInvitesByUserEmail(email: string) {
    return await prisma.workspaceInvite.findMany({
      where: { email, status: 'PENDING' },
      include: {
        workspace: {
          select: { name: true, id: true },
        },
      },
    });
  }

  // 10. Aceitar convite: Cria o usuário no workspace e apaga o convite (Transação)
  async acceptInvite(inviteId: string, userId: string, workspaceId: string) {
    return await prisma.$transaction([
      // Cria o vínculo
      prisma.workspaceUser.create({
        data: {
          userId,
          workspaceId,
          role: 'MEMBER', // Entra como membro comum
        },
      }),
      // Apaga o convite pendente (já foi usado)
      prisma.workspaceInvite.delete({
        where: { id: inviteId },
      }),
    ]);
  }

  // 11. Recusar convite: Apenas apaga
  async declineInvite(inviteId: string) {
    return await prisma.workspaceInvite.delete({
      where: { id: inviteId },
    });
  }

  // 12. Buscar usuário pelo ID (Para recuperar email)
  async findUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  async delete(id: string) {
    await prisma.workspace.delete({
      where: { id },
    });
  }

  // Buscar papel do usuário no workspace (já existe findMembership, podemos reutilizar ou garantir que exista)
  async getUserRole(workspaceId: string, userId: string) {
    const member = await prisma.workspaceUser.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
    return member?.role;
  }
}
