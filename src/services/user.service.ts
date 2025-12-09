import { Category, PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

export class UserService {
  // Crear usuario
  async createUser(data: { email: string; cognitoId: string; name?: string }): Promise<User> {
    return await prisma.user.create({
      data: {
        email: data.email,
        cognitoId: data.cognitoId,
        name: data.name,
      },
    });
  }

  /**
   * Busca un usuario por cognitoId, o lo crea si no existe
   */
  async findOrCreateUser(data: { email: string; cognitoId: string; name?: string }): Promise<User> {
    // Buscar usuario existente
    let user = await prisma.user.findUnique({
      where: { cognitoId: data.cognitoId },
    });

    // Si no existe, crearlo
    if (!user) {
      user = await this.createUser({
        email: data.email,
        cognitoId: data.cognitoId,
        name: data.name,
      });
      console.log(`✅ Nuevo usuario creado en RDS: ${user.email}`);
    }

    return user;
  }

  /**
   * Obtiene un usuario por cognitoId
   */
  async getUserByCognitoId(cognitoId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { cognitoId },
    });
  }

  // Obtener usuario por email
  async getUserByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  // Obtener usuario por ID
  async getUserById(id: string): Promise<(User & { categories: Category[] }) | null> {
    return await prisma.user.findUnique({
      where: { id },
      include: { categories: true },
    });
  }

  // Listar todos los usuarios
  async getAllUsers(): Promise<User[]> {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
