import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { UserMapper } from '../mappers/user.mapper';

const userService = new UserService();

export class UserController {
  
  // POST /api/users
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { email, name } = req.body;
      const cognitoId = req.cognitoUser!.sub;
      
      // Validar que email existe
      if (!email) {
        res.status(400).json({ error: 'Email es requerido' });
        return;
      }
      
      // Verificar si usuario ya existe
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        res.status(409).json({ error: 'Usuario ya existe con ese email' });
        return;
      }
      
      const user = await userService.createUser({ email, cognitoId, name, });
      
      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Error al crear usuario' });
    }
  }
  
  // GET /api/users
  async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Error al obtener usuarios' });
    }
  }
  
  // GET /api/users/:id
  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = req.user!.id;
      
      const user = await userService.getUserById(id);
      
      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      const userDTO = UserMapper.toDetailDTO(user);
      
      res.json(userDTO);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Error al obtener usuario' });
    }
  }
}