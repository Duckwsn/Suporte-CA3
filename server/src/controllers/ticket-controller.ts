import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { resolveSlaForTicket } from '../lib/sla'
import { notify, notifyTeam } from '../lib/notify'
import { enqueueRealtime } from '../queue'
import { AppError } from '../core/errors'
import { asyncHandler } from '../utils/asyncHandler'

const ticketInclude = {
  conversation: { select: { id: true, channel: true, status: true } },
  contact: { select: { id: true, name: true, phone: true, email: true } },
  assignee: { select: { id: true, name: true, email: true } },
  team: { select: { id: true, name: true } },
  slaPolicy: { select: { id: true, name: true, category: true } },
  slaBreaches: { orderBy: { detectedAt: 'desc' } },
} as const

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { status, priority, category, assigneeId, teamId, contactId, search, page = '1', limit = '20' } = req.query
  const where: Record<string, unknown> = { organizationId: req.user!.organizationId }

  if (status) where.status = status
  if (priority) where.priority = priority
  if (category) where.category = category
  if (assigneeId) where.assigneeId = assigneeId
  if (teamId) where.teamId = teamId
  if (contactId) where.contactId = contactId
  if (search) {
    where.OR = [
      { subject: { contains: String(search), mode: 'insensitive' } },
      { description: { contains: String(search), mode: 'insensitive' } },
      { number: !Number.isNaN(Number(search)) ? Number(search) : undefined },
    ]
  }

  const take = Math.min(Number(limit) || 20, 100)
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take

  const [items, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      take,
      skip,
      orderBy: { openedAt: 'desc' },
      include: ticketInclude,
    }),
    prisma.ticket.count({ where }),
  ])

  res.json({ items, total, page: Number(page) || 1, limit: take })
})

export const detail = asyncHandler(async (req: Request, res: Response) => {
  const ticket = await prisma.ticket.findFirst({
    where: { id: req.params.id, organizationId: req.user!.organizationId },
    include: {
      ...ticketInclude,
      auditLogs: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  })
  if (!ticket) throw AppError.notFound('Ticket não encontrado')
  res.json(ticket)
})

export const create = asyncHandler(async (req: Request, res: Response) => {
  const {
    subject,
    description,
    priority = 'MEDIA',
    category,
    conversationId,
    contactId,
    assigneeId,
    teamId,
  } = req.body ?? {}

  if (!subject || !description) {
    throw AppError.badRequest('Assunto e descrição são obrigatórios')
  }

  const sla = await resolveSlaForTicket({ category: category ?? null })

  const ticket = await prisma.ticket.create({
    data: {
      subject: String(subject),
      description: String(description),
      priority,
      category: category ?? null,
      conversationId: conversationId ?? null,
      contactId: contactId ?? null,
      organizationId: req.user!.organizationId,
      assigneeId: assigneeId ?? null,
      teamId: teamId ?? req.user?.teamId ?? null,
      slaPolicyId: sla.slaPolicyId,
      firstResponseDueAt: sla.firstResponseDueAt,
      resolutionDueAt: sla.resolutionDueAt,
    },
    include: ticketInclude,
  })

  await prisma.auditLog.create({
    data: {
      userId: req.user!.id,
      action: 'ticket.created',
      entityType: 'Ticket',
      entityId: ticket.id,
      organizationId: req.user!.organizationId,
      meta: { number: ticket.number },
    },
  })

  if (assigneeId) {
    await notify(assigneeId, req.user!.organizationId, 'TICKET_ATRIBUIDO', 'Ticket atribuído', `#${ticket.number} ${ticket.subject}`)
  }
  if (teamId) {
    await notifyTeam(teamId, req.user!.organizationId, 'TICKET_ATRIBUIDO', 'Novo ticket na equipe', `#${ticket.number} ${ticket.subject}`)
  }

  enqueueRealtime('ticket:created', { ticket })

  res.status(201).json(ticket)
})

export const update = asyncHandler(async (req: Request, res: Response) => {
  const { subject, description, status, priority, category, assigneeId, teamId } = req.body ?? {}
  const data: Record<string, unknown> = {}

  if (subject !== undefined) data.subject = String(subject)
  if (description !== undefined) data.description = String(description)
  if (priority !== undefined) data.priority = priority
  if (category !== undefined) data.category = category
  if (assigneeId !== undefined) data.assigneeId = assigneeId || null
  if (teamId !== undefined) data.teamId = teamId || null

  if (status !== undefined) {
    data.status = status
    if (status === 'RESOLVIDO' || status === 'FECHADO') {
      data.resolvedAt = new Date()
    }
    if (status === 'ABERTO') {
      const current = await prisma.ticket.findFirst({
        where: { id: req.params.id, organizationId: req.user!.organizationId },
        select: { category: true },
      })
      const sla = await resolveSlaForTicket({ category: category ?? current?.category ?? null })
      data.firstResponseDueAt = sla.firstResponseDueAt
      data.resolutionDueAt = sla.resolutionDueAt
      data.firstResponseAt = null
      data.resolvedAt = null
    }
  }

  const ticket = await prisma.ticket.update({
    where: { id: req.params.id, organizationId: req.user!.organizationId },
    data,
    include: ticketInclude,
  })

  await prisma.auditLog.create({
    data: {
      userId: req.user!.id,
      action: 'ticket.updated',
      entityType: 'Ticket',
      entityId: ticket.id,
      organizationId: req.user!.organizationId,
      meta: { changes: Object.keys(data) },
    },
  })

  if (assigneeId) {
    await notify(assigneeId, req.user!.organizationId, 'TICKET_ATRIBUIDO', 'Ticket atribuído', `#${ticket.number} ${ticket.subject}`)
  }

  enqueueRealtime('ticket:updated', { ticket })

  res.json(ticket)
})

export const resolve = asyncHandler(async (req: Request, res: Response) => {
  const ticket = await prisma.ticket.update({
    where: { id: req.params.id, organizationId: req.user!.organizationId },
    data: { status: 'RESOLVIDO', resolvedAt: new Date() },
    include: ticketInclude,
  })

  await prisma.slaBreach.updateMany({ where: { ticketId: ticket.id, resolved: false }, data: { resolved: true } })
  enqueueRealtime('ticket:updated', { ticket })
  res.json(ticket)
})

export const reopen = asyncHandler(async (req: Request, res: Response) => {
  const current = await prisma.ticket.findFirst({
    where: { id: req.params.id, organizationId: req.user!.organizationId },
    select: { category: true },
  })
  if (!current) throw AppError.notFound('Ticket não encontrado')

  const sla = await resolveSlaForTicket({ category: current.category })
  const ticket = await prisma.ticket.update({
    where: { id: req.params.id, organizationId: req.user!.organizationId },
    data: {
      status: 'ABERTO',
      firstResponseAt: null,
      resolvedAt: null,
      firstResponseDueAt: sla.firstResponseDueAt,
      resolutionDueAt: sla.resolutionDueAt,
    },
    include: ticketInclude,
  })
  enqueueRealtime('ticket:updated', { ticket })
  res.json(ticket)
})
