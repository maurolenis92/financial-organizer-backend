import { PrismaClient, Budget, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Tipo para Budget con relaciones incluidas
type BudgetWithRelations = Prisma.BudgetGetPayload<{
  include: {
    incomes: true;
    expenses: {
      include: {
        category: true;
      };
    };
  };
}>;

export class BudgetService {
  
  // Crear presupuesto
  async createBudget(data: {
    userId: string;
    startDate: Date;
    endDate: Date;
    currency: string;
  }): Promise<Budget> {
    return await prisma.budget.create({
      data: {
        userId: data.userId,
        startDate: data.startDate,
        endDate: data.endDate,
        currency: data.currency,
        totalIncomes: 0,
        totalExpenses: 0,
        availableMoney: 0
      }
    });
  }
  
  // Listar presupuestos de un usuario
  async getBudgetsByUser(userId: string): Promise<BudgetWithRelations[]> {
    return await prisma.budget.findMany({
      where: { userId },
      include: {
        incomes: true,
        expenses: {
          include: { category: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
  
  // Obtener un presupuesto específico
  async getBudgetById(id: string, userId: string): Promise<BudgetWithRelations | null> {
    return await prisma.budget.findFirst({
      where: { 
        id,
        userId
      },
      include: {
        incomes: true,
        expenses: {
          include: { category: true }
        }
      }
    });
  }
  
  // Actualizar presupuesto
  async updateBudget(
    id: string, 
    data: {
      startDate?: Date;
      endDate?: Date;
      currency?: string;
    }
  ): Promise<Budget> {
    return await prisma.budget.update({
      where: { 
        id
      },
      data
    });
  }
  
  // Eliminar presupuesto
  async deleteBudget(id: string): Promise<Budget> {
    return await prisma.budget.delete({
      where: {
        id
      }
    });
  }
  
  // Recalcular totales del presupuesto
  async recalculateBudget(budgetId: string): Promise<Budget> {
    // Obtener todos los ingresos
    const incomes = await prisma.income.findMany({
      where: { budgetId }
    });
    
    // Obtener todos los gastos
    const expenses = await prisma.expense.findMany({
      where: { budgetId }
    });
    
    // Calcular totales
    const totalIncomes = incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const availableMoney = totalIncomes - totalExpenses;
    
    // Actualizar presupuesto
    return await prisma.budget.update({
      where: { id: budgetId },
      data: {
        totalIncomes,
        totalExpenses,
        availableMoney
      }
    });
  }
}