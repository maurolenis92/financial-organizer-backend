import { NextFunction, Request, Response } from 'express';
import { CategoryService } from '../services/category.service';
import { ConflictError } from '../errors/app-error';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const categoryService = new CategoryService();

export class CategoriesController {
  // POST /api/categories
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const { name, color, icon } = req.body;
    const userId = req.user!.id;

    if (!name || !userId) {
      res.status(400).json({ error: 'Nombre y userId son requeridos' });
      return;
    }

    const existingCategories = await categoryService.getCategoriesByUser(userId);
    const nameExists = existingCategories.some((category) => category.name === name);
    if (nameExists) {
      throw new ConflictError('Ya existe una categoría con ese nombre para este usuario');
    }

    const category = await categoryService.createCategory({ name, userId, color, icon });

    res.status(201).json(category);
  }

  // GET /api/categories/user/:userId
  async getByUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const userId = req.user!.id;

    const categories = await categoryService.getCategoriesByUser(userId);
    res.json(categories);
  }

  // DELETE /api/categories/:id/user/:userId
  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    const userId = req.user!.id;

    const category = await categoryService.deleteCategory(id, userId);
    res.json(category);
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    const { name, color, icon } = req.body;

    const category = await categoryService.updateCategory(id, { name, color, icon });
    res.json(category);
  }
}
