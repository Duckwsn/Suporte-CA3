import { api } from '@/core/api/httpClient'
import type { SlaPolicy, User, Paginated } from '@/types'

export const SlaService = {
  listPolicies: () => api.get<SlaPolicy[]>('/sla/policies'),

  createPolicy: (data: Partial<SlaPolicy>) => api.post<SlaPolicy>('/sla/policies', data),

  updatePolicy: (id: string, data: Partial<SlaPolicy>) => api.patch<SlaPolicy>(`/sla/policies/${id}`, data),
}

export const UserService = {
  list: (search = '', page = 1, limit = 20) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (search) params.set('search', search)
    return api.get<Paginated<User>>(`/users?${params}`)
  },

  create: (data: { name: string; email: string; password: string; role?: string; teamId?: string }) =>
    api.post<User>('/users', data),

  update: (id: string, data: Partial<User>) => api.patch<User>(`/users/${id}`, data),

  deactivate: (id: string) => api.delete<User>(`/users/${id}`),
}
