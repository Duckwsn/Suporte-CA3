import { api } from '@/core/api/httpClient'
import type { AnalyticsBreakdown, CsatRating, CsatSummary, Notification, Paginated, ReportKpis, VolumePoint } from '@/types'

export const NotificationService = {
  list: (unread = false) =>
    api.get<Paginated<Notification>>(`/notifications${unread ? '?unread=true' : ''}`),

  markRead: (id: string) => api.patch<Notification>(`/notifications/${id}/read`),

  markAllRead: () => api.patch<void>('/notifications/read-all'),
}

export const ReportService = {
  kpis: () => api.get<ReportKpis>('/reports/kpis'),

  volume: (from?: string, to?: string) => {
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    const qs = params.toString()
    return api.get<VolumePoint[]>(`/reports/volume${qs ? `?${qs}` : ''}`)
  },

  analytics: (from?: string, to?: string) => {
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    const qs = params.toString()
    return api.get<AnalyticsBreakdown>(`/reports/analytics${qs ? `?${qs}` : ''}`)
  },

  exportCsv: (type: 'tickets' | 'conversations' | 'csat' = 'tickets', from?: string, to?: string) => {
    const params = new URLSearchParams({ type })
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    return api.getBlob(`/reports/export?${params.toString()}`)
  },

  csatSummary: (days = 30) => api.get<CsatSummary>(`/csat/summary?days=${days}`),
}

export const CsatService = {
  submit: (conversationId: string, data: { rating: number; comment?: string }) =>
    api.post<CsatRating>(`/csat/conversations/${conversationId}`, data),
}
