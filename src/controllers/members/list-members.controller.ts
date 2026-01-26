import { Request, Response } from 'express';
import { z } from 'zod';
import { MembersRepository } from '../../repositories/members.repository';
import { ListMembersService } from '../../services/members/list-members.service';

export class ListMembersController {
  async handle(req: Request, res: Response) {
    const querySchema = z.object({
      workspaceId: z.string().min(1),
    });

    try {
      const { workspaceId } = querySchema.parse(req.query);

      const repo = new MembersRepository();
      const service = new ListMembersService(repo);

      const members = await service.execute({ workspaceId });

      return res.json(members);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
