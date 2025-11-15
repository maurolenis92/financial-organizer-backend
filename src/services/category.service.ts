import { PrismaClient, Category } from '@prisma/client';

const prisma = new PrismaClient();

export class CategoryService {

  async createCategory(data: {
    name: string;
    userId: string;
    color?: string;
    icon?: string;
  }): Promise<Category> {
    return await prisma.category.create({
      data: {
        name: data.name,
        userId: data.userId
      }
    });
  }


  async updateCategory(id: string, data: {
    name?: string;
    color?: string;
    icon?: string;
  }): Promise<Category> {
    return await prisma.category.update({
      where: { id },
      data: {
        ...data
      }
    });
  }

  async getCategoriesByUser(userId: string): Promise<Category[]> {
    return await prisma.category.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getCategoryById(id: string, userId: string): Promise<Category | null> {
    return await prisma.category.findFirst({
      where: { 
        id,
        userId
      }
    });
  }


  async deleteCategory(id: string, userId: string): Promise<Category> {
    return await prisma.category.deleteMany({
      where: { 
        id,
        userId
      }
    }).then(() => {
      return { id, name: '', userId } as Category;
    });
  }
}