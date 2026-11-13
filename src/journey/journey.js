// The journey: one number (t) that says where the visitor is.
// Scene 1 runs from t = 0 to 1, scene 2 from 1 to 2, and so on.
// Everything that changes over the journey is a "track" keyed to t.
import { MOTION, RAMP_START_TOP as START_TOP } from '../design/tokens'
import { calm } from '../design/calm'
import { giza } from '../content/giza'

export const SCENE_COUNT = 6
// The scroll bar covers t = 0 to T_END. Scene 6 (free exploration) starts at 5
// and needs only a short stretch: once the orbit camera is on, dragging steers.
export const T_END = 5.5

// A track is a list of [t, value] keys with smooth easing between them.
export function track(keys) {
  return (t) => {
    if (t <= keys[0][0]) return keys[0][1]
    const last = keys[keys.length - 1]
    if (t >= last[0]) return last[1]
    for (let i = 0; i < keys.length - 1; i++) {
      const [t0, v0] = keys[i]
      const [t1, v1] = keys[i + 1]
      if (t <= t1) {
        let f = (t - t0) / (t1 - t0)
        f = f * f * (3 - 2 * f)
        return v0 + (v1 - v0) * f
      }
    }
    return last[1]
  }
}

const tracks = {
  sunEl: track([[0, 5], [1, 11], [2, 15], [3, 21]]), // sun height in degrees
  day: track([[0, 0], [1.2, 0.45], [3, 1]]), // dawn colours → golden morning
  fog: track([[0, 0.00021], [1, 0.00015], [3, 0.00011]]),
  mist: track([[0, 1], [0.8, 0.55], [1.3, 0.15], [2, 0.05]]),
  dust: track([[0, 0], [0.9, 0.15], [1.3, 1], [2.0, 1], [2.35, 0.1]]),
  fov: track([
    [0, 46], [0.8, 40], [1, 32], [1.3, 40], [1.5, 46], [2, 46], [2.3, 40], [3, 38],
    [3.26, 34], [3.4, 50], [3.47, 62], [3.62, 62], [3.7, 58], [3.8, 64], [3.96, 64], [4.1, 44], [4.34, 40], [5, 38], [5.5, 38],
  ]),
  near: track([[3.3, 1], [3.4, 0.12], [4.0, 0.12], [4.08, 1]]), // the lens can come close to stone indoors
  shadow: track([[0, 1300], [1.3, 1300], [1.56, 150], [1.9, 170], [2.15, 1300], [3, 1100], [4.1, 1100], [4.3, 1500]]),
  // The time-lapse: scene 3 compresses the remaining years of building.
  build: track([[2.05, START_TOP], [2.6, 146.6]]),
  casing: track([[2.05, START_TOP - 7], [2.62, 139], [2.74, 146.6]]),
  rampRemove: track([[2.5, 150], [2.84, 0]]), // the ramp is taken down from the top
  crew: track([[2.0, 1], [2.14, 0]]),
  complete: track([[2.42, 0], [2.8, 1]]),
  builtYear: track([[2.02, -2570], [2.84, -2560]]),

  // Scene 4. `cut` is the cutaway: everything east of this line (in metres
  // from the centre) is removed. 7.2 m is the plane the passages lie in.
  cut: track([[3.04, 118], [3.25, 7.2], [3.4, 7.2], [3.44, 9.5], [3.47, 118], [3.93, 118], [3.95, 9.5], [3.985, 7.2], [4.1, 7.2], [4.2, 118]]),
  inside: track([[3.4, 0], [3.47, 1], [3.95, 1], [3.985, 0]]), // 1 = sealed in, in the dark
  lamp: track([[3.38, 0], [3.46, 1], [3.7, 1], [3.79, 0.1], [3.95, 0.1], [3.99, 0]]), // the lamp you carry
  look: track([[3.74, 0], [3.8, 1], [3.91, 1], [3.95, 0]]), // 1 = the visitor may look around freely

  // Scene 5. `era` runs from 0 (the finished pyramid, 2560 BC) to 1 (today).
  // At the end of the scene the visitor takes this value over (the slider).
  era: track([[4.24, 0], [4.42, 0.2], [4.66, 0.8], [4.9, 1]]),

  // Scene 6: the visitor takes the camera. 1 = free orbit around the plateau.
  orbit: track([[5.05, 0], [5.35, 1]]),
}

export const SLIDER_FROM = 4.9 // from here to the end the Then/Now slider is offered

const ss = (a, b, x) => {
  const f = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return f * f * (3 - 2 * f)
}
const eraYear = track([[0, -2560], [0.12, -2490], [0.45, -300], [0.76, 1250], [0.86, 1400], [0.93, 1850], [1, 2026]])

// Everything that changes with the centuries is derived from `era` alone, so
// the same moment in history always looks the same.
export function setEra(v, era) {
  v.khafre = 143.5 * ss(0.02, 0.1, era) // the next two pyramids rise
  v.menkaure = 65.5 * ss(0.075, 0.14, era)
  v.ruin = ss(0.3, 0.56, era) // temple, wall and causeway are quarried away
  v.env = 1 - ss(0.32, 0.5, era) // the old valley: palms, villages, boats
  v.silt = ss(0.3, 0.55, era) // the harbour and its canal fill in
  v.riverShift = 1400 * ss(0.5, 0.86, era) // the river wanders east (the real distance is far greater)
  v.strip = ss(0.76, 0.9, era) // the casing is carried off to build Cairo
  v.coreTop = 146.6 - 8.1 * ss(0.8, 0.93, era)
  v.now = ss(0.62, 1, era) // weathering, and today's paler sky
  v.city = ss(0.93, 1, era) // Cairo reaches the plateau only in the last century and a half
  v.warp = calm ? 0 : Math.pow(Math.sin(Math.PI * era), 0.6) // how fast time is passing
  // The sun wheels round the sky three times and stops just past noon, south
  // of the plateau, so today is lit differently from the morning of 2560 BC.
  v.sunAz = calm ? 0 : 1176 * era
  v.sunLift = 14 * era + (calm ? 0 : 9 * Math.sin(3 * Math.PI * era) ** 2)
}

export const journey = {
  // The Then/Now slider. While `manualEra` is a number (0 = 2560 BC, 1 = today)
  // the visitor, not the scroll position, decides the date.
  manualEra: null,
  hot: [], // screen position of every hotspot, written each frame by the camera
  manualBlend: 0,
  manualShown: 1,
  target: 0, // where the scroll bar is, 0 to 1
  p: 0, // where the camera is, 0 to 1 (follows target smoothly)
  t: 0, // p in scene units
  v: {}, // current value of every track
  view: { scene: 0, year: -2570, hero: true, caption: -1, explore: false, slider: false, orbit: false },
  debugT: null,
}

const listeners = new Set()
export const subscribe = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
export const getView = () => journey.view

// The Then/Now slider's value. Components subscribe so the slider, the
// hotspots and the journey always agree on the date.
const eraListeners = new Set()
export const subscribeEra = (fn) => {
  eraListeners.add(fn)
  return () => eraListeners.delete(fn)
}
export const getEraTarget = () => journey.manualEra ?? 1
export function setEraTarget(value) {
  journey.manualEra = value
  eraListeners.forEach((fn) => fn())
}

export function advance(dt) {
  const k = 1 - Math.exp(-(calm ? 14 : MOTION.scrollDamp) * dt)
  journey.p += (journey.target - journey.p) * k
  journey.t = journey.debugT ?? journey.p * T_END
  const t = journey.t
  for (const key in tracks) journey.v[key] = tracks[key](t)
  const v = journey.v
  v.rampTop = Math.min(v.build, v.rampRemove)

  // The slider takes over the date smoothly and hands it back the same way.
  const manual = journey.manualEra !== null && t > SLIDER_FROM
  if (!manual && journey.manualEra !== null) setEraTarget(null)
  const ease = 1 - Math.exp(-5 * dt)
  journey.manualBlend += ((manual ? 1 : 0) - journey.manualBlend) * ease
  if (manual) journey.manualShown += (journey.manualEra - journey.manualShown) * ease
  if (journey.manualBlend < 0.001) journey.manualShown = v.era
  v.era += (journey.manualShown - v.era) * journey.manualBlend
  setEra(v, v.era)
  v.year = v.era > 0.002 ? eraYear(v.era) : v.builtYear

  // What the HTML overlay needs to know. React re-renders only when this changes.
  const scene = Math.min(SCENE_COUNT - 1, Math.floor(t))
  const hero = t < 0.2
  let caption = -1
  for (let i = 0; i < giza.captions.length; i++) {
    const [from, to] = giza.captions[i].at
    if (t > from && t < to) caption = i
  }
  // The year ticks in tens once the centuries start to fly.
  const step = v.era > 0.002 && v.era < 0.998 ? 10 : 1
  const year = Math.round(v.year / step) * step
  const explore = v.look > 0.5
  const slider = t > SLIDER_FROM
  const orbit = v.orbit > 0.5
  const view = journey.view
  if (view.scene !== scene || view.year !== year || view.hero !== hero || view.caption !== caption || view.explore !== explore || view.slider !== slider || view.orbit !== orbit) {
    journey.view = { scene, year, hero, caption, explore, slider, orbit }
    listeners.forEach((fn) => fn())
  }
}

advance(0)

// For testing: open the page with ?t=1.5 to jump straight to a moment.
if (typeof window !== 'undefined') {
  const q = new URLSearchParams(window.location.search).get('t')
  if (q !== null && !Number.isNaN(parseFloat(q))) journey.debugT = parseFloat(q)
  window.__journey = journey
}
