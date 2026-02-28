import { Request, Response, NextFunction } from 'express';
import { Rol } from '@prisma/client';
import { ForbiddenError, UnauthorizedError } from './errors';

/**
 * Middleware de autorización por rol.
 * Uso: router.get('/admin', authenticate, requireRole('ADMIN'), handler)
 */
export function requireRole(...roles: Rol[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    if (!roles.includes(req.user.role as Rol)) {
      return next(new ForbiddenError(`Se requiere rol: ${roles.join(' o ')}`));
    }

    next();
  };
}
