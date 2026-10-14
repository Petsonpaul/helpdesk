import type { NotificationPreferences } from '@/types/user'

/** Pure rule: should a new notification make a sound right now? Quiet hours silence non-urgent alerts. */
export function shouldPlaySound(prefs: NotificationPreferences | undefined | null, urgent: boolean, now: Date = new Date()): boolean {
  if (!prefs || !prefs.sound) return false
  const q = prefs.quiet_hours
  if (!q?.enabled || urgent) return true
  const toMin = (t: string) => { const [h, m] = (t || '').split(':').map(Number); return Number.isNaN(h) || Number.isNaN(m) ? null : h * 60 + m }
  const start = toMin(q.start), end = toMin(q.end)
  if (start === null || end === null || start === end) return true
  const cur = now.getHours() * 60 + now.getMinutes()
  const inQuiet = start < end ? cur >= start && cur < end : cur >= start || cur < end // handles overnight windows
  return !inQuiet
}

let ctx: AudioContext | null = null
let lastPlayed = 0
let armed = false

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  if (!ctx) ctx = new AC()
  return ctx
}

/** Browsers block sound until the person interacts with the page. Call this from a click/keypress to allow it. */
export async function unlockSound(): Promise<boolean> {
  const c = getCtx()
  if (!c) return false
  try { if (c.state === 'suspended') await c.resume() } catch { return false }
  return c.state === 'running'
}

/** Unlock audio on the first interaction anywhere on the page. */
export function armSoundUnlock() {
  if (armed || typeof window === 'undefined') return
  armed = true
  const once = () => { unlockSound(); window.removeEventListener('pointerdown', once); window.removeEventListener('keydown', once) }
  window.addEventListener('pointerdown', once)
  window.addEventListener('keydown', once)
}

/** A short two-note chime. Returns false (and stays silent) if the browser has not allowed audio yet. */
export function playChime(): boolean {
  const c = getCtx()
  if (!c || c.state !== 'running') return false
  const t = Date.now()
  if (t - lastPlayed < 2000) return false // two header copies can both ask; play once
  lastPlayed = t
  const start = c.currentTime
  ;[880, 1175].forEach((freq, i) => {
    const o = c.createOscillator(); const g = c.createGain()
    o.type = 'sine'; o.frequency.value = freq
    g.gain.setValueAtTime(0.0001, start + i * 0.16)
    g.gain.exponentialRampToValueAtTime(0.12, start + i * 0.16 + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, start + i * 0.16 + 0.28)
    o.connect(g); g.connect(c.destination); o.start(start + i * 0.16); o.stop(start + i * 0.16 + 0.3)
  })
  return true
}
