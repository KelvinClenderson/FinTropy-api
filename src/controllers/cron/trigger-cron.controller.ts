import { Request, Response } from 'express';
import { ProcessRecurringTransactionsService } from '../../services/cron/process-recurring-transactions.service';

export class TriggerCronController {
  async handle(req: Request, res: Response) {
    try {
      // Opcional: Adicionar uma verificação de Secret Key no Header para segurança extra
      // const secret = req.headers['x-cron-secret'];
      // if (secret !== process.env.CRON_SECRET) return res.status(401).send();

      const service = new ProcessRecurringTransactionsService();
      const result = await service.execute();

      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}
