import { Request, Response } from 'express';
import { z } from 'zod';
import { GetUpcomingBillsService } from '../../services/dashboard/get-upcoming-bills.service';

export class GetUpcomingBillsController {
  async handle(req: Request, res: Response) {
    const querySchema = z.object({
      workspaceId: z.string().min(1, 'Workspace ID é obrigatório'),
    });

    try {
      const { workspaceId } = querySchema.parse(req.query);

      const service = new GetUpcomingBillsService();
      const bills = await service.execute({ workspaceId });

      return res.json(bills);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ issues: err.format() });
      }
      return res.status(500).json({ error: err.message });
    }
  }
}
