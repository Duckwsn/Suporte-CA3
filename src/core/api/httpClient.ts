export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

export interface ApiErrorBody {
  error?: { code?: string; message?: string }
}

export class ApiError extends Error {
  status: number
  code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

export function getToken(): string | null {
  return localStorage.getItem('suporte-ca3.token')
}

export function setToken(token: string) {
  localStorage.setItem('suporte-ca3.token', token)
}

export function clearToken() {
  localStorage.removeItem('suporte-ca3.token')
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    let body: ApiErrorBody = {}
    try {
      body = (await res.json()) as ApiErrorBody
    } catch {
      // corpo não-JSON
    }
    throw new ApiError(res.status, body.error?.code ?? 'INTERNAL', body.error?.message ?? 'Erro de requisição')
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
