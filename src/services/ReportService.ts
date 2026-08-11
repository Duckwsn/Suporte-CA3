import { api } from '@/core/api/httpClient'
import type { Notification, Paginated, ReportKpis, VolumePoint } from '@/types'

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

  exportCsv: () => api.getBlob('/reports/export'),
}
