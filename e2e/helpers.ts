import { APIRequestContext, expect } from '@playwright/test'

const API_URL = process.env.E2E_API_URL ?? 'http://localhost:4000/api'

export interface AuthSession {
  token: string
  user: { id: string; name: string; email: string; role: string }
}

export async function loginViaApi(
  ctx: APIRequestContext,
  email: string,
  password: string,
): Promise<AuthSession> {
  const res = await ctx.post(`${API_URL}/auth/login`, { data: { email, password } })
  expect(res.ok()).toBeTruthy()
  return (await res.json()) as AuthSession
}

export async function createContact(
  ctx: APIRequestContext,
  token: string,
  data: { name: string; email?: string; phone?: string },
) {
  const res = await ctx.post(`${API_URL}/contacts`, {
    headers: { Authorization: `Bearer ${token}` },
    data,
  })
  expect(res.ok()).toBeTruthy()
  return (await res.json()) as { id: string; name: string }
}

export async function createConversation(
  ctx: APIRequestContext,
  token: string,
  data: { channel?: string; contactId: string; title?: string },
) {
  const res = await ctx.post(`${API_URL}/conversations`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { channel: 'WEB', ...data },
  })
  expect(res.ok()).toBeTruthy()
  return (await res.json()) as { id: string; status: string }
}

export async function sendMessage(
  ctx: APIRequestContext,
  token: string,
  conversationId: string,
  data: { senderType: string; body: string },
) {
  const res = await ctx.post(`${API_URL}/conversations/${conversationId}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
    data,
  })
  expect(res.ok()).toBeTruthy()
  return (await res.json()) as { id: string; body: string }
}

export async function createTicket(
  ctx: APIRequestContext,
  token: string,
  data: {
    subject: string
    description: string
    priority?: string
    category?: string
    conversationId?: string
    contactId?: string
  },
) {
  const res = await ctx.post(`${API_URL}/tickets`, {
    headers: { Authorization: `Bearer ${token}` },
    data,
  })
  expect(res.ok()).toBeTruthy()
  return (await res.json()) as { id: string; number: number; subject: string }
}

export function randomEmail(prefix = 'e2e'): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}@ca3.test`
}
