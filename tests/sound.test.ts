import { describe, expect, it } from 'vitest'
import { shouldPlaySound } from '@/lib/sound'
import type { NotificationPreferences } from '@/types/user'

const prefs = (over: Partial<NotificationPreferences> = {}, q: Partial<NotificationPreferences['quiet_hours']> = {}): NotificationPreferences => ({
  in_app: true, email: false, sound: true, categories: [], quiet_hours: { enabled: false, start: '22:00', end: '07:00', ...q }, ...over,
})
const at = (h: number, m = 0) => new Date(2026, 9, 12, h, m)

describe('shouldPlaySound', () => {
  it('is silent when sound is off or preferences are unknown', () => {
    expect(shouldPlaySound(prefs({ sound: false }), true, at(12))).toBe(false)
    expect(shouldPlaySound(undefined, true, at(12))).toBe(false)
  })
  it('plays when sound is on and quiet hours are off', () => {
    expect(shouldPlaySound(prefs(), false, at(3))).toBe(true)
  })
  it('respects an overnight quiet window for non-urgent alerts only', () => {
    const p = prefs({}, { enabled: true })
    expect(shouldPlaySound(p, false, at(23))).toBe(false)
    expect(shouldPlaySound(p, false, at(6, 30))).toBe(false)
    expect(shouldPlaySound(p, false, at(12))).toBe(true)
    expect(shouldPlaySound(p, true, at(23))).toBe(true) // urgent breaks through
  })
  it('handles a same-day window', () => {
    const p = prefs({}, { enabled: true, start: '13:00', end: '14:00' })
    expect(shouldPlaySound(p, false, at(13, 30))).toBe(false)
    expect(shouldPlaySound(p, false, at(14))).toBe(true)
  })
})
