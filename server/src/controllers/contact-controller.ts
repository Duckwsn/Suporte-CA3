import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { AppError } from '../core/errors'
import { asyncHandler } from '../utils/asyncHandler'

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { search, page = '1', limit = '20' } = req.query
  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { name: { contains: String(search), mode: 'insensitive' } },
      { phone: { contains: String(search) } },
      { email: { contains: String(search), mode: 'insensitive' } },
    ]
  }

  const take = Math.min(Number(limit) || 20, 100)
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take

  const [items, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      take,
      skip,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { conversations: true, tickets: true } } },
    }),
    prisma.contact.count({ where }),
  ])

  res.json({ items, total, page: Number(page) || 1, limit: take })
})

export const detail = asyncHandler(async (req: Request, res: Response) => {
  const contact = await prisma.contact.findUnique({
    where: { id: req.params.id },
    include: {
      conversations: { orderBy: { lastMessageAt: 'desc' }, take: 10 },
      tickets: { orderBy: { createdAt: 'desc' }, take: 10 },
    },
  })
  if (!contact) throw AppError.notFound('Contato não encontrado')
  res.json(contact)
})

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { name, phone, email, whatsappId, notes } = req.body ?? {}
  if (!name) throw AppError.badRequest('Nome é obrigatório')

  const contact = await prisma.contact.create({
    data: {
      name: String(name),
      phone: phone ?? null,
      email: email ?? null,
      whatsappId: whatsappId ?? null,
      notes: notes ?? null,
    },
  })
  res.status(201).json(contact)
})

export const update = asyncHandler(async (req: Request, res: Response) => {
  const { name, phone, email, whatsappId, notes } = req.body ?? {}
  const data: Record<string, unknown> = {}
  if (name !== undefined) data.name = String(name)
  if (phone !== undefined) data.phone = phone
  if (email !== undefined) data.email = email
  if (whatsappId !== undefined) data.whatsappId = whatsappId
  if (notes !== undefined) data.notes = notes

  const contact = await prisma.contact.update({ where: { id: req.params.id }, data })
  res.json(contact)
})

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const contact = await prisma.contact.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { conversations: true, tickets: true } } },
  })
  if (!contact) throw AppError.notFound('Contato não encontrado')
  if (contact._count.conversations > 0 || contact._count.tickets > 0) {
    throw AppError.badRequest('Não é possível remover contato com conversas ou tickets')
  }

  await prisma.contact.delete({ where: { id: req.params.id } })
  res.status(204).end()
})
