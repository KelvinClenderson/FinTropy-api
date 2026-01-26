import { Request, Response } from 'express';
import { z } from 'zod';
import { MembersRepository } from '../../repositories/members.repository';
import { CreateMemberService } from '../../services/members/create-member.service';

export class CreateMemberController {
  async handle(req: Request, res: Response) {
    const bodySchema = z.object({
      name: z.string().min(1),
      workspaceId: z.string().min(1),
    });

    try {
      const { name, workspaceId } = bodySchema.parse(req.body);

      const repo = new MembersRepository();
      const service = new CreateMemberService(repo);

      const member = await service.execute({ name, workspaceId });

      return res.status(201).json(member);
    } catch (err: any) {
      if (err instanceof z.ZodError) return res.status(400).json({ issues: err.format() });
      return res.status(400).json({ error: err.message });
    }
  }
}
