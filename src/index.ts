import config from '@config/config';
import express, { Application, Request, Response } from 'express';
import connectDB from '@config/database';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes';
import employeeRoutes from './routes/employeeRoutes';
import evaluationsRoutes from './routes/evaluationRoutes';
import questionRoutes from './routes/questionRoutes';
import reportRoutes from './routes/reportRoutes';
import errorMiddleware from '@middlewares/errorMiddleware';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import startNotificationCronJob from '@cron/notificationCron';

const app: Application = express();

// Middlewares
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 50 })); // 50 Requests cada 15 segundos

// Conexion a la base de datos
connectDB();

// Rutas
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the Rest Api 1.0');
});
app.use('/api/auth', authRoutes);
app.use('/api', employeeRoutes);
app.use('/api', evaluationsRoutes);
app.use('/api', questionRoutes);
app.use('/api', reportRoutes);

// Documentación de Swagger
const swaggerDocument = YAML.load('./src/docs/swagger.yaml');
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middlewares de errores
app.use(errorMiddleware);

// Iniciar el cron job de Notificaciones
startNotificationCronJob();

// Servidor
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

export default app;