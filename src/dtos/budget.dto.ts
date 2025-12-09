// ============================================
// INPUT DTOs (lo que RECIBES del cliente)
// ============================================

import { CategoryDTO } from './category.dto';
import { ExpenseDTO } from './expense.dto';
import { IncomeDTO } from './income.dto';

export interface CreateBudgetDTO {
  startDate: string;
  endDate: string;
  name: string;
  currency?: string;
}

export interface UpdateBudgetDTO {
  startDate?: string;
  endDate?: string;
  name?: string;
  currency?: string;
}

// ============================================
// OUTPUT DTOs (lo que ENVÍAS al cliente)
// ============================================

export interface BudgetResponseDTO {
  id: string;
  startDate: string;
  name: string;
  endDate: string;
  currency: string;
  totalPaidExpenses: number; // Suma de gastos con estado 'PAID'
  totalIncomes: number; // Suma de todos los ingresos
  totalExpenses: number; // Suma de todos los gastos
  availableMoney: number; // Calculado: totalIncomes - totalExpenses
  percentageUsed: number; // Calculado: (totalExpenses / totalIncomes) * 100
  daysRemaining: number; // Calculado: días entre hoy y endDate
  incomesCount: number; // Calculado: cantidad de ingresos
  expensesCount: number; // Calculado: cantidad de gastos
  expenses?: ExpenseDTO[]; // Lista de gastos asociados al presupuesto
  incomes?: IncomeDTO[]; // Lista de ingresos asociados al presupuesto
  categories?: CategoryDTO[]; // Lista de categorías asociadas al presupuesto
}

export interface BudgetListItemDTO {
  id: string;
  startDate: string;
  name: string;
  endDate: string;
  currency: string;
  totalIncomes: number;
  totalExpenses: number;
  availableMoney: number;
  percentageUsed: number;
  daysRemaining: number;
  // Sin incluir los arrays de incomes/expenses (más liviano para listados)
}

export interface UpdateBudgetFullDTO {
  startDate?: string;
  endDate?: string;
  currency?: string;
  incomes: IncomeDTO[];
  expenses: ExpenseDTO[];
}
