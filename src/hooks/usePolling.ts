import { useEffect, useRef } from 'react'

export function usePolling(callback: () => void | Promise<void>, intervalMs = 5000) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    const id = setInterval(() => {
      void savedCallback.current()
    }, intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
}
