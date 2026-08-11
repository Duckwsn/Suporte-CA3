import crypto from 'crypto'

export function isValidWebhookToken(token: string | undefined): boolean {
  const expected = process.env.WEBHOOK_TOKEN
  if (!expected) return false
  if (!token) return false
  const a = Buffer.from(token)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}
