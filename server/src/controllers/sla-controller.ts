import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { AppError } from '../core/errors'
import { asyncHandler } from '../utils/asyncHandler'

export const listPolicies = asyncHandler(async (_req: Request, res: Response) => {
  const items = await prisma.slaPolicy.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { tickets: true } } },
  })
  res.json(items)
})

export const createPolicy = asyncHandler(async (req: Request, res: Response) => {
  const { name, category, responseTimeMinutes, resolutionTimeMinutes, businessHoursOnly } = req.body ?? {}
  if (!name || !responseTimeMinutes || !resolutionTimeMinutes) {
    throw AppError.badRequest('Nome e prazos de SLA são obrigatórios')
  }

  const policy = await prisma.slaPolicy.create({
    data: {
      name: String(name),
      category: category ?? null,
      responseTimeMinutes: Number(responseTimeMinutes),
      resolutionTimeMinutes: Number(resolutionTimeMinutes),
      businessHoursOnly: businessHoursOnly ?? true,
    },
  })
  res.status(201).json(policy)
})

export const updatePolicy = asyncHandler(async (req: Request, res: Response) => {
  const { name, category, responseTimeMinutes, resolutionTimeMinutes, businessHoursOnly, isActive } = req.body ?? {}
  const data: Record<string, unknown> = {}
  if (name !== undefined) data.name = String(name)
  if (category !== undefined) data.category = category
  if (responseTimeMinutes !== undefined) data.responseTimeMinutes = Number(responseTimeMinutes)
  if (resolutionTimeMinutes !== undefined) data.resolutionTimeMinutes = Number(resolutionTimeMinutes)
  if (businessHoursOnly !== undefined) data.businessHoursOnly = Boolean(businessHoursOnly)
  if (isActive !== undefined) data.isActive = Boolean(isActive)

  const policy = await prisma.slaPolicy.update({ where: { id: req.params.id }, data })
  res.json(policy)
})

export const removePolicy = asyncHandler(async (req: Request, res: Response) => {
  await prisma.slaPolicy.delete({ where: { id: req.params.id } })
  res.status(204).end()
})
