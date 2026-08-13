import { describe, it, expect } from 'vitest'
import { BUSINESS_HOURS_START, BUSINESS_HOURS_END, WEEKEND_DAYS } from '../lib/sla'

describe('SLA Constants', () => {
  it('business hours start at 08:00', () => {
    expect(BUSINESS_HOURS_START).toBe(8)
  })

  it('business hours end at 18:00', () => {
    expect(BUSINESS_HOURS_END).toBe(18)
  })

  it('weekend days are Sunday (0) and Saturday (6)', () => {
    expect(WEEKEND_DAYS).toContain(0)
    expect(WEEKEND_DAYS).toContain(6)
    expect(WEEKEND_DAYS).toHaveLength(2)
  })
})

describe('Wall clock minutes', () => {
  function addWallClockMinutes(from: Date, minutes: number): Date {
    return new Date(from.getTime() + minutes * 60 * 1000)
  }

  it('adds minutes correctly', () => {
    const base = new Date(2026, 7, 13, 10, 0, 0) // Aug 13 2026 10:00 local
    const result = addWallClockMinutes(base, 60)
    expect(result.getHours()).toBe(11)
    expect(result.getMinutes()).toBe(0)
  })

  it('handles day boundary', () => {
    const base = new Date(2026, 7, 13, 23, 0, 0) // Aug 13 2026 23:00 local
    const result = addWallClockMinutes(base, 120)
    expect(result.getDate()).toBe(14)
    expect(result.getHours()).toBe(1)
  })

  it('handles zero minutes', () => {
    const base = new Date(2026, 7, 13, 10, 0, 0)
    const result = addWallClockMinutes(base, 0)
    expect(result.getTime()).toBe(base.getTime())
  })
})
