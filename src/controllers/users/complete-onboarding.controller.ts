import { Request, Response } from 'express';
import { UsersRepository } from '../../repositories/users.repository';
import { CompleteOnboardingService } from '../../services/users/complete-onboarding.service';

export class CompleteOnboardingController {
  async handle(req: Request, res: Response) {
    try {
      const userId = req.user.id;

      const repo = new UsersRepository();
      const service = new CompleteOnboardingService(repo);

      await service.execute({ userId });

      return res.status(204).send();
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
