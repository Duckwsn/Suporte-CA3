import { api } from '@/core/api/httpClient'
import type { Conversation, Message, Paginated } from '@/types'

export interface ConversationFilters {
  status?: string
  channel?: string
  assigneeId?: string
  contactId?: string
  page?: number
  limit?: number
}

export const ConversationService = {
  list: (filters: ConversationFilters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, String(v))
    })
    const qs = params.toString()
    return api.get<Paginated<Conversation>>(`/conversations${qs ? `?${qs}` : ''}`)
  },

  detail: (id: string) => api.get<Conversation>(`/conversations/${id}`),

  create: (data: { channel: string; contactId: string; title?: string }) =>
    api.post<Conversation>('/conversations', data),

  assign: (id: string, assigneeId: string) =>
    api.patch<Conversation>(`/conversations/${id}/assign`, { assigneeId }),

  changeStatus: (id: string, status: string) =>
    api.patch<Conversation>(`/conversations/${id}/status`, { status }),

  messages: (id: string, since?: string) =>
    api.get<Message[]>(`/conversations/${id}/messages${since ? `?since=${encodeURIComponent(since)}` : ''}`),

  sendMessage: (id: string, data: { senderType: string; body: string; mediaUrl?: string }) =>
    api.post<Message>(`/conversations/${id}/messages`, data),
}
