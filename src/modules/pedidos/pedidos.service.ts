import { prisma } from '../../config/database';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../middlewares/errors';
import {
  getPaginationArgs,
  buildPaginatedResult,
  type PaginationParams,
} from '../../utils/pagination';
import { enviarAGoogleForms } from '../../utils/googleForms';
import type { CrearPedidoDto } from './pedidos.schema';

export async function crearPedido(dto: CrearPedidoDto, vendedorId: string) {
  return prisma.pedido.create({
    data: { ...dto, vendedorId },
  });
}

export async function listarMisPedidos(vendedorId: string, params: PaginationParams) {
  const { skip, take } = getPaginationArgs(params);

  const [data, total] = await Promise.all([
    prisma.pedido.findMany({
      where: { vendedorId },
      skip,
      take,
      orderBy: { creadoEn: 'desc' },
    }),
    prisma.pedido.count({ where: { vendedorId } }),
  ]);

  return buildPaginatedResult(data, total, params);
}

export async function enviarACaja(pedidoId: string, vendedorId: string) {
  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    include: { vendedor: { select: { nombre: true } } },
  });

  if (!pedido) throw new NotFoundError('Pedido no encontrado');
  if (pedido.vendedorId !== vendedorId)
    throw new ForbiddenError('No tenés permiso para este pedido');
  if (pedido.estado !== 'PENDIENTE')
    throw new BadRequestError(`El pedido ya está en estado ${pedido.estado}`);

  const pedidoActualizado = await prisma.pedido.update({
    where: { id: pedidoId },
    data: { estado: 'ENVIADO_A_CAJA' },
  });

  const googleForms = await enviarAGoogleForms({
    pedidoId: pedido.id,
    nombreProducto: pedido.nombreProducto,
    sku: pedido.sku,
    precio: pedido.precio.toString(),
    cotizacionDolar: pedido.cotizacionDolar.toString(),
    nombreVendedor: pedido.vendedor.nombre,
  });

  return { pedido: pedidoActualizado, googleForms };
}
