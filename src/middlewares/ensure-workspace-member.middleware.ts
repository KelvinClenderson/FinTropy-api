import { PrismaClient } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';

const prisma = new PrismaClient();

export async function ensureWorkspaceMember(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    // 👇 CORREÇÃO BLINDADA: Usamos '?.' para evitar erro se params/query/body forem undefined
    const workspaceId = req.params?.workspaceId || req.query?.workspaceId || req.body?.workspaceId;

    // Se não encontrou o ID, retorna erro 400 (Bad Request) mas NÃO derruba o servidor
    if (!workspaceId) {
      // Opcional: Logar para debug sem crashar
      console.warn(`[Middleware] Tentativa de acesso sem workspaceId. User: ${userId}`);
      return res.status(400).json({ error: 'Workspace ID é obrigatório.' });
    }

    const member = await prisma.workspaceUser.findFirst({
      where: {
        workspaceId: String(workspaceId),
        userId: userId,
      },
    });

    if (!member) {
      return res.status(403).json({ error: 'Acesso negado a este workspace.' });
    }

    return next();
  } catch (err) {
    console.error('Erro CRÍTICO no middleware de workspace:', err);
    // Retorna erro 500 em vez de deixar o erro subir e matar o processo
    return res.status(500).json({ error: 'Erro interno ao validar permissão.' });
  }
}
