import { Request, Response, NextFunction } from 'express';
import * as pedidosService from './pedidos.service';
import type { CrearPedidoDto } from './pedidos.schema';
import type { PaginationParams } from '../../utils/pagination';

export async function crearPedidoHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const pedido = await pedidosService.crearPedido(req.body as CrearPedidoDto, req.user!.sub);
    res.status(201).json({ status: 'ok', data: pedido });
  } catch (err) {
    next(err);
  }
}

export async function listarPedidosHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await pedidosService.listarMisPedidos(
      req.user!.sub,
      req.query as unknown as PaginationParams,
    );
    res.json({ status: 'ok', ...result });
  } catch (err) {
    next(err);
  }
}

export async function enviarACajaHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    const { pedido, googleForms } = await pedidosService.enviarACaja(
      String(id),
      req.user!.sub,
    );
    res.json({ status: 'ok', data: pedido, googleForms });
  } catch (err) {
    next(err);
  }
}
