import { NextFunction, Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const dashboardService = new DashboardService();

export class DashboardController {
  // GET /api/dashboard/summary?month=12&year=2025
  async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();

      // Validar mes
      if (month < 1 || month > 12) {
        res.status(400).json({ error: 'El mes debe estar entre 1 y 12' });
        return;
      }

      const summary = await dashboardService.getSummary(userId, month, year);
      res.json(summary);
    } catch (error) {
      next(error);
    }
  }
}
