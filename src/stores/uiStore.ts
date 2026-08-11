import { create } from 'zustand'

export interface ToastItem {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

interface UiState {
  sidebarOpen: boolean
  toasts: ToastItem[]
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  addToast: (type: ToastItem['type'], message: string) => void
  removeToast: (id: string) => void
}

let toastSeq = 0

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  toasts: [],

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  addToast: (type, message) => {
    const id = `toast-${++toastSeq}`
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, 4000)
  },

  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
