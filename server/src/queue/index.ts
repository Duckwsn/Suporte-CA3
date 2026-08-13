import { Queue, Worker, type ConnectionOptions } from 'bullmq'
import prisma from '../lib/prisma'
import { emitToUser, emitToAgents } from '../lib/realtime'
import type { NotificationType } from '@prisma/client'

function getRedisConnection(): ConnectionOptions {
  const url = process.env.REDIS_URL
  if (url) {
    const parsed = new URL(url)
    return { host: parsed.hostname, port: Number(parsed.port) || 6379, maxRetriesPerRequest: null }
  }
  return { host: 'localhost', port: 6379, maxRetriesPerRequest: null }
}

const connection = getRedisConnection()

export interface NotificationJob {
  kind: 'notify' | 'notifyTeam' | 'notifyAllAgents'
  recipientId?: string
  teamId?: string
  organizationId: string
  type: NotificationType
  title: string
  body?: string
}

export interface MessageDeliveryJob {
  kind: 'whatsapp-outbound'
  messageId: string
  conversationId: string
}

export interface RealtimeJob {
  kind: 'conversation:new' | 'conversation:updated' | 'conversation:message' | 'ticket:created' | 'ticket:updated'
  payload: unknown
}

const queueOptions = { connection }

export const notificationQueue = new Queue<NotificationJob>('suporte-ca3-notifications', queueOptions)
export const deliveryQueue = new Queue<MessageDeliveryJob>('suporte-ca3-deliveries', queueOptions)
export const realtimeQueue = new Queue<RealtimeJob>('suporte-ca3-realtime', queueOptions)

let workersStarted = false
const workers: Worker[] = []

export function startQueueWorkers() {
  if (workersStarted) return
  workersStarted = true

  workers.push(
    new Worker<NotificationJob>(
      'suporte-ca3-notifications',
      async (job) => {
        const { kind, recipientId, teamId, organizationId, type, title, body } = job.data
        const created = new Date().toISOString()
        if (kind === 'notify' && recipientId) {
          await prisma.notification.create({ data: { recipientId, organizationId, type, title, body } })
          emitToUser(recipientId, 'notification:new', { recipientId, type, title, body, readAt: null, createdAt: created })
        }
        if (kind === 'notifyTeam' && teamId) {
          const members: Array<{ id: string }> = await prisma.user.findMany({
            where: { teamId, organizationId, isActive: true },
            select: { id: true },
          })
          await prisma.notification.createMany({ data: members.map((m) => ({ recipientId: m.id, organizationId, type, title, body })) })
          members.forEach((m: { id: string }) =>
            emitToUser(m.id, 'notification:new', { recipientId: m.id, type, title, body, readAt: null, createdAt: created }),
          )
        }
        if (kind === 'notifyAllAgents') {
          const agents: Array<{ id: string }> = await prisma.user.findMany({
            where: { isActive: true, organizationId, role: { in: ['AGENT', 'SUPERVISOR', 'ADMIN'] } },
            select: { id: true },
          })
          await prisma.notification.createMany({ data: agents.map((m) => ({ recipientId: m.id, organizationId, type, title, body })) })
          agents.forEach((m: { id: string }) =>
            emitToUser(m.id, 'notification:new', { recipientId: m.id, type, title, body, readAt: null, createdAt: created }),
          )
        }
      },
      { connection },
    ),
  )

  workers.push(
    new Worker<MessageDeliveryJob>(
      'suporte-ca3-deliveries',
      async (job) => {
        const { messageId, kind } = job.data
        await prisma.message.update({
          where: { id: messageId },
          data: { status: 'ENTREGUE', deliveredAt: new Date() },
        })
        console.log(`[queue] mensagem ${messageId} entregue via ${kind}`)
      },
      { connection },
    ),
  )

  workers.push(
    new Worker<RealtimeJob>(
      'suporte-ca3-realtime',
      async (job) => {
        const { kind, payload } = job.data
        if (kind.startsWith('conversation:') || kind.startsWith('ticket:')) emitToAgents(kind, payload)
      },
      { connection },
    ),
  )
}

export async function stopQueueWorkers() {
  await Promise.all(workers.map((w) => w.close()))
  workers.length = 0
  workersStarted = false
  console.log('[queue] workers encerrados')
}

export function enqueueNotification(job: NotificationJob) {
  return notificationQueue.add(job.kind, job)
}

export function enqueueDelivery(job: MessageDeliveryJob) {
  return deliveryQueue.add(job.kind, job)
}

export function enqueueRealtime(kind: RealtimeJob['kind'], payload: unknown) {
  return realtimeQueue.add(kind, { kind, payload })
}
