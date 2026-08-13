import { io, type Socket } from 'socket.io-client'
import { API_URL } from '@/core/api/httpClient'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:4000'

let socket: Socket | null = null
let currentToken: string | null = null

export function getSocket(token?: string | null): Socket {
  if (socket && currentToken === token) return socket
  currentToken = token ?? null
  if (socket) socket.disconnect()

  socket = io(SOCKET_URL, {
    autoConnect: false,
    auth: token ? { token } : undefined,
    transports: ['polling', 'websocket'],
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  })
  return socket
}

export function connectSocket(token?: string | null) {
  const s = getSocket(token ?? currentToken)
  if (!s.connected) s.connect()
  return s
}

export function disconnectSocket() {
  socket?.disconnect()
  currentToken = null
}

export function socketBaseUrl(): string {
  return API_URL.replace(/\/api$/, '')
}