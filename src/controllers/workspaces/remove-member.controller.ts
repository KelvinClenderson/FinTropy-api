import { Request, Response } from 'express';
import { z } from 'zod';
import { WorkspacesRepository } from '../../repositories/workspaces.repository';
import { RemoveMemberService } from '../../services/workspaces/remove-member.service';

export class RemoveMemberController {
  async handle(req: Request, res: Response) {
    const paramSchema = z.object({
      id: z.string().cuid().or(z.string().uuid()), // Workspace ID
      memberId: z.string().cuid().or(z.string().uuid()), // ID do Usuário a ser removido
    });

    try {
      const { id, memberId } = paramSchema.parse(req.params);
      const adminUserId = req.user.id;

      const repo = new WorkspacesRepository();
      const service = new RemoveMemberService(repo);

      await service.execute({
        workspaceId: id,
        adminUserId,
        memberIdToRemove: memberId,
      });

      return res.status(204).send();
    } catch (err: any) {
      if (err.message.includes('Apenas administradores'))
        return res.status(403).json({ error: err.message });
      return res.status(400).json({ error: err.message });
    }
  }
}
