// Period DTO
export interface PeriodDTO {
  month: number;
  year: number;
}

// Summary DTO
export interface SummaryDTO {
  totalIncome: number;
  totalIncomeChange: number | null;
  totalExpenses: number;
  totalExpensesChange: number | null;
  available: number;
}

// Expense by Category DTO
export interface ExpenseByCategoryDTO {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string | null;
  total: number;
  percentage: number;
  count: number;
}

// Monthly Trend DTO
export interface MonthlyTrendDTO {
  month: string;
  year: number;
  amount: number;
}

// Active Budget DTO
export interface ActiveBudgetDTO {
  id: string;
  name: string;
  status: 'ACTIVO' | 'PLANIFICADO' | 'COMPLETADO';
  startDate: Date;
  endDate: Date;
  totalIncome: number;
  totalExpenses: number;
  percentageUsed: number;
  daysRemaining: number;
  goal?: number; // Meta opcional para presupuestos de ahorro
}

// Recent Transaction DTO
export interface RecentTransactionDTO {
  id: string;
  type: 'expense' | 'income';
  category: string;
  categoryIcon: string | null;
  categoryColor: string | null;
  amount: number;
  status: string;
  createdAt: Date;
  timeAgo: string;
}

// Alert DTO
export interface AlertDTO {
  type: 'warning' | 'info' | 'error';
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  budgetId: string;
}

// Main Dashboard DTO
export interface DashboardDTO {
  period: PeriodDTO;
  summary: SummaryDTO;
  expensesByCategory: ExpenseByCategoryDTO[];
  monthlyTrend: MonthlyTrendDTO[];
  activeBudgets: ActiveBudgetDTO[];
  recentTransactions: RecentTransactionDTO[];
  alerts: AlertDTO[];
}
