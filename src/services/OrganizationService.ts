import { api } from '@/core/api/httpClient'
import type { Organization } from '@/types'

export const OrganizationService = {
  list: () => api.get<Organization[]>('/organizations'),

  detail: (id: string) => api.get<Organization>(`/organizations/${id}`),

  create: (data: { name: string; slug: string }) =>
    api.post<Organization>('/organizations', data),

  update: (id: string, data: { name?: string; slug?: string; isActive?: boolean }) =>
    api.put<Organization>(`/organizations/${id}`, data),

  remove: (id: string) => api.delete(`/organizations/${id}`),
}
