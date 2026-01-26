import { Request, Response } from 'express';
import { z } from 'zod';
import { CategoriesRepository } from '../../repositories/categories.repository';
import { ListCategoriesService } from '../../services/categories/list-categories.service';

export class ListCategoriesController {
  async handle(req: Request, res: Response) {
    const querySchema = z.object({
      workspaceId: z.string().min(1, 'Workspace ID is required'),
    });

    try {
      // Pega o workspaceId da Query String (ex: ?workspaceId=123)
      const { workspaceId } = querySchema.parse(req.query);

      const repo = new CategoriesRepository();
      const service = new ListCategoriesService(repo);

      const categories = await service.execute({ workspaceId });

      return res.json(categories);
    } catch (err: any) {
      return res.status(400).json({ error: 'Workspace ID inválido.' });
    }
  }
}
