import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma'
import { verifyToken } from '../utils/token'
import { AppError } from '../core/errors'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        id: string
        role: string
        email: string
        name: string
        teamId: string | null
        organizationId: string
      }
    }
  }
}

export async function auth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
      throw AppError.unauthorized()
    }

    const token = header.slice(7)
    let payload: { userId: string; role: string; organizationId: string }
    try {
      payload = verifyToken(token)
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw AppError.unauthorized('Sessão expirada')
      }
      throw AppError.unauthorized('Token inválido')
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true, email: true, name: true, teamId: true, isActive: true, organizationId: true },
    })

    if (!user || !user.isActive) {
      throw AppError.unauthorized('Usuário inativo ou inexistente')
    }

    const org = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: { id: true, isActive: true },
    })

    if (!org || !org.isActive) {
      throw AppError.forbidden('Organização inativa ou inexistente')
    }

    req.user = user
    next()
  } catch (err) {
    next(err)
  }
}
