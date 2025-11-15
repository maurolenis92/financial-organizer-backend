import { NextFunction, Request, Response } from 'express'
import { CategoryService } from '../services/category.service';
import { ConflictError } from '../errors/app-error';

const categoryService = new CategoryService();

export class CategoriesController {

  // POST /api/categories
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
      const { name, userId, color, icon } = req.body;

      if (!name || !userId) {
        res.status(400).json({ error: 'Nombre y userId son requeridos' });
        return;
      }

      const existingCategories = await categoryService.getCategoriesByUser(userId);
      const nameExists = existingCategories.some(category => category.name === name);
      if (nameExists) {
        throw new ConflictError('Ya existe una categoría con ese nombre para este usuario');
      }

      const category = await categoryService.createCategory({ name, userId, color, icon });

      res.status(201).json(category);
  }

  // GET /api/categories/user/:userId
  async getByUser(req: Request, res: Response, next: NextFunction): Promise<void> {
      const { userId } = req.params;

      const categories = await categoryService.getCategoriesByUser(userId);
      res.json(categories);
  }

  // DELETE /api/categories/:id/user/:userId
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
      const { id, userId } = req.params;

      const category = await categoryService.deleteCategory(id, userId);  
      res.json(category);
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
      const { id, userId } = req.params;
      const { name, color, icon } = req.body;

      const category = await categoryService.updateCategory( id, { name, color, icon });
      res.json(category);
  }
}