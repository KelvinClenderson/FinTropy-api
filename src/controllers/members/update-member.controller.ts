import { Request, Response } from 'express';
import { z } from 'zod';
import { MembersRepository } from '../../repositories/members.repository';
import { UpdateMemberService } from '../../services/members/update-member.service';

export class UpdateMemberController {
  async handle(req: Request, res: Response) {
    const paramSchema = z.object({ id: z.string().uuid() });
    const bodySchema = z.object({
      name: z.string().min(1),
      workspaceId: z.string().min(1), // Validação de segurança
    });

    try {
      const { id } = paramSchema.parse(req.params);
      const { name, workspaceId } = bodySchema.parse(req.body);

      const repo = new MembersRepository();
      const service = new UpdateMemberService(repo);

      const member = await service.execute({ id, workspaceId, name });

      return res.json(member);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
