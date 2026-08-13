import { describe, it, expect } from 'vitest'
import { signToken, verifyToken, type TokenPayload } from './token'

describe('Token utilities', () => {
  const payload: TokenPayload = { userId: 'test-user-id', role: 'AGENT', organizationId: 'test-org-id' }

  it('signs and verifies a token', () => {
    const token = signToken(payload)
    expect(typeof token).toBe('string')
    expect(token.length).toBeGreaterThan(0)

    const verified = verifyToken(token)
    expect(verified.userId).toBe(payload.userId)
    expect(verified.role).toBe(payload.role)
  })

  it('rejects invalid tokens', () => {
    expect(() => verifyToken('invalid-token')).toThrow()
  })

  it('rejects tampered tokens', () => {
    const token = signToken(payload)
    const tampered = token.slice(0, -5) + 'XXXXX'
    expect(() => verifyToken(tampered)).toThrow()
  })
})
