import { Request, Response } from 'express';
import { z } from 'zod';
import { CategoriesRepository } from '../../repositories/categories.repository';
import { DeleteCategoryService } from '../../services/categories/delete-category.service';

export class DeleteCategoryController {
  async handle(req: Request, res: Response) {
    const paramSchema = z.object({
      id: z.string().uuid(), // ID da categoria a ser excluída
    });

    const querySchema = z.object({
      workspaceId: z.string().min(1),
      // 👇 Agora é obrigatório informar quem vai herdar as transações
      substituteCategoryId: z.string().uuid(),
    });

    try {
      const { id } = paramSchema.parse(req.params);
      const { workspaceId, substituteCategoryId } = querySchema.parse(req.query);

      // Validação básica para evitar erros bobos
      if (id === substituteCategoryId) {
        return res
          .status(400)
          .json({ error: 'A categoria substituta não pode ser a mesma que será excluída.' });
      }

      const repo = new CategoriesRepository();
      const service = new DeleteCategoryService(repo);

      await service.execute({
        id,
        workspaceId,
        substituteCategoryId,
      });

      return res.status(204).send();
    } catch (err: any) {
      if (err instanceof z.ZodError) return res.status(400).json({ issues: err.format() });
      return res.status(400).json({ error: err.message });
    }
  }
}
