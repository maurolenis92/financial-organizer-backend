import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

export class UserService {
  
  // Crear usuario
  async createUser(data: {
    email: string;
    name?: string;
  }): Promise<User> {
    return await prisma.user.create({
      data: {
        email: data.email,
        name: data.name
      }
    });
  }
  
  // Obtener usuario por email
  async getUserByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email }
    });
  }
  
  // Obtener usuario por ID
  async getUserById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id }
    });
  }
  
  // Listar todos los usuarios
  async getAllUsers(): Promise<User[]> {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }
}