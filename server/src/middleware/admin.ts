import { Request, Response, NextFunction } from 'express'
import { AppError } from '../core/errors'

export function admin(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') {
    return next(AppError.forbidden('Apenas administradores podem executar esta ação'))
  }
  next()
}

export function supervisorOrAdmin(req: Request, _res: Response, next: NextFunction) {
  const role = req.user?.role
  if (role !== 'ADMIN' && role !== 'SUPERVISOR') {
    return next(AppError.forbidden('Permissão insuficiente'))
  }
  next()
}
