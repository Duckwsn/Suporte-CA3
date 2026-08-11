import { api } from '@/core/api/httpClient'
import type { AuthResponse, User } from '@/types'

export const AuthService = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),

  register: (name: string, email: string, password: string, role?: string) =>
    api.post<AuthResponse>('/auth/register', { name, email, password, role }),

  me: () => api.get<User>('/auth/me'),
}
