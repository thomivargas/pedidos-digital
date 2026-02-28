import { Request, Response, NextFunction } from 'express';
import * as adminService from './admin.service';
import type { AdminPedidosQuery, AdminVendedoresQuery, CrearUsuarioDto, CrearSucursalDto, AsignarVendedoresDto } from './admin.schema';
import type { PaginationParams } from '../../utils/pagination';

export async function listarTodosPedidosHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await adminService.listarTodosPedidos(
      req.query as unknown as AdminPedidosQuery,
    );
    res.json({ status: 'ok', ...result });
  } catch (err) {
    next(err);
  }
}

export async function listarVendedoresHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await adminService.listarVendedores(req.query as unknown as AdminVendedoresQuery);
    res.json({ status: 'ok', ...result });
  } catch (err) {
    next(err);
  }
}

export async function listarSucursalesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await adminService.listarSucursales(req.query as unknown as PaginationParams);
    res.json({ status: 'ok', ...result });
  } catch (err) {
    next(err);
  }
}

export async function crearSucursalHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const sucursal = await adminService.crearSucursal(req.body as CrearSucursalDto);
    res.status(201).json({ status: 'ok', data: sucursal });
  } catch (err) {
    next(err);
  }
}

export async function asignarVendedoresHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const sucursal = await adminService.asignarVendedores(
      String(req.params.id),
      req.body as AsignarVendedoresDto,
    );
    res.json({ status: 'ok', data: sucursal });
  } catch (err) {
    next(err);
  }
}

export async function crearUsuarioHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const usuario = await adminService.crearUsuario(req.body as CrearUsuarioDto);
    res.status(201).json({ status: 'ok', data: usuario });
  } catch (err) {
    next(err);
  }
}

export async function completarPedidoHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    const pedido = await adminService.completarPedido(String(id));
    res.json({ status: 'ok', data: pedido });
  } catch (err) {
    next(err);
  }
}
