import { create } from 'zustand'
import type { Ticket } from '@/types'
import { TicketService } from '@/services/TicketService'

interface TicketState {
  tickets: Ticket[]
  loading: boolean
  filters: Record<string, string>
  fetch: () => Promise<void>
  setFilter: (key: string, value: string) => void
}

export const useTicketStore = create<TicketState>((set, get) => ({
  tickets: [],
  loading: false,
  filters: {},

  fetch: async () => {
    set({ loading: true })
    try {
      const res = await TicketService.list(get().filters)
      set({ tickets: res.items })
    } finally {
      set({ loading: false })
    }
  },

  setFilter: (key, value) => {
    set((s) => ({ filters: { ...s.filters, [key]: value } }))
    void get().fetch()
  },
}))
