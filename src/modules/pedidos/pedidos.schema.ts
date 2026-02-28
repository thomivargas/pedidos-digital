import { z } from 'zod';

export const crearPedidoSchema = z.object({
  nombreProducto: z.string().min(1, 'Nombre del producto requerido'),
  precio: z.number().positive('El precio debe ser mayor a 0'),
  cotizacionDolar: z.number().positive('La cotización debe ser mayor a 0'),
  sku: z.string().min(1, 'SKU requerido'),
});

export type CrearPedidoDto = z.infer<typeof crearPedidoSchema>;
