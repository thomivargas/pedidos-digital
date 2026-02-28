import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env';
import { errorHandler } from './middlewares/error.middleware';
import { authLimiter, apiLimiter } from './middlewares/rate-limit.middleware';
import authRoutes from './modules/auth/auth.routes';
import pedidosRoutes from './modules/pedidos/pedidos.routes';
import adminRoutes from './modules/admin/admin.routes';

const app = express();

// ─── Middlewares globales ─────────────────────────────────────────────────────
app.use(helmet());

// CORS — soporta múltiples orígenes separados por coma en CORS_ORIGIN
const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());
app.use(
  cors({
    origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate limiting global
app.use(apiLimiter);

// Logging solo en desarrollo
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: env.NODE_ENV, timestamp: new Date().toISOString() });
});

// ─── Rutas ──────────────────────────────────────────────────────────
const API_PREFIX = '/api';

app.use(`${API_PREFIX}/auth`, authLimiter, authRoutes);
app.use(`${API_PREFIX}/pedidos`, pedidosRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ status: 'error', message: 'Ruta no encontrada' });
});

// ─── Error handler global (debe ser el último) ────────────────────────────────
app.use(errorHandler);

export default app;
