import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const router = Router();
const userController = new UserController();

// Rutas de usuarios
router.post('/users', (req, res) => userController.create(req, res));
router.get('/users', (req, res) => userController.getAll(req, res));
router.get('/users/:id', (req, res) => userController.getById(req, res));

export default router;