import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { AppError } from '../core/errors'
import { asyncHandler } from '../utils/asyncHandler'

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const items = await prisma.organization.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { users: true, teams: true } } },
  })
  res.json(items)
})

export const detail = asyncHandler(async (req: Request, res: Response) => {
  const org = await prisma.organization.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { users: true, teams: true, tickets: true } } },
  })
  if (!org) throw AppError.notFound('Organização não encontrada')
  res.json(org)
})

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { name, slug } = req.body ?? {}
  if (!name || !slug) throw AppError.badRequest('Nome e slug são obrigatórios')

  const existing = await prisma.organization.findUnique({ where: { slug } })
  if (existing) throw AppError.badRequest('Slug já está em uso')

  const org = await prisma.organization.create({
    data: { name: String(name), slug: String(slug).toLowerCase().trim() },
  })
  res.status(201).json(org)
})

export const update = asyncHandler(async (req: Request, res: Response) => {
  const { name, slug, isActive } = req.body ?? {}
  const data: Record<string, unknown> = {}
  if (name !== undefined) data.name = String(name)
  if (slug !== undefined) data.slug = String(slug).toLowerCase().trim()
  if (isActive !== undefined) data.isActive = Boolean(isActive)

  const org = await prisma.organization.update({ where: { id: req.params.id }, data })
  res.json(org)
})

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await prisma.organization.delete({ where: { id: req.params.id } })
  res.status(204).end()
})
