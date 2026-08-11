import { create } from 'zustand'
import type { Conversation, Message } from '@/types'
import { ConversationService } from '@/services/ConversationService'

interface ConversationState {
  conversations: Conversation[]
  active: Conversation | null
  messages: Message[]
  loading: boolean
  fetchList: () => Promise<void>
  open: (id: string) => Promise<void>
  send: (body: string) => Promise<void>
  pollMessages: () => Promise<void>
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  conversations: [],
  active: null,
  messages: [],
  loading: false,

  fetchList: async () => {
    set({ loading: true })
    try {
      const res = await ConversationService.list({ limit: 50 })
      set({ conversations: res.items })
    } finally {
      set({ loading: false })
    }
  },

  open: async (id) => {
    const conversation = await ConversationService.detail(id)
    set({ active: conversation, messages: conversation.messages ?? [] })
  },

  send: async (body) => {
    const active = get().active
    if (!active) return
    const message = await ConversationService.sendMessage(active.id, { senderType: 'AGENT', body })
    set((s) => ({ messages: [...s.messages, message] }))
    await get().pollMessages()
  },

  pollMessages: async () => {
    const active = get().active
    if (!active) return
    const messages = await ConversationService.messages(active.id)
    if (messages.length > 0) set({ messages })
  },
}))
