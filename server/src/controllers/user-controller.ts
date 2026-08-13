import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma'
import { AppError } from '../core/errors'
import { asyncHandler } from '../utils/asyncHandler'

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  organizationId: true,
  teamId: true,
  isActive: true,
  avatarUrl: true,
  createdAt: true,
  team: { select: { id: true, name: true } },
} as const

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { role, search, page = '1', limit = '20' } = req.query
  const where: Record<string, unknown> = { organizationId: req.user!.organizationId }

  if (role) where.role = role
  if (search) {
    where.OR = [
      { name: { contains: String(search), mode: 'insensitive' } },
      { email: { contains: String(search), mode: 'insensitive' } },
    ]
  }

  const take = Math.min(Number(limit) || 20, 100)
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take

  const [items, total] = await Promise.all([
    prisma.user.findMany({ where, take, skip, orderBy: { name: 'asc' }, select: userSelect }),
    prisma.user.count({ where }),
  ])

  res.json({ items, total, page: Number(page) || 1, limit: take })
})

export const detail = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findFirst({
    where: { id: req.params.id, organizationId: req.user!.organizationId },
    select: { ...userSelect, passwordHash: false },
  })
  if (!user) throw AppError.notFound('Usuário não encontrado')
  res.json(user)
})

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role, teamId, isActive } = req.body ?? {}
  if (!name || !email || !password) {
    throw AppError.badRequest('Nome, e-mail e senha são obrigatórios')
  }

  const passwordHash = await bcrypt.hash(String(password), 10)
  const user = await prisma.user.create({
    data: {
      name: String(name),
      email: String(email).toLowerCase().trim(),
      passwordHash,
      role: role ?? 'AGENT',
      organizationId: req.user!.organizationId,
      teamId: teamId ?? null,
      isActive: isActive ?? true,
    },
    select: userSelect,
  })

  res.status(201).json(user)
})

export const update = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role, teamId, isActive } = req.body ?? {}
  const data: Record<string, unknown> = {}

  if (name !== undefined) data.name = String(name)
  if (email !== undefined) data.email = String(email).toLowerCase().trim()
  if (role !== undefined) data.role = role
  if (teamId !== undefined) data.teamId = teamId || null
  if (isActive !== undefined) data.isActive = Boolean(isActive)
  if (password) data.passwordHash = await bcrypt.hash(String(password), 10)

  const user = await prisma.user.update({
    where: { id: req.params.id, organizationId: req.user!.organizationId },
    data,
    select: userSelect,
  })
  res.json(user)
})

export const deactivate = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.update({
    where: { id: req.params.id, organizationId: req.user!.organizationId },
    data: { isActive: false },
    select: userSelect,
  })
  res.json(user)
})
