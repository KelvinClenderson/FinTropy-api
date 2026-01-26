import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

export class MembersRepository {
  // Cria um novo responsável (sem login)
  async create(data: Prisma.MemberUncheckedCreateInput) {
    return await prisma.member.create({
      data,
    });
  }

  // Lista os responsáveis de um workspace
  async findByWorkspace(workspaceId: string) {
    return await prisma.member.findMany({
      where: { workspaceId },
      orderBy: { name: 'asc' },
    });
  }

  // Busca por ID
  async findById(id: string) {
    return await prisma.member.findUnique({
      where: { id },
    });
  }

  // Busca por Nome no Workspace (para evitar duplicatas)
  async findByNameAndWorkspace(name: string, workspaceId: string) {
    return await prisma.member.findFirst({
      where: {
        workspaceId,
        name: { equals: name, mode: 'insensitive' },
      },
    });
  }

  // Atualiza
  async update(id: string, data: Prisma.MemberUpdateInput) {
    return await prisma.member.update({
      where: { id },
      data,
    });
  }

  // Deleta
  async delete(id: string) {
    return await prisma.member.delete({
      where: { id },
    });
  }
}
