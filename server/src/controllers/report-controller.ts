import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { asyncHandler } from '../utils/asyncHandler'

export const kpis = asyncHandler(async (_req: Request, res: Response) => {
  const [ticketsOpen, conversationsActive, resolvedTickets, avgFirstResponse] =
    await Promise.all([
      prisma.ticket.count({ where: { status: { in: ['ABERTO', 'EM_ATENDIMENTO', 'AGUARDANDO_CLIENTE'] } } }),
      prisma.conversation.count({ where: { status: { in: ['AGUARDANDO_ATENDENTE', 'EM_ATENDIMENTO'] } } }),
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: { in: ['RESOLVIDO', 'FECHADO'] } } }),
      avgFirstResponseMinutes(),
    ])

  const slaResult = await prisma.$queryRaw<Array<{ total: bigint; breaches: bigint }>>`
    SELECT
      COUNT(*)::bigint AS total,
      COUNT(*) FILTER (WHERE EXISTS (
        SELECT 1 FROM "SlaBreach" sb
        WHERE sb."ticketId" = t.id
      ))::bigint AS breaches
    FROM "Ticket" t
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

async function avgFirstResponseMinutes(): Promise<number> {
  const result = await prisma.$queryRaw<Array<{ avg: number | null }>>`
    SELECT AVG(EXTRACT(EPOCH FROM ("firstResponseAt" - "openedAt")) / 60)::float AS avg
    FROM "Ticket"
    WHERE "firstResponseAt" IS NOT NULL
  `
  return Math.round(result[0]?.avg ?? 0)
}

export const volume = asyncHandler(async (req: Request, res: Response) => {
  const { from, to } = req.query
  const start = from ? new Date(String(from)) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const end = to ? new Date(String(to)) : new Date()

  const items = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
    SELECT date_trunc('day', "openedAt") AS date, COUNT(*)::bigint AS count
    FROM "Ticket"
    WHERE "openedAt" >= ${start} AND "openedAt" <= ${end}
    GROUP BY date
    ORDER BY date ASC
  `

  res.json(items.map((i) => ({ date: i.date.toISOString().slice(0, 10), count: Number(i.count) })))
})

export const exportCsv = asyncHandler(async (_req: Request, res: Response) => {
  const tickets = await prisma.ticket.findMany({
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
