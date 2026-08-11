import crypto from 'crypto'

export function isValidWebhookToken(token: string | undefined): boolean {
  const expected = process.env.WEBHOOK_TOKEN
  if (!expected) return false
  if (!token) return false
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))
}
