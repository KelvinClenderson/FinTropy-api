import { Request, Response } from 'express';
import { z } from 'zod';
import { TransactionsRepository } from '../../repositories/transactions.repository';
import { GetAnnualReportService } from '../../services/dashboard/get-annual-report.service';

export class GetAnnualReportController {
  async handle(req: Request, res: Response) {
    const querySchema = z.object({
      workspaceId: z.string().min(1, 'Workspace ID obrigatório'),
      year: z
        .string()
        .optional()
        .default(() => new Date().getFullYear().toString())
        .transform(Number),
    });

    try {
      const { workspaceId, year } = querySchema.parse(req.query);

      const repo = new TransactionsRepository();
      const service = new GetAnnualReportService(repo);

      const report = await service.execute({ workspaceId, year });

      return res.json(report);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ issues: err.format() });
      }
      return res.status(500).json({ error: err.message });
    }
  }
}
