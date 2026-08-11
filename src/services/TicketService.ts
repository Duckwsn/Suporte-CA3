import { api } from '@/core/api/httpClient'
import type { Paginated, Ticket } from '@/types'

export interface TicketFilters {
  status?: string
  priority?: string
  category?: string
  assigneeId?: string
  teamId?: string
  contactId?: string
  search?: string
  page?: number
  limit?: number
}

export const TicketService = {
  list: (filters: TicketFilters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, String(v))
    })
    const qs = params.toString()
    return api.get<Paginated<Ticket>>(`/tickets${qs ? `?${qs}` : ''}`)
  },

  detail: (id: string) => api.get<Ticket>(`/tickets/${id}`),

  create: (data: Partial<Ticket>) => api.post<Ticket>('/tickets', data),

  update: (id: string, data: Partial<Ticket>) => api.patch<Ticket>(`/tickets/${id}`, data),

  resolve: (id: string) => api.post<Ticket>(`/tickets/${id}/resolve`),

  reopen: (id: string) => api.post<Ticket>(`/tickets/${id}/reopen`),
}
