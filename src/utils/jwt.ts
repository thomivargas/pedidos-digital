import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  sub: string;   // userId
  email: string;
  role: string;
}

/**
 * Genera un access token de corta duración.
 */
export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

/**
 * Genera un refresh token de larga duración.
 */
export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

/**
 * Verifica un access token. Lanza error si es inválido/expirado.
 */
export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
}

/**
 * Verifica un refresh token. Lanza error si es inválido/expirado.
 */
export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
}

/**
 * Calcula la fecha de expiración del refresh token para guardarla en DB.
 */
export function getRefreshTokenExpiry(): Date {
  const days = parseInt(env.JWT_REFRESH_EXPIRES_IN); // e.g. "7d" → 7
  const ms = days * 24 * 60 * 60 * 1000;
  return new Date(Date.now() + ms);
}
