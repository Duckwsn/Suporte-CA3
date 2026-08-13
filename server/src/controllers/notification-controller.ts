import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { AppError } from '../core/errors'
import { asyncHandler } from '../utils/asyncHandler'

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { unread, page = '1', limit = '20' } = req.query
  const where: Record<string, unknown> = { recipientId: req.user!.id, organizationId: req.user!.organizationId }
  if (unread === 'true') where.readAt = null

  const take = Math.min(Number(limit) || 20, 100)
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take

  const [items, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      take,
      skip,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { recipientId: req.user!.id, organizationId: req.user!.organizationId, readAt: null } }),
  ])

  res.json({ items, total, unreadCount, page: Number(page) || 1, limit: take })
})

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await prisma.notification.findFirst({
    where: { id: req.params.id, recipientId: req.user!.id, organizationId: req.user!.organizationId },
  })
  if (!notification) throw AppError.notFound('Notificação não encontrada')

  const updated = await prisma.notification.update({
    where: { id: notification.id },
    data: { readAt: new Date() },
  })
  res.json(updated)
})

export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  await prisma.notification.updateMany({
    where: { recipientId: req.user!.id, organizationId: req.user!.organizationId, readAt: null },
    data: { readAt: new Date() },
  })
  res.status(204).end()
})
