import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';

const router = Router();
const dashboardController = new DashboardController();

// Rutas del dashboard
router.get('/dashboard/summary', (req, res, next) =>
  dashboardController.getSummary(req, res, next)
);

export default router;
