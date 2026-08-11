import { Request, Response, NextFunction } from 'express'
import { AppError } from '../core/errors'

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(AppError.notFound(`Rota não encontrada: ${req.method} ${req.originalUrl}`))
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    })
  }

  console.error('[error]', err)
  return res.status(500).json({
    error: { code: 'INTERNAL', message: 'Erro interno do servidor' },
  })
}
