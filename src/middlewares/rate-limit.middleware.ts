import rateLimit from 'express-rate-limit';

// Límite estricto para login: 10 intentos por ventana de 15 min
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' },
});

// Límite general para la API: 100 requests por minuto
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Demasiadas solicitudes. Intenta de nuevo en un momento.' },
});
