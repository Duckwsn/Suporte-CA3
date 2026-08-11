const AUTH_TOKEN_KEY = 'suporte-ca3.token'
const AUTH_USER_KEY = 'suporte-ca3.user'

export const storage = {
  getToken: () => localStorage.getItem(AUTH_TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(AUTH_TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(AUTH_TOKEN_KEY),

  getUser: <T>() => {
    const raw = localStorage.getItem(AUTH_USER_KEY)
    return raw ? (JSON.parse(raw) as T) : null
  },
  setUser: <T>(user: T) => localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user)),
  clearUser: () => localStorage.removeItem(AUTH_USER_KEY),

  clear: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
  },
}
