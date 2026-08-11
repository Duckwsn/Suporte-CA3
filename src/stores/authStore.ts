import { create } from 'zustand'
import type { User } from '@/types'
import { storage } from '@/core/storage'
import { AuthService } from '@/services/AuthService'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role?: string) => Promise<void>
  logout: () => void
  hydrate: () => void
  refresh: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: storage.getUser<User>(),
  token: storage.getToken(),
  loading: false,

  login: async (email, password) => {
    set({ loading: true })
    try {
      const res = await AuthService.login(email, password)
      storage.setToken(res.token)
      storage.setUser(res.user)
      set({ token: res.token, user: res.user })
    } finally {
      set({ loading: false })
    }
  },

  register: async (name, email, password, role) => {
    set({ loading: true })
    try {
      const res = await AuthService.register(name, email, password, role)
      storage.setToken(res.token)
      storage.setUser(res.user)
      set({ token: res.token, user: res.user })
    } finally {
      set({ loading: false })
    }
  },

  logout: () => {
    storage.clear()
    set({ user: null, token: null })
  },

  hydrate: () => {
    set({ user: storage.getUser<User>(), token: storage.getToken() })
  },

  refresh: async () => {
    if (!get().token) return
    try {
      const user = await AuthService.me()
      storage.setUser(user)
      set({ user })
    } catch {
      get().logout()
    }
  },
}))
