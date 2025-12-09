import { $Enums, Expense, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ExpenseService {
  // Crear gasto
  async createExpense(data: {
    budgetId: string;
    categoryId: string;
    concept: string;
    amount: number;
    status: $Enums.ExpenseStatus;
  }): Promise<Expense> {
    return await prisma.expense.create({
      data: {
        amount: data.amount,
        concept: data.concept,
        status: data.status,
        budgetId: data.budgetId,
        categoryId: data.categoryId,
      },
    });
  }

  // Obtener gasto por ID
  async getExpenseById(id: string): Promise<Expense | null> {
    return await prisma.expense.findUnique({
      where: { id },
    });
  }

  // Listar todos los gastos
  async getAllExpenses(data: { budgetId: string }): Promise<Expense[]> {
    return await prisma.expense.findMany({
      where: { budgetId: data.budgetId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateExpense(
    id: string,
    data: {
      categoryId?: string;
      concept?: string;
      amount?: number;
      status?: $Enums.ExpenseStatus;
    }
  ): Promise<Expense> {
    return await prisma.expense.update({
      where: { id },
      data: {
        categoryId: data.categoryId,
        concept: data.concept,
        amount: data.amount,
        status: data.status,
      },
    });
  }

  // Eliminar gasto
  async deleteExpense(id: string): Promise<Expense> {
    return await prisma.expense.delete({
      where: { id },
    });
  }
}
