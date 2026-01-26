import { PrismaClient } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';

const prisma = new PrismaClient();

export async function ensureWorkspaceMember(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    // 👇 CORREÇÃO: Procura o workspaceId em Params, Query ou Body (nesta ordem)
    const workspaceId = req.params.workspaceId || req.query.workspaceId || req.body.workspaceId;

    // Se não encontrou o ID em lugar nenhum, bloqueia mas NÃO CRASHA
    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID é obrigatório para esta rota.' });
    }

    // Verifica no banco se o usuário pertence a este workspace
    const member = await prisma.workspaceUser.findFirst({
      where: {
        workspaceId: String(workspaceId), // Garante que seja string
        userId: userId,
      },
    });

    if (!member) {
      return res.status(403).json({ error: 'Acesso negado a este workspace.' });
    }

    return next();
  } catch (err) {
    console.error('Erro no middleware de workspace:', err);
    return res.status(500).json({ error: 'Erro interno ao validar workspace.' });
  }
}
