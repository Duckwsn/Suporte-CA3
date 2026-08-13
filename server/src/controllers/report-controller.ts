import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { asyncHandler } from '../utils/asyncHandler'

export const kpis = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.user!.organizationId
  const [ticketsOpen, conversationsActive, resolvedTickets, avgFirstResponse] =
    await Promise.all([
      prisma.ticket.count({ where: { organizationId: orgId, status: { in: ['ABERTO', 'EM_ATENDIMENTO', 'AGUARDANDO_CLIENTE'] } } }),
      prisma.conversation.count({ where: { organizationId: orgId, status: { in: ['AGUARDANDO_ATENDENTE', 'EM_ATENDIMENTO'] } } }),
      prisma.ticket.count({ where: { organizationId: orgId } }),
      prisma.ticket.count({ where: { organizationId: orgId, status: { in: ['RESOLVIDO', 'FECHADO'] } } }),
      avgFirstResponseMinutes(orgId),
    ])

  const slaResult = await prisma.$queryRaw<Array<{ total: bigint; breaches: bigint }>>`
    SELECT
      COUNT(*)::bigint AS total,
      COUNT(*) FILTER (WHERE EXISTS (
        SELECT 1 FROM "SlaBreach" sb
        WHERE sb."ticketId" = t.id
      ))::bigint AS breaches
    FROM "Ticket" t
    WHERE t."organizationId" = ${orgId}
  `
  const total = Number(slaResult[0]?.total ?? 0)
  const breaches = Number(slaResult[0]?.breaches ?? 0)

  res.json({
    ticketsOpen,
    conversationsActive,
    slaCompliance: total > 0 ? Math.round(((total - breaches) / total) * 100) : 100,
    avgFirstResponseMinutes: avgFirstResponse,
    resolvedTickets,
  })
})

async function avgFirstResponseMinutes(orgId: string): Promise<number> {
  const result = await prisma.$queryRaw<Array<{ avg: number | null }>>`
    SELECT AVG(EXTRACT(EPOCH FROM ("firstResponseAt" - "openedAt")) / 60)::float AS avg
    FROM "Ticket"
    WHERE "firstResponseAt" IS NOT NULL AND "organizationId" = ${orgId}
  `
  return Math.round(result[0]?.avg ?? 0)
}

export const volume = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.user!.organizationId
  const { from, to } = req.query
  const start = from ? new Date(String(from)) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const end = to ? new Date(String(to)) : new Date()

  const items = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
    SELECT date_trunc('day', "openedAt") AS date, COUNT(*)::bigint AS count
    FROM "Ticket"
    WHERE "openedAt" >= ${start} AND "openedAt" <= ${end} AND "organizationId" = ${orgId}
    GROUP BY date
    ORDER BY date ASC
  `

  res.json(items.map((i) => ({ date: i.date.toISOString().slice(0, 10), count: Number(i.count) })))
})

export const analytics = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.user!.organizationId
  const { from, to } = req.query
  const start = from ? new Date(String(from)) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const end = to ? new Date(String(to)) : new Date()

  const ticketWhere = { organizationId: orgId, openedAt: { gte: start, lte: end } }

  const [byStatus, byPriority, byCategory, byTeam, byChannel] = await Promise.all([
    prisma.ticket.groupBy({ by: ['status'], where: ticketWhere, _count: { _all: true } }),
    prisma.ticket.groupBy({ by: ['priority'], where: ticketWhere, _count: { _all: true } }),
    prisma.ticket.groupBy({ by: ['category'], where: ticketWhere, _count: { _all: true } }),
    prisma.ticket.groupBy({ by: ['teamId'], where: { ...ticketWhere, teamId: { not: null } }, _count: { _all: true } }),
    prisma.conversation.groupBy({ by: ['channel'], where: { organizationId: orgId, createdAt: { gte: start, lte: end } }, _count: { _all: true } }),
  ])

  const teamIds = byTeam.filter((t) => t.teamId).map((t) => t.teamId!)
  const teams = teamIds.length > 0
    ? await prisma.team.findMany({ where: { id: { in: teamIds }, organizationId: orgId }, select: { id: true, name: true } })
    : []

  res.json({
    byStatus: byStatus.map((s) => ({ key: s.status, count: s._count._all })),
    byPriority: byPriority.map((p) => ({ key: p.priority, count: p._count._all })),
    byCategory: byCategory.map((c) => ({ key: c.category ?? 'Sem categoria', count: c._count._all })),
    byTeam: byTeam
      .filter((t) => t.teamId)
      .map((t) => ({ key: teams.find((tm) => tm.id === t.teamId)?.name ?? 'Equipe', count: t._count._all })),
    byChannel: byChannel.map((c) => ({ key: c.channel, count: c._count._all })),
  })
})

export const exportCsv = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.user!.organizationId
  const { type = 'tickets', from, to } = req.query
  const start = from ? new Date(String(from)) : undefined
  const end = to ? new Date(String(to)) : undefined

  if (type === 'conversations') {
    const conversations = await prisma.conversation.findMany({
      where: {
        organizationId: orgId,
        ...(start || end
          ? {
              createdAt: {
                ...(start ? { gte: start } : {}),
                ...(end ? { lte: end } : {}),
              },
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 5000,
      include: {
        contact: { select: { name: true, email: true, phone: true } },
        assignee: { select: { name: true } },
        _count: { select: { messages: true } },
      },
    })

    const header = 'id;channel;status;title;contact;contactEmail;contactPhone;assignee;messages;startedAt;lastMessageAt;resolvedAt\n'
    const rows = conversations
      .map((c) =>
        [
          c.id,
          c.channel,
          c.status,
          csv(c.title ?? ''),
          csv(c.contact?.name ?? ''),
          csv(c.contact?.email ?? ''),
          csv(c.contact?.phone ?? ''),
          csv(c.assignee?.name ?? ''),
          c._count.messages,
          c.startedAt.toISOString(),
          c.lastMessageAt ? c.lastMessageAt.toISOString() : '',
          c.resolvedAt ? c.resolvedAt.toISOString() : '',
        ].join(';'),
      )
      .join('\n')

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="conversations.csv"')
    res.send(header + rows)
    return
  }

  if (type === 'csat') {
    const ratings = await prisma.csatRating.findMany({
      where: {
        organizationId: orgId,
        ...(start || end
          ? {
              createdAt: {
                ...(start ? { gte: start } : {}),
                ...(end ? { lte: end } : {}),
              },
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 5000,
      include: {
        contact: { select: { name: true } },
        assignee: { select: { name: true } },
        team: { select: { name: true } },
      },
    })

    const header = 'conversationId;rating;comment;channel;contact;assignee;team;createdAt\n'
    const rows = ratings
      .map((r) =>
        [
          r.conversationId,
          r.rating,
          csv(r.comment ?? ''),
          r.channel,
          csv(r.contact?.name ?? ''),
          csv(r.assignee?.name ?? ''),
          csv(r.team?.name ?? ''),
          r.createdAt.toISOString(),
        ].join(';'),
      )
      .join('\n')

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="csat.csv"')
    res.send(header + rows)
    return
  }

  const tickets = await prisma.ticket.findMany({
    where: {
      organizationId: orgId,
      ...(start || end
        ? {
            openedAt: {
              ...(start ? { gte: start } : {}),
              ...(end ? { lte: end } : {}),
            },
          }
        : {}),
    },
    orderBy: { openedAt: 'desc' },
    include: { contact: { select: { name: true } }, assignee: { select: { name: true } } },
    take: 5000,
  })

  const header = 'number;subject;status;priority;category;contact;assignee;openedAt;resolvedAt\n'
  const rows = tickets
    .map((t) =>
      [
        t.number,
        csv(t.subject),
        t.status,
        t.priority,
        csv(t.category ?? ''),
        csv(t.contact?.name ?? ''),
        csv(t.assignee?.name ?? ''),
        t.openedAt.toISOString(),
        t.resolvedAt ? t.resolvedAt.toISOString() : '',
      ].join(';'),
    )
    .join('\n')

  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', 'attachment; filename="tickets.csv"')
  res.send(header + rows)
})

function csv(value: string): string {
  return value.replace(/"/g, '""')
}
