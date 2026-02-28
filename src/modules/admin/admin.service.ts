import { prisma } from '../../config/database';
import { NotFoundError, BadRequestError, ConflictError } from '../../middlewares/errors';
import { hashPassword } from '../../utils/hash';
import {
  getPaginationArgs,
  buildPaginatedResult,
  type PaginationParams,
} from '../../utils/pagination';
import type { AdminPedidosQuery, AdminVendedoresQuery, CrearUsuarioDto, CrearSucursalDto, AsignarVendedoresDto } from './admin.schema';

export async function listarTodosPedidos(params: AdminPedidosQuery) {
  const { skip, take } = getPaginationArgs(params);

  const where = {
    ...(params.estado && { estado: params.estado }),
    ...(params.vendedorId && { vendedorId: params.vendedorId }),
  };

  const [data, total] = await Promise.all([
    prisma.pedido.findMany({
      where,
      skip,
      take,
      orderBy: { creadoEn: 'desc' },
      include: {
        vendedor: { select: { id: true, nombre: true, correo: true } },
      },
    }),
    prisma.pedido.count({ where }),
  ]);

  return buildPaginatedResult(data, total, params);
}

export async function listarVendedores(params: AdminVendedoresQuery) {
  const { skip, take } = getPaginationArgs(params);

  const sucursalFilter =
    params.sucursalId === 'none'
      ? { sucursalId: null }
      : params.sucursalId
        ? { sucursalId: params.sucursalId }
        : {};

  const where = { rol: 'VENDEDOR' as const, ...sucursalFilter };

  const [data, total] = await Promise.all([
    prisma.usuario.findMany({
      where,
      skip,
      take,
      orderBy: { nombre: 'asc' },
      select: {
        id: true,
        nombre: true,
        correo: true,
        rol: true,
        creadoEn: true,
        sucursalId: true,
        sucursal: { select: { id: true, nombre: true } },
        _count: { select: { pedidos: true } },
      },
    }),
    prisma.usuario.count({ where }),
  ]);

  return buildPaginatedResult(data, total, params);
}

export async function listarSucursales(params: PaginationParams) {
  const { skip, take } = getPaginationArgs(params);

  const [data, total] = await Promise.all([
    prisma.sucursal.findMany({
      skip,
      take,
      orderBy: { nombre: 'asc' },
      include: {
        _count: { select: { vendedores: true } },
        vendedores: { select: { id: true } },
      },
    }),
    prisma.sucursal.count(),
  ]);

  return buildPaginatedResult(data, total, params);
}

export async function crearSucursal(dto: CrearSucursalDto) {
  return prisma.sucursal.create({
    data: dto,
    select: { id: true, nombre: true, direccion: true, creadoEn: true },
  });
}

export async function asignarVendedores(sucursalId: string, dto: AsignarVendedoresDto) {
  const sucursal = await prisma.sucursal.findUnique({ where: { id: sucursalId } });
  if (!sucursal) throw new NotFoundError('Sucursal no encontrada');

  await prisma.$transaction(async (tx) => {
    // Desasignar todos los vendedores actuales de esta sucursal
    await tx.usuario.updateMany({
      where: { sucursalId },
      data: { sucursalId: null },
    });
    // Asignar los nuevos
    if (dto.vendedorIds.length > 0) {
      await tx.usuario.updateMany({
        where: { id: { in: dto.vendedorIds } },
        data: { sucursalId },
      });
    }
  });

  return prisma.sucursal.findUnique({
    where: { id: sucursalId },
    include: {
      _count: { select: { vendedores: true } },
      vendedores: { select: { id: true } },
    },
  });
}

export async function crearUsuario(dto: CrearUsuarioDto) {
  const existe = await prisma.usuario.findUnique({ where: { correo: dto.correo } });
  if (existe) throw new ConflictError('Ya existe un usuario con ese correo');

  const contrasena = await hashPassword(dto.contrasena);

  const usuario = await prisma.usuario.create({
    data: { nombre: dto.nombre, correo: dto.correo, contrasena, rol: dto.rol },
    select: { id: true, nombre: true, correo: true, rol: true, creadoEn: true },
  });

  return usuario;
}

export async function completarPedido(pedidoId: string) {
  const pedido = await prisma.pedido.findUnique({ where: { id: pedidoId } });

  if (!pedido) throw new NotFoundError('Pedido no encontrado');
  if (pedido.estado !== 'ENVIADO_A_CAJA')
    throw new BadRequestError(
      `Solo se pueden completar pedidos en estado ENVIADO_A_CAJA. Estado actual: ${pedido.estado}`,
    );

  return prisma.pedido.update({
    where: { id: pedidoId },
    data: { estado: 'COMPLETADO' },
  });
}
