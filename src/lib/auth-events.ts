type Listener = () => void
const expired = new Set<Listener>()
const recheck = new Set<Listener>()

const subscribe = (set: Set<Listener>, cb: Listener) => { set.add(cb); return () => { set.delete(cb) } }
const fire = (set: Set<Listener>) => { [...set].forEach((cb) => cb()) }

/** The API said "you are not signed in" on a normal (non-login) request. */
export const onSessionExpired = (cb: Listener) => subscribe(expired, cb)
export const emitSessionExpired = () => fire(expired)

/** The API said the page/CSRF token is stale; the app should re-check /me to learn whether the session is still valid. */
export const onSessionRecheck = (cb: Listener) => subscribe(recheck, cb)
export const emitSessionRecheck = () => fire(recheck)
