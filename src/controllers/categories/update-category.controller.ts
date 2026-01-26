import { Request, Response } from 'express';
import { z } from 'zod';
import { CategoriesRepository } from '../../repositories/categories.repository';
import { UpdateCategoryService } from '../../services/categories/update-category.service';

export class UpdateCategoryController {
  async handle(req: Request, res: Response) {
    // Validação dos Parâmetros da Rota
    const paramSchema = z.object({ id: z.string().uuid() });

    // Validação da Query (Segurança)
    const querySchema = z.object({ workspaceId: z.string().min(1) });

    // Validação do Corpo (Body) - Tudo opcional para permitir edição parcial
    const bodySchema = z.object({
      name: z.string().optional(),
      icon: z.string().optional(),
      color: z.string().startsWith('#').length(7).optional(),
      type: z.enum(['EXPENSE', 'DEPOSIT', 'INVESTMENT']).optional(),
    });

    try {
      const { id } = paramSchema.parse(req.params);
      const { workspaceId } = querySchema.parse(req.query);
      const data = bodySchema.parse(req.body);

      const repo = new CategoriesRepository();
      const service = new UpdateCategoryService(repo);

      const category = await service.execute({
        id,
        workspaceId,
        ...data,
      });

      return res.json(category);
    } catch (err: any) {
      if (err instanceof z.ZodError) return res.status(400).json({ issues: err.format() });
      if (err.message === 'Não autorizado.') return res.status(403).json({ error: err.message });
      if (err.message === 'Categoria não encontrada.')
        return res.status(404).json({ error: err.message });

      return res.status(500).json({ error: err.message });
    }
  }
}
