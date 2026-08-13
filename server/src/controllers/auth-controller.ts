import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma'
import { signToken } from '../utils/token'
import { AppError } from '../core/errors'
import { asyncHandler } from '../utils/asyncHandler'

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  organizationId: true,
  teamId: true,
  isActive: true,
  avatarUrl: true,
  createdAt: true,
} as const

function buildAuthResponse(user: { id: string; role: string; organizationId: string }) {
  return {
    token: signToken({ userId: user.id, role: user.role, organizationId: user.organizationId }),
    user,
    organization: null as { id: string; name: string; slug: string } | null,
  }
}

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {}
  if (!email || !password) {
    throw AppError.badRequest('E-mail e senha são obrigatórios')
  }

  const user = await prisma.user.findUnique({
    where: { email: String(email).toLowerCase().trim() },
  })

  if (!user || !user.isActive) {
    throw AppError.unauthorized('Credenciais inválidas')
  }

  const valid = await bcrypt.compare(String(password), user.passwordHash)
  if (!valid) {
    throw AppError.unauthorized('Credenciais inválidas')
  }

  const safe = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { ...publicUserSelect, organization: { select: { id: true, name: true, slug: true } } },
  })

  const response = buildAuthResponse(safe)
  response.organization = safe.organization
  res.json(response)
})

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role, organizationId } = req.body ?? {}
  if (!name || !email || !password) {
    throw AppError.badRequest('Nome, e-mail e senha são obrigatórios')
  }

  if (!organizationId) {
    throw AppError.badRequest('organizationId é obrigatório')
  }

  const org = await prisma.organization.findUnique({ where: { id: organizationId } })
  if (!org || !org.isActive) {
    throw AppError.badRequest('Organização inválida ou inativa')
  }

  const allowedRoles = ['ADMIN', 'SUPERVISOR', 'AGENT', 'CUSTOMER']
  const requestedRole = role && allowedRoles.includes(role) ? role : 'CUSTOMER'

  const existing = await prisma.user.findUnique({
    where: { email: String(email).toLowerCase().trim() },
  })
  if (existing) {
    throw AppError.badRequest('E-mail já cadastrado')
  }

  const passwordHash = await bcrypt.hash(String(password), 10)
  const user = await prisma.user.create({
    data: {
      name: String(name),
      email: String(email).toLowerCase().trim(),
      passwordHash,
      role: requestedRole,
      organizationId,
    },
    select: { ...publicUserSelect, organization: { select: { id: true, name: true, slug: true } } },
  })

  const response = buildAuthResponse(user)
  response.organization = user.organization
  res.status(201).json(response)
})

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: req.user!.id },
    select: publicUserSelect,
  })
  res.json(user)
})
