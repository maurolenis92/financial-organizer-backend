import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import budgetRoutes from './routes/budget.routes';
import userRoutes from './routes/user.routes';
import categoryRoutes from './routes/category.routes';
import incomeRoutes from './routes/income.routes';
import expenseRoutes from './routes/expense.routes';
import { errorHandler } from './middleware/error-handler.middleware';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from './middleware/auth.middleware';

// Cargar variables de entorno
dotenv.config();

// Crear cliente Prisma
const prisma = new PrismaClient();

// Crear aplicación Express
const app = express();

// Configurar puerto
const PORT = process.env.PORT || 3000;

// Detectar entorno
const isDevelopment = process.env.NODE_ENV !== 'production';

// Configurar CORS según entorno
const corsOptions = {
  origin: isDevelopment
    ? 'http://localhost:4200' // Desarrollo: solo Angular local
    : process.env.FRONTEND_URL, // Producción: dominio real
  credentials: true,
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());

// Log de entorno al iniciar
console.log(`🌍 Entorno: ${isDevelopment ? 'DESARROLLO' : 'PRODUCCIÓN'}`);
console.log(`🔐 CORS configurado para: ${corsOptions.origin}`);

// Ruta de prueba
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: '🎉 FinanSmart API funcionando!',
    version: '1.0.0',
    environment: isDevelopment ? 'development' : 'production',
  });
});

// Health check
app.get('/health', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: isDevelopment ? 'development' : 'production',
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Middleware de autenticación
app.use('/api', authMiddleware);

// Rutas de la API
app.use('/api', budgetRoutes);
app.use('/api', userRoutes);
app.use('/api', categoryRoutes);
app.use('/api', incomeRoutes);
app.use('/api', expenseRoutes);

// Middleware global para manejo de errores
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('⚠️  SIGTERM received, closing server gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Entorno: ${isDevelopment ? 'DESARROLLO' : 'PRODUCCIÓN'}`);
});
