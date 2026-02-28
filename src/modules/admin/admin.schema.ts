import { z } from 'zod';
import { EstadoPedido, Rol } from '@prisma/client';
import { paginationSchema } from '../../utils/pagination';

export const adminPedidosQuerySchema = paginationSchema.extend({
  estado: z.nativeEnum(EstadoPedido).optional(),
  vendedorId: z.string().optional(),
});

export const adminVendedoresQuerySchema = paginationSchema.extend({
  sucursalId: z.string().optional(), // ID real o "none" para sin sucursal
});

export type AdminVendedoresQuery = z.infer<typeof adminVendedoresQuerySchema>;

export const crearUsuarioSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  correo: z.string().email('Correo inválido'),
  contrasena: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  rol: z.nativeEnum(Rol).default('VENDEDOR'),
});

export const crearSucursalSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  direccion: z.string().optional(),
});

export const asignarVendedoresSchema = z.object({
  vendedorIds: z.array(z.string()),
});

export type AdminPedidosQuery = z.infer<typeof adminPedidosQuerySchema>;
export type CrearUsuarioDto = z.infer<typeof crearUsuarioSchema>;
export type CrearSucursalDto = z.infer<typeof crearSucursalSchema>;
export type AsignarVendedoresDto = z.infer<typeof asignarVendedoresSchema>;
