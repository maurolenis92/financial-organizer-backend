// services/dashboard.service.ts
import { PrismaClient, Budget } from '@prisma/client';
import {
  AlertDTO,
  DashboardDTO,
  ExpenseByCategoryDTO,
  MonthlyTrendDTO,
  RecentTransactionDTO,
} from '../dtos/dashboard.dto';
import { DashboardMapper } from '../mappers/dashboard.mapper';

export class DashboardService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getSummary(userId: string, month: number, year: number): Promise<DashboardDTO> {
    // Obtener presupuestos del mes actual
    const budgets = await this.getBudgetsForMonth(userId, month, year);
    const budgetIds = budgets.map((b) => b.id);

    // Si no hay presupuestos, retornar datos vacíos
    if (budgetIds.length === 0) {
      return this.getEmptySummary(month, year, userId);
    }

    // Obtener datos del mes anterior para comparación
    const previousMonthData = await this.getMonthTotals(userId, month - 1, year);

    // Ejecutar todas las queries en paralelo
    const [summary, expensesByCategory, monthlyTrend, recentTransactions, alerts] =
      await Promise.all([
        this.calculateSummary(budgetIds, previousMonthData),
        this.getExpensesByCategory(budgetIds),
        this.getMonthlyTrend(userId, month, year),
        this.getRecentTransactions(budgetIds, 5),
        this.generateAlerts(budgets),
      ]);

    // Convertir presupuestos usando el mapper existente
    const activeBudgets = budgets
      .map((budget) => DashboardMapper.toActiveBudgetDTO(budget))
      .sort((a, b) => {
        const statusOrder = { ACTIVO: 0, PLANIFICADO: 1, COMPLETADO: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      });

    return {
      period: { month, year },
      summary,
      expensesByCategory,
      monthlyTrend,
      activeBudgets,
      recentTransactions,
      alerts,
    };
  }

  // ============================================
  // HELPERS PRIVADOS - Reutilización de código
  // ============================================

  // Obtener presupuestos que intersectan con un mes
  private async getBudgetsForMonth(userId: string, month: number, year: number): Promise<Budget[]> {
    // Ajustar mes y año si es necesario (para mes anterior)
    let adjustedMonth = month;
    let adjustedYear = year;

    if (month <= 0) {
      adjustedMonth = 12 + month;
      adjustedYear = year - 1;
    } else if (month > 12) {
      adjustedMonth = month - 12;
      adjustedYear = year + 1;
    }

    const startDate = new Date(adjustedYear, adjustedMonth - 1, 1);
    const endDate = new Date(adjustedYear, adjustedMonth, 0, 23, 59, 59);

    return this.prisma.budget.findMany({
      where: {
        userId,
        OR: [
          { startDate: { gte: startDate, lte: endDate } },
          { endDate: { gte: startDate, lte: endDate } },
          { AND: [{ startDate: { lte: startDate } }, { endDate: { gte: endDate } }] },
        ],
      },
    });
  }

  // Calcular totales de un mes
  private async getMonthTotals(
    userId: string,
    month: number,
    year: number
  ): Promise<{ totalIncome: number; totalExpenses: number }> {
    const budgets = await this.getBudgetsForMonth(userId, month, year);
    const budgetIds = budgets.map((b) => b.id);

    if (budgetIds.length === 0) {
      return { totalIncome: 0, totalExpenses: 0 };
    }

    const [incomes, expenses] = await Promise.all([
      this.prisma.income.aggregate({
        where: { budgetId: { in: budgetIds } },
        _sum: { amount: true },
      }),
      this.prisma.expense.aggregate({
        where: { budgetId: { in: budgetIds } },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalIncome: incomes._sum.amount || 0,
      totalExpenses: expenses._sum.amount || 0,
    };
  }

  // Calcular resumen con comparación del mes anterior
  private async calculateSummary(
    budgetIds: string[],
    previousMonthData: { totalIncome: number; totalExpenses: number }
  ) {
    const [incomes, expenses] = await Promise.all([
      this.prisma.income.aggregate({
        where: { budgetId: { in: budgetIds } },
        _sum: { amount: true },
      }),
      this.prisma.expense.aggregate({
        where: { budgetId: { in: budgetIds } },
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = incomes._sum.amount || 0;
    const totalExpenses = expenses._sum.amount || 0;

    return {
      totalIncome,
      totalIncomeChange: DashboardMapper.calculatePercentageChange(
        previousMonthData.totalIncome,
        totalIncome
      ),
      totalExpenses,
      totalExpensesChange: DashboardMapper.calculatePercentageChange(
        previousMonthData.totalExpenses,
        totalExpenses
      ),
      available: totalIncome - totalExpenses,
    };
  }

  // Retornar dashboard vacío
  private async getEmptySummary(
    month: number,
    year: number,
    userId: string
  ): Promise<DashboardDTO> {
    return {
      period: { month, year },
      summary: {
        totalIncome: 0,
        totalIncomeChange: null,
        totalExpenses: 0,
        totalExpensesChange: null,
        available: 0,
      },
      expensesByCategory: [],
      monthlyTrend: await this.getMonthlyTrend(userId, month, year),
      activeBudgets: [],
      recentTransactions: [],
      alerts: [],
    };
  }

  // ============================================
  // MÉTODOS PÚBLICOS - Datos específicos
  // ============================================

  // Gastos por categoría con porcentajes
  async getExpensesByCategory(budgetIds: string[]): Promise<ExpenseByCategoryDTO[]> {
    if (budgetIds.length === 0) return [];

    const grouped = await this.prisma.expense.groupBy({
      by: ['categoryId'],
      where: { budgetId: { in: budgetIds } },
      _sum: { amount: true },
      _count: { id: true },
    });

    // Obtener categorías en una sola query
    const categoryIds = grouped.map((r) => r.categoryId);
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, color: true, icon: true },
    });

    const total = grouped.reduce((sum, r) => sum + (r._sum.amount || 0), 0);
    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    return grouped
      .map((r) => {
        const category = categoryMap.get(r.categoryId);
        const amount = r._sum.amount || 0;

        return {
          categoryId: r.categoryId,
          categoryName: category?.name || 'Sin categoría',
          categoryColor: category?.color || '#6b7280',
          categoryIcon: category?.icon || null,
          total: amount,
          percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
          count: r._count.id,
        };
      })
      .sort((a, b) => b.total - a.total);
  }

  // Tendencia mensual simplificada
  async getMonthlyTrend(userId: string, month: number, year: number): Promise<MonthlyTrendDTO[]> {
    const trends: MonthlyTrendDTO[] = [];
    const monthNames = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];

    // Obtener últimos 6 meses en paralelo
    const monthPromises = [];
    for (let i = 5; i >= 0; i--) {
      monthPromises.push(this.getMonthTotals(userId, month - i, year));
    }

    const monthsData = await Promise.all(monthPromises);

    // Construir respuesta
    for (let i = 5; i >= 0; i--) {
      let m = month - i;
      let y = year;

      while (m <= 0) {
        m += 12;
        y -= 1;
      }

      trends.push({
        month: monthNames[m - 1],
        year: y,
        amount: monthsData[5 - i].totalExpenses,
      });
    }

    return trends;
  }

  // Últimas transacciones (gastos e ingresos combinados)
  async getRecentTransactions(budgetIds: string[], limit: number): Promise<RecentTransactionDTO[]> {
    if (budgetIds.length === 0) return [];

    const [expenses, incomes] = await Promise.all([
      this.prisma.expense.findMany({
        where: { budgetId: { in: budgetIds } },
        include: { category: { select: { name: true, icon: true, color: true } } },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      this.prisma.income.findMany({
        where: { budgetId: { in: budgetIds } },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
    ]);

    const transactions: RecentTransactionDTO[] = [
      ...expenses.map((e) => ({
        id: e.id,
        type: 'expense' as const,
        category: e.category.name,
        categoryIcon: e.category.icon,
        categoryColor: e.category.color,
        amount: -e.amount,
        status: e.status === 'PAID' ? 'Completado' : 'Pendiente',
        createdAt: e.createdAt,
        timeAgo: DashboardMapper.getTimeAgo(e.createdAt),
      })),
      ...incomes.map((i) => ({
        id: i.id,
        type: 'income' as const,
        category: i.concept,
        categoryColor: null,
        categoryIcon: null,
        amount: i.amount,
        status: 'Completado',
        createdAt: i.createdAt,
        timeAgo: DashboardMapper.getTimeAgo(i.createdAt),
      })),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);

    return transactions;
  }

  // Generar alertas inteligentes
  async generateAlerts(budgets: Budget[]): Promise<AlertDTO[]> {
    const alerts: AlertDTO[] = [];
    const now = new Date();

    // Procesar alertas en paralelo
    const alertPromises = budgets.map(async (budget) => {
      const budgetAlerts: AlertDTO[] = [];
      const percentageUsed =
        budget.totalIncomes > 0 ? (budget.totalExpenses / budget.totalIncomes) * 100 : 0;

      // Alerta de consumo de presupuesto
      if (percentageUsed >= 50 && budget.endDate > now) {
        budgetAlerts.push({
          type: 'warning' as const,
          severity: (percentageUsed >= 80 ? 'high' : 'medium') as 'high' | 'medium',
          title: `Presupuesto '${budget.name}' al ${Math.round(percentageUsed)}%`,
          message: `Has consumido ${Math.round(percentageUsed)}% de tu presupuesto`,
          budgetId: budget.id,
        });
      }

      // Alerta de gastos pendientes
      const pendingData = await this.prisma.expense.aggregate({
        where: { budgetId: budget.id, status: 'PENDING' },
        _sum: { amount: true },
        _count: true,
      });

      if (pendingData._count > 0) {
        budgetAlerts.push({
          type: 'info' as const,
          severity: 'low' as const,
          title: `Gastos pendientes de $${pendingData._sum.amount?.toLocaleString()}`,
          message: `Tienes ${pendingData._count} facturas marcadas como pendientes de pago`,
          budgetId: budget.id,
        });
      }

      return budgetAlerts;
    });

    const allAlerts = await Promise.all(alertPromises);
    return allAlerts.flat();
  }
}
