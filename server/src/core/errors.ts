export class AppError extends Error {
  statusCode: number
  code: string

  constructor(statusCode: number, code: string, message: string) {
    super(message)
    this.statusCode = statusCode
    this.code = code
  }

  static badRequest(message: string): AppError {
    return new AppError(400, 'VALIDATION_ERROR', message)
  }

  static unauthorized(message = 'Não autenticado'): AppError {
    return new AppError(401, 'UNAUTHORIZED', message)
  }

  static forbidden(message = 'Sem permissão'): AppError {
    return new AppError(403, 'FORBIDDEN', message)
  }

  static notFound(message = 'Recurso não encontrado'): AppError {
    return new AppError(404, 'NOT_FOUND', message)
  }
}
