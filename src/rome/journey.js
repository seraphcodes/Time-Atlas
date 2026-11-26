// The Rome journey: one number (t) says where the visitor is.
// 0–1 high above the city, 1–2 over the Tiber to the Capitol, 2–3 descending
// past the Capitol, 3–3.4 above the Forum. From 3.4 the visitor takes the
// camera (free exploration).
import * as THREE from 'three'
import { calm } from '../design/calm'
import { rome } from './content/rome'

export const T_END = 3.6
export const ORBIT_FROM = 3.35
export const SCREENS_PER_SCENE = 2.4

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

// The camera rail: positions and look-at points, smoothed with a spline.
const KEYS = [
  [0.0, [-2350, 760, -2350], [250, 0, 200]],
  [0.6, [-2050, 640, -1700], [200, 0, 180]],
  [1.1, [-1750, 560, -1000], [0, 20, 120]],
  [1.6, [-1200, 300, -180], [-250, 40, 90]],
  [2.1, [-720, 190, 160], [-180, 40, 40]],
  [2.6, [-400, 125, 70], [120, 10, 80]],
  [3.05, [-150, 88, -30], [560, 18, 250]],
  [3.6, [-120, 110, -60], [420, 10, 220]],
]
const posCurve = new THREE.CatmullRomCurve3(KEYS.map((k) => new THREE.Vector3(...k[1])), false, 'centripetal')
const lookCurve = new THREE.CatmullRomCurve3(KEYS.map((k) => new THREE.Vector3(...k[2])), false, 'centripetal')
// t → curve parameter, so the spline passes each key at its time.
const toU = track(KEYS.map((k, i) => [k[0], i / (KEYS.length - 1)]))
export function cameraAt(t, pos, look) {
  const u = toU(t)
  posCurve.getPoint(u, pos)
  lookCurve.getPoint(u, look)
}

const tracks = {
  sunEl: track([[0, 15], [1.5, 22], [3.4, 30]]), // degrees
  day: track([[0, 0], [1.2, 0.5], [3, 1]]),
  fog: track([[0, 0.000052], [1.2, 0.00006], [3, 0.000068]]),
  fov: track([[0, 42], [1.1, 44], [2.6, 48], [3.05, 46], [3.6, 46]]),
  orbit: track([[ORBIT_FROM, 0], [T_END, 1]]),
}

export const journey = {
  hot: [],
  target: 0,
  p: 0,
  t: 0,
  v: {},
  view: { scene: 0, hero: true, caption: -1, orbit: false },
  debugT: null,
}

const listeners = new Set()
export const subscribe = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
export const getView = () => journey.view

export function advance(dt) {
  const k = 1 - Math.exp(-(calm ? 14 : 3.0) * dt)
  journey.p += (journey.target - journey.p) * k
  journey.t = journey.debugT ?? journey.p * T_END
  const t = journey.t
  for (const key in tracks) journey.v[key] = tracks[key](t)

  const scene = Math.min(3, Math.floor(t))
  const hero = t < 0.3
  let caption = -1
  rome.captions.forEach((c, i) => {
    if (t > c.at[0] && t < c.at[1]) caption = i
  })
  const orbit = journey.v.orbit > 0.5
  const view = journey.view
  if (view.scene !== scene || view.hero !== hero || view.caption !== caption || view.orbit !== orbit) {
    journey.view = { scene, hero, caption, orbit }
    listeners.forEach((fn) => fn())
  }
}

advance(0)

if (typeof window !== 'undefined') {
  const q = new URLSearchParams(window.location.search).get('t')
  if (q !== null && !Number.isNaN(parseFloat(q))) journey.debugT = parseFloat(q)
  window.__journey = journey
}
