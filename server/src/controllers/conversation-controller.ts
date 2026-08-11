import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { notifyAllAgents } from '../lib/notify'
import { AppError } from '../core/errors'
import { asyncHandler } from '../utils/asyncHandler'

const conversationInclude = {
  contact: { select: { id: true, name: true, phone: true, email: true, whatsappId: true } },
  assignee: { select: { id: true, name: true, email: true } },
  team: { select: { id: true, name: true } },
  _count: { select: { messages: true, tickets: true } },
} as const

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { status, channel, assigneeId, contactId, page = '1', limit = '20' } = req.query
  const where: Record<string, unknown> = {}

  if (status) where.status = status
  if (channel) where.channel = channel
  if (assigneeId) where.assigneeId = assigneeId
  if (contactId) where.contactId = contactId

  const take = Math.min(Number(limit) || 20, 100)
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take

  const [items, total] = await Promise.all([
    prisma.conversation.findMany({
      where,
      take,
      skip,
      orderBy: [{ status: 'asc' }, { lastMessageAt: 'desc' }],
      include: conversationInclude,
    }),
    prisma.conversation.count({ where }),
  ])

  res.json({ items, total, page: Number(page) || 1, limit: take })
})

export const detail = asyncHandler(async (req: Request, res: Response) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: req.params.id },
    include: {
      ...conversationInclude,
      messages: { orderBy: { createdAt: 'asc' } },
      tickets: { select: { id: true, number: true, subject: true, status: true, priority: true } },
    },
  })
  if (!conversation) throw AppError.notFound('Conversa não encontrada')
  res.json(conversation)
})

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { channel = 'WEB', contactId, title } = req.body ?? {}
  if (!contactId) throw AppError.badRequest('contactId é obrigatório')

  const contact = await prisma.contact.findUnique({ where: { id: contactId } })
  if (!contact) throw AppError.notFound('Contato não encontrado')

  const conversation = await prisma.conversation.create({
    data: {
      channel,
      contactId,
      title: title ?? null,
      status: 'AGUARDANDO_ATENDENTE',
    },
    include: conversationInclude,
  })

  await notifyAllAgents(
    'NOVA_MENSAGEM',
    'Nova conversa',
    `Nova conversa de ${contact.name}`,
  )

  res.status(201).json(conversation)
})

export const assign = asyncHandler(async (req: Request, res: Response) => {
  const { assigneeId } = req.body ?? {}
  if (!assigneeId) throw AppError.badRequest('assigneeId é obrigatório')

  const conversation = await prisma.conversation.update({
    where: { id: req.params.id },
    data: {
      assigneeId,
      status: 'EM_ATENDIMENTO',
      teamId: req.user?.teamId ?? undefined,
    },
    include: conversationInclude,
  })
  res.json(conversation)
})

export const changeStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body ?? {}
  const allowed = ['AGUARDANDO_ATENDENTE', 'EM_ATENDIMENTO', 'RESOLVIDO', 'FECHADO']
  if (!status || !allowed.includes(status)) {
    throw AppError.badRequest('Status inválido')
  }

  const conversation = await prisma.conversation.update({
    where: { id: req.params.id },
    data: {
      status,
      resolvedAt: status === 'RESOLVIDO' || status === 'FECHADO' ? new Date() : null,
    },
    include: conversationInclude,
  })
  res.json(conversation)
})

export const listMessages = asyncHandler(async (req: Request, res: Response) => {
  const { since } = req.query
  const where: Record<string, unknown> = { conversationId: req.params.id }
  if (since) where.createdAt = { gt: new Date(String(since)) }

  const messages = await prisma.message.findMany({
    where,
    orderBy: { createdAt: 'asc' },
    include: { sender: { select: { id: true, name: true, role: true } } },
  })
  res.json(messages)
})

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { senderType, body, mediaUrl } = req.body ?? {}
  if (!senderType) throw AppError.badRequest('senderType é obrigatório')
  if (!body && !mediaUrl) throw AppError.badRequest('Conteúdo da mensagem é obrigatório')

  const conversation = await prisma.conversation.findUnique({
    where: { id: req.params.id },
    include: { assignee: { select: { id: true } } },
  })
  if (!conversation) throw AppError.notFound('Conversa não encontrada')

  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderType,
      senderId: senderType === 'AGENT' ? req.user!.id : null,
      body: body ?? '',
      mediaUrl: mediaUrl ?? null,
      status: senderType === 'AGENT' ? 'ENTREGUE' : 'ENVIADA',
    },
  })

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: {
      lastMessageAt: new Date(),
      status: senderType === 'AGENT' ? 'EM_ATENDIMENTO' : conversation.status,
    },
  })

  res.status(201).json(message)
})

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  const message = await prisma.message.update({
    where: { id: req.params.id },
    data: { status: 'LIDA', readAt: new Date() },
  })
  res.json(message)
})
