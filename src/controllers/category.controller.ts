import { Request, Response } from 'express'
import { CategoryService } from '../services/category.service';

const categoryService = new CategoryService();

export class CategoriesController {

  // POST /api/categories
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, userId, color, icon } = req.body;

      if (!name || !userId) {
        res.status(400).json({ error: 'Nombre y userId son requeridos' });
        return;
      }

      const existingCategories = await categoryService.getCategoriesByUser(userId);
      const nameExists = existingCategories.some(category => category.name === name);
      if (nameExists) {
        res.status(409).json({ error: 'Ya existe una categoría con ese nombre para este usuario' });
        return;
      }

      const category = await categoryService.createCategory({ name, userId, color, icon });

      res.status(201).json(category);
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ error: 'Error al crear categoría' });
    }
  }

  // GET /api/categories/user/:userId
  async getByUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const categories = await categoryService.getCategoriesByUser(userId);
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Error al obtener categorías' });
    }
  }

  // DELETE /api/categories/:id/user/:userId
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id, userId } = req.params;

      const category = await categoryService.deleteCategory(id, userId);  
      res.json(category);
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ error: 'Error al eliminar categoría' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id, userId } = req.params;
      const { name, color, icon } = req.body;

      const category = await categoryService.updateCategory(userId, id, { name, color, icon });
      res.json(category);
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ error: 'Error al actualizar categoría' });
    }
  }
}