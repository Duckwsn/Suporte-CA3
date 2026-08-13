import { useEffect, useRef } from 'react'
import { connectSocket, disconnectSocket } from '@/core/socket'
import { useAuthStore } from '@/stores/authStore'

export function useRealtimeSocket() {
  const token = useAuthStore((s) => s.token)

  useEffect(() => {
    if (!token) return
    const socket = connectSocket(token)
    return () => {
      disconnectSocket()
      socket.disconnect()
    }
  }, [token])

  return useAuthStore((s) => s.token)
}

export function useSocketEvent(event: string, handler: (payload: unknown) => void) {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    const socket = connectSocket()
    socket.on(event, (payload: unknown) => handlerRef.current(payload))
    return () => {
      socket.off(event)
    }
  }, [event])
}