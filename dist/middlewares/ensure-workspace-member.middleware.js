"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureWorkspaceMember = ensureWorkspaceMember;
const prisma_1 = require("../lib/prisma");
async function ensureWorkspaceMember(req, res, next) {
    const userId = req.user.id; // O usuário já foi autenticado pelo ensureAuthenticated
    // Busca o workspaceId em qualquer lugar possível
    const workspaceId = req.body.workspaceId || req.query.workspaceId || req.params.workspaceId || req.params.id;
    // Se a rota não exige workspaceId específico (ex: criar workspace), passa
    if (!workspaceId) {
        return next();
    }
    // Verifica no banco se existe o vínculo
    const membership = await prisma_1.prisma.workspaceUser.findUnique({
        where: {
            userId_workspaceId: {
                userId,
                workspaceId: String(workspaceId),
            },
        },
    });
    if (!membership) {
        // Retorna 403 Forbidden (Proibido) em vez de 400 ou 404 para não vazar info
        return res.status(403).json({ error: 'Acesso negado a este workspace.' });
    }
    // Se encontrou, anexa a role no request para uso futuro (opcional) e prossegue
    // @ts-ignore
    req.userRole = membership.role;
    return next();
}
