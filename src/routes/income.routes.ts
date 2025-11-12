import { IncomeController } from "../controllers/income.controller";
import { Router } from "express";

const router = Router();
const incomeController = new IncomeController();

// Rutas de ingresos
router.post('/incomes', (req, res) => incomeController.create(req, res));
router.get('/incomes/budget/:budgetId', (req, res) => incomeController.getByBudget(req, res));
router.put('/incomes/:id', (req, res) => incomeController.update(req, res));
router.delete('/incomes/:id', (req, res) => incomeController.delete(req, res));

export default router;