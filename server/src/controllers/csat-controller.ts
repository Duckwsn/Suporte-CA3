import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { notify } from '../lib/notify'
import { AppError } from '../core/errors'
import { asyncHandler } from '../utils/asyncHandler'

export const submit = asyncHandler(async (req: Request, res: Response) => {
  const { rating, comment } = req.body ?? {}
  const numRating = Number(rating)
  if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
    throw AppError.badRequest('rating deve ser um inteiro entre 1 e 5')
  }

  const conversation = await prisma.conversation.findFirst({
    where: { id: req.params.id, organizationId: req.user!.organizationId },
    include: { contact: { select: { id: true } }, assignee: { select: { id: true } }, team: { select: { id: true } } },
  })
  if (!conversation) throw AppError.notFound('Conversa não encontrada')

  const existing = await prisma.csatRating.findUnique({ where: { conversationId: conversation.id } })
  if (existing) {
    const updated = await prisma.csatRating.update({
      where: { id: existing.id },
      data: { rating: numRating, comment: comment ?? null },
    })
    res.json(updated)
    return
  }

  const csat = await prisma.csatRating.create({
    data: {
      conversationId: conversation.id,
      organizationId: req.user!.organizationId,
      contactId: conversation.contact?.id ?? null,
      assigneeId: conversation.assignee?.id ?? null,
      teamId: conversation.team?.id ?? null,
      rating: numRating,
      comment: comment ?? null,
      channel: conversation.channel,
    },
  })

  if (conversation.assignee) {
    await notify(conversation.assignee.id, req.user!.organizationId, 'NOVA_MENSAGEM', 'Avaliação recebida', `CSAT ${numRating}/5 na conversa atendida`)
  }

  res.status(201).json(csat)
})

export const conversationRating = asyncHandler(async (req: Request, res: Response) => {
  const csat = await prisma.csatRating.findUnique({ where: { conversationId: req.params.id } })
  res.json(csat)
})

export const summary = asyncHandler(async (req: Request, res: Response) => {
  const { days = '30' } = req.query
  const since = new Date()
  since.setDate(since.getDate() - Math.max(Number(days) || 30, 1))

  const orgId = req.user!.organizationId
  const baseWhere = { organizationId: orgId, createdAt: { gte: since } }

  const [ratings, distribution, byAssignee, byTeam] = await Promise.all([
    prisma.csatRating.findMany({
      where: baseWhere,
      select: { rating: true },
    }),
    prisma.csatRating.groupBy({
      by: ['rating'],
      where: baseWhere,
      _count: { _all: true },
    }),
    prisma.csatRating.groupBy({
      by: ['assigneeId'],
      where: { ...baseWhere, assigneeId: { not: null } },
      _avg: { rating: true },
      _count: { _all: true },
    }),
    prisma.csatRating.groupBy({
      by: ['teamId'],
      where: { ...baseWhere, teamId: { not: null } },
      _avg: { rating: true },
      _count: { _all: true },
    }),
  ])

  const total = ratings.length
  const avg = total > 0 ? ratings.reduce((s, r) => s + r.rating, 0) / total : 0
  const promote = total > 0 ? ratings.filter((r) => r.rating >= 4).length / total : 0

  const assigneeIds = byAssignee.filter((b) => b.assigneeId).map((b) => b.assigneeId!)
  const teamIds = byTeam.filter((b) => b.teamId).map((b) => b.teamId!)
  const [agents, teams] = await Promise.all([
    prisma.user.findMany({ where: { id: { in: assigneeIds }, organizationId: orgId }, select: { id: true, name: true } }),
    prisma.team.findMany({ where: { id: { in: teamIds }, organizationId: orgId }, select: { id: true, name: true } }),
  ])

  res.json({
    total,
    average: Number(avg.toFixed(2)),
    promoterRate: Number((promote * 100).toFixed(1)),
    distribution: distribution.map((d) => ({ rating: d.rating, count: d._count._all })).sort((a, b) => b.rating - a.rating),
    byAssignee: byAssignee
      .filter((b) => b.assigneeId)
      .map((b) => {
        const agent = agents.find((a) => a.id === b.assigneeId)
        return {
          assigneeId: b.assigneeId,
          name: agent?.name ?? 'Atendente',
          average: Number((b._avg.rating ?? 0).toFixed(2)),
          count: b._count._all,
        }
      }),
    byTeam: byTeam
      .filter((b) => b.teamId)
      .map((b) => {
        const team = teams.find((t) => t.id === b.teamId)
        return {
          teamId: b.teamId,
          name: team?.name ?? 'Equipe',
          average: Number((b._avg.rating ?? 0).toFixed(2)),
          count: b._count._all,
        }
      }),
  })
})
