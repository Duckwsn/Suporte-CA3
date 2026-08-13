import type { NotificationType } from '@prisma/client'
import { enqueueNotification } from '../queue'

export function notify(recipientId: string, organizationId: string, type: NotificationType, title: string, body?: string) {
  return enqueueNotification({ kind: 'notify', recipientId, organizationId, type, title, body })
}

export function notifyTeam(teamId: string, organizationId: string, type: NotificationType, title: string, body?: string) {
  return enqueueNotification({ kind: 'notifyTeam', teamId, organizationId, type, title, body })
}

export function notifyAllAgents(organizationId: string, type: NotificationType, title: string, body?: string) {
  return enqueueNotification({ kind: 'notifyAllAgents', organizationId, type, title, body })
}
