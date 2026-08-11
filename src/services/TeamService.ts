import { api } from '@/core/api/httpClient'
import type { Team } from '@/types'

export const TeamService = {
  list: () => api.get<Team[]>('/teams'),

  detail: (id: string) => api.get<Team>(`/teams/${id}`),

  create: (data: { name: string; description?: string; supervisorId?: string }) =>
    api.post<Team>('/teams', data),

  update: (id: string, data: Partial<Team>) => api.patch<Team>(`/teams/${id}`, data),

  addMember: (id: string, userId: string) => api.post<Team>(`/teams/${id}/members`, { userId }),

  removeMember: (id: string, userId: string) => api.delete<Team>(`/teams/${id}/members/${userId}`),
}
