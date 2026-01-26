import { Request, Response } from 'express';
import { z } from 'zod';
import { WorkspacesRepository } from '../../repositories/workspaces.repository';
import { InviteMemberService } from '../../services/workspaces/invite-member.service';

export class InviteMemberController {
  async handle(req: Request, res: Response) {
    const paramSchema = z.object({ id: z.string().cuid().or(z.string().uuid()) }); // Workspace ID
    const bodySchema = z.object({
      email: z.string().email(),
    });

    try {
      const { id } = paramSchema.parse(req.params);
      const { email } = bodySchema.parse(req.body);
      const adminUserId = req.user.id;

      const repo = new WorkspacesRepository();
      const service = new InviteMemberService(repo);

      const invite = await service.execute({
        workspaceId: id,
        adminUserId,
        emailToInvite: email,
      });

      return res.status(201).json(invite);
    } catch (err: any) {
      if (err.message.includes('Apenas administradores'))
        return res.status(403).json({ error: err.message });
      return res.status(400).json({ error: err.message });
    }
  }
}
