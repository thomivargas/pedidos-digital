import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/rol.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  adminPedidosQuerySchema,
  adminVendedoresQuerySchema,
  crearUsuarioSchema,
  crearSucursalSchema,
  asignarVendedoresSchema,
} from './admin.schema';
import {
  listarTodosPedidosHandler,
  listarVendedoresHandler,
  completarPedidoHandler,
  crearUsuarioHandler,
  listarSucursalesHandler,
  crearSucursalHandler,
  asignarVendedoresHandler,
} from './admin.controller';

const router = Router();

// Todas las rutas requieren autenticación como ADMIN
router.use(authenticate, requireRole('ADMIN'));

router.get('/pedidos', validate(adminPedidosQuerySchema, 'query'), listarTodosPedidosHandler);
router.get('/vendedores', validate(adminVendedoresQuerySchema, 'query'), listarVendedoresHandler);
router.patch('/pedidos/:id/completar', completarPedidoHandler);
router.post('/usuarios', validate(crearUsuarioSchema), crearUsuarioHandler);

router.get('/sucursales', validate(adminVendedoresQuerySchema, 'query'), listarSucursalesHandler);
router.post('/sucursales', validate(crearSucursalSchema), crearSucursalHandler);
router.patch('/sucursales/:id/vendedores', validate(asignarVendedoresSchema), asignarVendedoresHandler);

export default router;
