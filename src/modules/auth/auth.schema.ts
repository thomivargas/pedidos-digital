import { z } from 'zod';

export const loginSchema = z.object({
  correo: z.string().email('Correo inválido'),
  contrasena: z.string().min(1, 'Contraseña requerida'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token requerido'),
});

export type LoginDto = z.infer<typeof loginSchema>;
export type RefreshDto = z.infer<typeof refreshSchema>;
