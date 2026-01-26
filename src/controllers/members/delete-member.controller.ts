import { Request, Response } from 'express';
import { z } from 'zod';
import { MembersRepository } from '../../repositories/members.repository';
import { DeleteMemberService } from '../../services/members/delete-member.service';

export class DeleteMemberController {
  async handle(req: Request, res: Response) {
    const paramSchema = z.object({ id: z.string().uuid() });
    const querySchema = z.object({ workspaceId: z.string().min(1) });

    try {
      const { id } = paramSchema.parse(req.params);
      const { workspaceId } = querySchema.parse(req.query);

      const repo = new MembersRepository();
      const service = new DeleteMemberService(repo);

      await service.execute({ id, workspaceId });

      return res.status(204).send();
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
