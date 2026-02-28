import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/rol.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { paginationSchema } from '../../utils/pagination';
import { crearPedidoSchema } from './pedidos.schema';
import {
  crearPedidoHandler,
  listarPedidosHandler,
  enviarACajaHandler,
} from './pedidos.controller';

const router = Router();

// Todas las rutas requieren autenticación como VENDEDOR
router.use(authenticate, requireRole('VENDEDOR'));

router.post('/', validate(crearPedidoSchema), crearPedidoHandler);
router.get('/', validate(paginationSchema, 'query'), listarPedidosHandler);
router.patch('/:id/enviar-caja', enviarACajaHandler);

export default router;
