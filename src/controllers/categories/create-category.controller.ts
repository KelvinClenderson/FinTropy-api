import { Request, Response } from 'express';
import { z } from 'zod';
import { CategoriesRepository } from '../../repositories/categories.repository';
import { CreateCategoryService } from '../../services/categories/create-category.service';

export class CreateCategoryController {
  async handle(req: Request, res: Response) {
    const bodySchema = z.object({
      name: z.string().min(1),
      icon: z.string(), // O front manda o nome do ícone (ex: "Home", "Car")
      color: z.string().startsWith('#').length(7),
      type: z.enum(['EXPENSE', 'DEPOSIT', 'INVESTMENT']),
      workspaceId: z.string().cuid().or(z.string().uuid()),
    });

    try {
      const data = bodySchema.parse(req.body);
      const repo = new CategoriesRepository();
      const service = new CreateCategoryService(repo);

      const category = await service.execute(data);

      return res.status(201).json(category);
    } catch (err: any) {
      if (err instanceof z.ZodError) return res.status(400).json({ issues: err.format() });
      return res.status(400).json({ error: err.message });
    }
  }
}
