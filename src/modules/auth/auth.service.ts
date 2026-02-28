import { prisma } from '../../config/database';
import { comparePassword } from '../../utils/hash';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt';
import { UnauthorizedError } from '../../middlewares/errors';
import type { LoginDto } from './auth.schema';

export async function login(dto: LoginDto) {
  const usuario = await prisma.usuario.findUnique({
    where: { correo: dto.correo },
  });

  // Mensaje genérico para no revelar si el correo existe
  if (!usuario) throw new UnauthorizedError('Credenciales incorrectas');

  const valida = await comparePassword(dto.contrasena, usuario.contrasena);
  if (!valida) throw new UnauthorizedError('Credenciales incorrectas');

  const payload = { sub: usuario.id, email: usuario.correo, role: usuario.rol };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
    user: {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
    },
  };
}

export async function refresh(token: string) {
  try {
    const payload = verifyRefreshToken(token);

    const usuario = await prisma.usuario.findUnique({ where: { id: payload.sub } });
    if (!usuario) throw new UnauthorizedError('Usuario no encontrado');

    const newPayload = { sub: usuario.id, email: usuario.correo, role: usuario.rol };

    return { accessToken: generateAccessToken(newPayload) };
  } catch {
    throw new UnauthorizedError('Refresh token inválido o expirado');
  }
}
