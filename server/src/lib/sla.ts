import prisma from './prisma'

export const BUSINESS_HOURS_START = 8 // 08:00
export const BUSINESS_HOURS_END = 18 // 18:00
export const WEEKEND_DAYS = [0, 6] // domingo, sábado

export interface SlaResult {
  slaPolicyId: string | null
  firstResponseDueAt: Date | null
  resolutionDueAt: Date | null
}

function addBusinessMinutes(from: Date, minutes: number): Date {
  let remaining = minutes
  let cursor = new Date(from)
  let hours = cursor.getHours()
  let minutesOfDay = cursor.getMinutes()

  while (remaining > 0) {
    const day = cursor.getDay()
    if (WEEKEND_DAYS.includes(day)) {
      cursor.setDate(cursor.getDate() + 1)
      cursor.setHours(BUSINESS_HOURS_START, 0, 0, 0)
      hours = cursor.getHours()
      minutesOfDay = cursor.getMinutes()
      continue
    }

    const startOfDay = BUSINESS_HOURS_START * 60
    const endOfDay = BUSINESS_HOURS_END * 60
    const current = hours * 60 + minutesOfDay

    if (current < startOfDay) {
      cursor.setHours(BUSINESS_HOURS_START, 0, 0, 0)
      hours = cursor.getHours()
      minutesOfDay = cursor.getMinutes()
      continue
    }

    if (current >= endOfDay) {
      cursor.setDate(cursor.getDate() + 1)
      cursor.setHours(BUSINESS_HOURS_START, 0, 0, 0)
      hours = cursor.getHours()
      minutesOfDay = cursor.getMinutes()
      continue
    }

    const available = endOfDay - current
    if (remaining <= available) {
      cursor.setMinutes(minutesOfDay + remaining)
      remaining = 0
    } else {
      remaining -= available
      cursor.setDate(cursor.getDate() + 1)
      cursor.setHours(BUSINESS_HOURS_START, 0, 0, 0)
      hours = cursor.getHours()
      minutesOfDay = cursor.getMinutes()
    }
  }

  return cursor
}

function addWallClockMinutes(from: Date, minutes: number): Date {
  return new Date(from.getTime() + minutes * 60 * 1000)
}

export async function resolveSlaForTicket(input: {
  category?: string | null
  organizationId?: string
  from?: Date
}): Promise<SlaResult> {
  const where: Record<string, unknown> = {
    isActive: true,
    OR: [{ category: input.category ?? null }, { category: null }],
  }
  if (input.organizationId) where.organizationId = input.organizationId

  const policy = await prisma.slaPolicy.findFirst({
    where,
    orderBy: { category: 'asc' },
  })

  if (!policy) {
    return { slaPolicyId: null, firstResponseDueAt: null, resolutionDueAt: null }
  }

  const from = input.from ?? new Date()
  const calc = policy.businessHoursOnly ? addBusinessMinutes : addWallClockMinutes

  return {
    slaPolicyId: policy.id,
    firstResponseDueAt: calc(from, policy.responseTimeMinutes),
    resolutionDueAt: calc(from, policy.resolutionTimeMinutes),
  }
}

export async function detectSlaBreaches(now = new Date()) {
  const tickets = await prisma.ticket.findMany({
    where: {
      status: { in: ['ABERTO', 'EM_ATENDIMENTO', 'AGUARDANDO_CLIENTE'] },
    },
    select: { id: true, firstResponseDueAt: true, resolutionDueAt: true, firstResponseAt: true, resolvedAt: true },
  })

  for (const ticket of tickets) {
    if (
      ticket.firstResponseDueAt &&
      !ticket.firstResponseAt &&
      ticket.firstResponseDueAt <= now
    ) {
      await createBreachIfMissing(ticket.id, 'PRIMEIRA_RESPOSTA', ticket.firstResponseDueAt)
    }
    if (ticket.resolutionDueAt && !ticket.resolvedAt && ticket.resolutionDueAt <= now) {
      await createBreachIfMissing(ticket.id, 'RESOLUCAO', ticket.resolutionDueAt)
    }
  }

  return tickets.length
}

async function createBreachIfMissing(
  ticketId: string,
  type: 'PRIMEIRA_RESPOSTA' | 'RESOLUCAO',
  dueAt: Date,
) {
  const existing = await prisma.slaBreach.findFirst({
    where: { ticketId, type, resolved: false },
  })
  if (!existing) {
    await prisma.slaBreach.create({ data: { ticketId, type, dueAt } })
  }
}
