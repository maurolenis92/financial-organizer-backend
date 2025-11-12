import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import budgetRoutes from './routes/budget.routes';
import userRoutes from './routes/user.routes';

// Cargar variables de entorno
dotenv.config();

// Crear aplicación Express
const app = express();

// Configurar puerto (usa variable de entorno o 3000 por defecto)
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Permitir conexiones desde tu frontend Angular
app.use(express.json()); // Poder recibir JSON en las peticiones

// Ruta de prueba
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: '🎉 FinanSmart API funcionando!',
    version: '1.0.0'
  });
});

// Ruta de health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Importar y usar rutas de presupuestos
app.use('/api', budgetRoutes);
app.use('/api', userRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});