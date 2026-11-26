// Small switches the visitor can flip from a card: spread the Colosseum's
// awning, look beneath the arena floor.
// ?today opens on Rome as it is now
const TODAY = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('today')
let state = { velarium: false, beneath: false, seating: false, hunt: false, fight: false, now: TODAY }
// the morning hunt and the afternoon gladiators never share the sand
const APART = { hunt: 'fight', fight: 'hunt' }
const listeners = new Set()
export const getState = () => state
export const subscribeState = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
export function toggle(key) {
  state = { ...state, [key]: !state[key] }
  if (state[key] && APART[key]) state[APART[key]] = false
  if (typeof window !== 'undefined') window.__romeState = state
  listeners.forEach((fn) => fn())
}
if (typeof window !== 'undefined') window.__romeState = state
