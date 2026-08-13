import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { AppError } from '../core/errors'
import { asyncHandler } from '../utils/asyncHandler'

export const list = asyncHandler(async (req: Request, res: Response) => {
  const items = await prisma.team.findMany({
    where: { organizationId: req.user!.organizationId },
    orderBy: { name: 'asc' },
    include: { _count: { select: { members: true, tickets: true } }, supervisor: { select: { id: true, name: true } } },
  })
  res.json(items)
})

export const detail = asyncHandler(async (req: Request, res: Response) => {
  const team = await prisma.team.findFirst({
    where: { id: req.params.id, organizationId: req.user!.organizationId },
    include: { members: { select: { id: true, name: true, email: true, role: true, isActive: true } }, supervisor: { select: { id: true, name: true } } },
  })
  if (!team) throw AppError.notFound('Equipe não encontrada')
  res.json(team)
})

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, supervisorId } = req.body ?? {}
  if (!name) throw AppError.badRequest('Nome da equipe é obrigatório')
  const team = await prisma.team.create({
    data: { name: String(name), description: description ?? null, organizationId: req.user!.organizationId, supervisorId: supervisorId ?? null },
  })
  res.status(201).json(team)
})

export const update = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, supervisorId } = req.body ?? {}
  const data: Record<string, unknown> = {}
  if (name !== undefined) data.name = String(name)
  if (description !== undefined) data.description = description
  if (supervisorId !== undefined) data.supervisorId = supervisorId || null

  const team = await prisma.team.update({
    where: { id: req.params.id, organizationId: req.user!.organizationId },
    data,
  })
  res.json(team)
})

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await prisma.team.delete({
    where: { id: req.params.id, organizationId: req.user!.organizationId },
  })
  res.status(204).end()
})

export const addMember = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.body ?? {}
  if (!userId) throw AppError.badRequest('userId é obrigatório')

  await prisma.user.update({
    where: { id: userId, organizationId: req.user!.organizationId },
    data: { teamId: req.params.id },
  })
  res.status(204).end()
})

export const removeMember = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findFirst({
    where: { id: req.params.userId, teamId: req.params.id, organizationId: req.user!.organizationId },
  })
  if (!user) throw AppError.notFound('Membro não pertence a esta equipe')

  await prisma.user.update({ where: { id: user.id }, data: { teamId: null } })
  res.status(204).end()
})
