import { Router } from 'express';
import { CategoriesController } from '../controllers/category.controller';
import { validate } from '../middleware/validate.middleware';
import { createCategorySchema, updateCategorySchema } from '../schemas/category.schema';

const router = Router();
const categoriesController = new CategoriesController();

// Rutas de categorías
router.post('/category', validate(createCategorySchema), (req, res, next) => categoriesController.create(req, res, next));
router.get('/category/user/:userId', (req, res, next) => categoriesController.getByUser(req, res, next));
router.delete('/category/:id/user/:userId', (req, res, next) => categoriesController.delete(req, res, next));
router.put('/category/:id/user/:userId', validate(updateCategorySchema), (req, res, next) => categoriesController.update(req, res, next));

export default router;