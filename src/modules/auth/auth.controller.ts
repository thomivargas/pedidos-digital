import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import type { LoginDto, RefreshDto } from './auth.schema';

export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await authService.login(req.body as LoginDto);
    res.json({ status: 'ok', ...result });
  } catch (err) {
    next(err);
  }
}

export async function refreshHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { refreshToken } = req.body as RefreshDto;
    const result = await authService.refresh(refreshToken);
    res.json({ status: 'ok', ...result });
  } catch (err) {
    next(err);
  }
}
