import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

const userService = new UserService();

export class UserController {
  
  // POST /api/users
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { email, name } = req.body;
      
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
      
      const user = await userService.createUser({ email, name });
      
      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Error al crear usuario' });
    }
  }
  
  // GET /api/users
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Error al obtener usuarios' });
    }
  }
  
  // GET /api/users/:id
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const user = await userService.getUserById(id);
      
      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Error al obtener usuario' });
    }
  }
}