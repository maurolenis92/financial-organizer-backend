import { Router } from 'express';
import { CategoriesController } from '../controllers/category.controller';

const router = Router();
const categoriesController = new CategoriesController();

// Rutas de categorías
router.post('/category', (req, res) => categoriesController.create(req, res));
router.get('/category/user/:userId', (req, res) => categoriesController.getByUser(req, res));
router.delete('/category/:id/user/:userId', (req, res) => categoriesController.delete(req, res));
router.put('/category/:id/user/:userId', (req, res) => categoriesController.update(req, res));

export default router;