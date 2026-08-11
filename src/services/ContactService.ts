import { api } from '@/core/api/httpClient'
import type { Contact, Paginated } from '@/types'

export const ContactService = {
  list: (search = '', page = 1, limit = 20) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (search) params.set('search', search)
    return api.get<Paginated<Contact>>(`/contacts?${params}`)
  },

  detail: (id: string) => api.get<Contact>(`/contacts/${id}`),

  create: (data: Partial<Contact>) => api.post<Contact>('/contacts', data),

  update: (id: string, data: Partial<Contact>) => api.patch<Contact>(`/contacts/${id}`, data),
}
