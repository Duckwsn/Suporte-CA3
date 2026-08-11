import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'

export function useAuth() {
  const { user, token, login, register, logout, hydrate, refresh, loading } = useAuthStore()

  useEffect(() => {
    hydrate()
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { user, token, login, register, logout, loading }
}

export function useRequireAuth() {
  const { user, token } = useAuthStore()
  return { user, isAuthenticated: Boolean(token && user) }
}
