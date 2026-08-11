import prisma from './prisma'
import type { NotificationType } from '@prisma/client'

export async function notify(recipientId: string, type: NotificationType, title: string, body?: string) {
  return prisma.notification.create({
    data: { recipientId, type, title, body },
  })
}

export async function notifyTeam(teamId: string, type: NotificationType, title: string, body?: string) {
  const members = await prisma.user.findMany({
    where: { teamId, isActive: true },
    select: { id: true },
  })
  if (members.length === 0) return
  await prisma.notification.createMany({
    data: members.map((m) => ({ recipientId: m.id, type, title, body })),
  })
}

export async function notifyAllAgents(type: NotificationType, title: string, body?: string) {
  const agents = await prisma.user.findMany({
    where: { isActive: true, role: { in: ['AGENT', 'SUPERVISOR', 'ADMIN'] } },
    select: { id: true },
  })
  if (agents.length === 0) return
  await prisma.notification.createMany({
    data: agents.map((m) => ({ recipientId: m.id, type, title, body })),
  })
}
