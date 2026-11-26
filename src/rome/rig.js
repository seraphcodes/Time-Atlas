// Free exploration of Rome, made for fingers first:
//  one finger drags to orbit, two fingers pinch to zoom and slide to pan,
//  a tap on a building opens it, a double tap returns to the overview.
// Mouse: drag to orbit, right-drag or shift-drag to pan, wheel to zoom.
// Keyboard: arrows orbit, + and - zoom.
// The camera is held inside limits so the visitor can never get lost.
import * as THREE from 'three'
import { calm } from '../design/calm'
import { groundAt } from './world/terrain'
import { blocked, openSpot } from './world/obstacles'

const DEG = Math.PI / 180
export const HOME = { target: [180, 0, 260], radius: 1500, az: 235, pol: 62 }
const LIMITS = { rMin: 45, rMax: 4200, polMin: 0.12, polMax: 1.42, reach: 2600, centre: [200, 100] }

export const orbit = {
  w: 0,
  init: false,
  target: new THREE.Vector3(),
  az: 0, pol: 1, radius: 1500,
  vAz: 0, vPol: 0,
  goal: null,
  keysAz: 0, keysPol: 0, keysZoom: 0,
}

// Things the overlay wants to know about.
export const events = new EventTarget()

// While a card is open the picture slides away from it (see Director:
// the camera's view offset), so the building stays in sight.
export const framing = { x: 0, y: 0, wantX: 0, wantY: 0 }

// Street level: the eye stands on a line through a street (`pts`, world x/z)
// at `s` metres along it. Dragging looks around from where you stand,
// pinching, scrolling or the up/down keys walk along the line.
const EYE = 1.65
const AHEAD = 50 // the orbit target sits this far in front of the eye
const WALK_POL = [62 * DEG, 116 * DEG]
// `y`: a fixed eye height (in the seats of the Colosseum); `loop`: the line closes on itself
export const walk = { path: null, s: 0, off: 0, y: null, loop: false, eye: new THREE.Vector3(), want: new THREE.Vector3(), free: false, x: 0, z: 0, dest: null }
// Free walking (session 8): no line to follow. Pinch, scroll or the up/down
// keys walk the way you look; a tap on the ground walks there. Houses stop you,
// monuments do not. `walk.path` holds FREE so street-level rules still apply.
const FREE = { free: true }
const WALK_SPEED = 14 // m/s when gliding to a tapped spot (a brisk, filmic pace)
const isOpen = (x, z) => !blocked(x, z) && Math.hypot(x - LIMITS.centre[0], z - LIMITS.centre[1]) < LIMITS.reach
function stepBy(dx, dz) {
  // in small steps, sliding along a wall rather than stopping dead
  const n = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 0.8))
  let moved = false
  for (let i = 0; i < n; i++) {
    const nx = walk.x + dx / n, nz = walk.z + dz / n
    // standing inside something (the city changed round you): walk out freely
    if (isOpen(nx, nz) || !isOpen(walk.x, walk.z)) [walk.x, walk.z] = [nx, nz]
    else if (isOpen(nx, walk.z)) walk.x = nx
    else if (isOpen(walk.x, nz)) walk.z = nz
    else break
    moved = true
  }
  return moved
}
const walkEvent = () => events.dispatchEvent(new CustomEvent('walk', { detail: walk.free }))
// Step down to eye level where the view is centred, facing the same way.
export function walkHere() {
  const [x, z] = openSpot(orbit.target.x, orbit.target.z)
  walk.path = FREE
  walk.free = true
  walk.y = null
  walk.loop = false
  walk.off = 0
  walk.dest = null
  walk.x = x
  walk.z = z
  const az = orbit.az, pol = 88 * DEG
  const eye = new THREE.Vector3(x, groundAt(x, z) + EYE, z)
  orbit.goal = { target: eye.clone().addScaledVector(lookDir(az, pol), AHEAD), radius: AHEAD, az, pol }
  orbit.vAz = orbit.vPol = 0
  walkEvent()
}
// Rise from street level to a view over the same spot.
export function flyUp() {
  flyTo({ radius: 260, az: orbit.az / DEG, pol: 58 }, [walk.eye.x, groundAt(walk.eye.x, walk.eye.z), walk.eye.z])
}
function preparePath(pts) {
  const segs = []
  let len = 0
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1]
    const l = Math.hypot(bx - ax, bz - az)
    segs.push({ ax, az, dx: (bx - ax) / l, dz: (bz - az) / l, from: len, l })
    len += l
  }
  return { segs, len }
}
// A point on the line, `off` metres to its right-hand side (+z of the street).
function pathAt(path, s, off = 0) {
  const seg = path.segs.find((q) => s <= q.from + q.l) || path.segs[path.segs.length - 1]
  const t = Math.min(seg.l, Math.max(0, s - seg.from))
  return [seg.ax + seg.dx * t - seg.dz * off, seg.az + seg.dz * t + seg.dx * off, seg.dx, seg.dz]
}
const lookDir = (az, pol) => new THREE.Vector3(-Math.sin(pol) * Math.sin(az), -Math.cos(pol), -Math.sin(pol) * Math.cos(az))

export function flyTo(view, target) {
  const wasFree = walk.free
  walk.free = false
  walk.dest = null
  if (wasFree) walkEvent()
  if (view.walk) {
    walk.path = preparePath(view.walk.pts)
    walk.s = THREE.MathUtils.clamp(view.walk.s, 0, walk.path.len)
    walk.off = view.walk.off || 0
    walk.y = view.walk.y ?? null
    walk.loop = !!view.walk.loop
    const [x, z] = pathAt(walk.path, walk.s, walk.off)
    const eye = new THREE.Vector3(x, walk.y ?? groundAt(x, z) + EYE, z)
    const az = view.az * DEG, pol = view.pol * DEG
    orbit.goal = { target: eye.clone().addScaledVector(lookDir(az, pol), AHEAD), radius: AHEAD, az, pol }
    orbit.vAz = orbit.vPol = 0
    return
  }
  walk.path = null
  const t = new THREE.Vector3(...target)
  const radius = view.radius
  orbit.goal = {
    target: t,
    radius,
    az: view.az * DEG,
    pol: view.pol * DEG,
  }
  orbit.vAz = orbit.vPol = 0
}
export const flyHome = () => flyTo(HOME, HOME.target)

// The tap targets: invisible boxes round each building (see world/Picks.jsx).
export const picking = { objects: [], camera: null }
const raycaster = new THREE.Raycaster()
const ndc = new THREE.Vector2()
// Where a tap meets the ground, marching along the ray (the terrain is a height field).
function groundHit(clientX, clientY) {
  if (!picking.camera) return null
  ndc.set((clientX / window.innerWidth) * 2 - 1, -(clientY / window.innerHeight) * 2 + 1)
  raycaster.setFromCamera(ndc, picking.camera)
  const { origin, direction } = raycaster.ray
  if (direction.y > -0.005) return null
  for (let t = 0.5; t < 420; t += t < 60 ? 0.5 : 2) {
    const x = origin.x + direction.x * t, y = origin.y + direction.y * t, z = origin.z + direction.z * t
    if (y <= groundAt(x, z)) return [x, z]
  }
  return null
}
function pickAt(clientX, clientY) {
  if (!picking.camera || !picking.objects.length) return null
  ndc.set((clientX / window.innerWidth) * 2 - 1, -(clientY / window.innerHeight) * 2 + 1)
  raycaster.setFromCamera(ndc, picking.camera)
  const hit = raycaster.intersectObjects(picking.objects, false)[0]
  return hit ? hit.object.userData.place : null
}

const isControl = (el) => el?.closest?.('a, button, input, .sheet, .rome-dock')

export function attachRig(canvasless = window) {
  const pointers = new Map()
  let pinch = 0
  let centroid = null
  let travelled = 0
  let lastTap = 0
  let panMode = false

  const down = (e) => {
    if (orbit.w < 0.5 || isControl(e.target)) return
    if (pointers.size === 0) {
      travelled = 0
      panMode = e.button === 2 || e.shiftKey
    }
    pointers.set(e.pointerId, [e.clientX, e.clientY])
    orbit.goal = null
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()]
      pinch = Math.hypot(a[0] - b[0], a[1] - b[1])
      centroid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
    }
  }
  const pan = (dx, dy) => {
    const k = orbit.radius * 0.0016
    const s = Math.sin(orbit.az), c = Math.cos(orbit.az)
    // screen right = (cos az, 0, -sin az); screen up (on the ground) = (-sin az, 0, -cos az)
    orbit.target.x += (-dx * c - dy * s) * k
    orbit.target.z += (dx * s - dy * c) * k
  }
  const move = (e) => {
    const last = pointers.get(e.pointerId)
    if (!last) return
    const dx = e.clientX - last[0], dy = e.clientY - last[1]
    pointers.set(e.pointerId, [e.clientX, e.clientY])
    travelled += Math.abs(dx) + Math.abs(dy)
    if (pointers.size >= 2) {
      const [a, b] = [...pointers.values()]
      const d = Math.hypot(a[0] - b[0], a[1] - b[1])
      if (pinch > 0 && d > 0) orbit.radius = THREE.MathUtils.clamp((orbit.radius * pinch) / d, LIMITS.rMin, LIMITS.rMax)
      pinch = d
      const cc = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
      if (centroid) pan((cc[0] - centroid[0]) / 2, (cc[1] - centroid[1]) / 2)
      centroid = cc
      return
    }
    if (panMode) {
      pan(dx, dy)
      return
    }
    const k = walk.path ? -0.0034 : 0.0055
    orbit.az -= dx * k
    orbit.pol -= dy * k
    orbit.vAz = calm ? 0 : -dx * k * 60
    orbit.vPol = calm ? 0 : -dy * k * 60
  }
  const up = (e) => {
    const was = pointers.get(e.pointerId)
    pointers.delete(e.pointerId)
    if (pointers.size < 2) {
      pinch = 0
      centroid = null
    }
    if (!was || pointers.size > 0 || orbit.w < 0.5 || travelled > 10) return
    // A tap: a double tap goes home; a single tap may open a building.
    const now = performance.now()
    if (now - lastTap < 320) {
      lastTap = 0
      flyHome()
      events.dispatchEvent(new CustomEvent('home'))
      return
    }
    lastTap = now
    if (walk.free) {
      // walking: a tap on the ground walks there (the rings still open cards)
      const hit = groundHit(e.clientX, e.clientY)
      if (hit) walk.dest = openSpot(hit[0], hit[1])
      return
    }
    const place = pickAt(e.clientX, e.clientY)
    if (place) events.dispatchEvent(new CustomEvent('pick', { detail: place }))
  }
  const wheel = (e) => {
    if (orbit.w < 0.5 || isControl(e.target)) return
    e.preventDefault()
    orbit.goal = null
    orbit.radius = THREE.MathUtils.clamp(orbit.radius * Math.exp(e.deltaY * 0.0012), LIMITS.rMin, LIMITS.rMax)
  }
  const key = (e) => {
    if (orbit.w < 0.5 || e.target?.closest?.('input, textarea')) return
    const on = e.type === 'keydown' ? 1 : 0
    if (e.key === 'ArrowLeft') orbit.keysAz = -on
    else if (e.key === 'ArrowRight') orbit.keysAz = on
    else if (e.key === 'ArrowUp') orbit.keysPol = -on
    else if (e.key === 'ArrowDown') orbit.keysPol = on
    else if (e.key === '+' || e.key === '=') orbit.keysZoom = -on
    else if (e.key === '-' || e.key === '_') orbit.keysZoom = on
    else return
    orbit.goal = null
    e.preventDefault()
  }
  const noMenu = (e) => orbit.w > 0.5 && !isControl(e.target) && e.preventDefault()
  const t = canvasless
  t.addEventListener('pointerdown', down)
  t.addEventListener('pointermove', move)
  t.addEventListener('pointerup', up)
  t.addEventListener('pointercancel', up)
  t.addEventListener('wheel', wheel, { passive: false })
  t.addEventListener('keydown', key)
  t.addEventListener('keyup', key)
  t.addEventListener('contextmenu', noMenu)
  return () => {
    t.removeEventListener('pointerdown', down)
    t.removeEventListener('pointermove', move)
    t.removeEventListener('pointerup', up)
    t.removeEventListener('pointercancel', up)
    t.removeEventListener('wheel', wheel)
    t.removeEventListener('keydown', key)
    t.removeEventListener('keyup', key)
    t.removeEventListener('contextmenu', noMenu)
  }
}

const off = new THREE.Vector3()
// Blend the rail camera (pos, look) into the orbit by weight w.
export function applyOrbit(dt, w, pos, look) {
  orbit.w = w
  if (w <= 0.001) {
    orbit.init = false
    return
  }
  if (!orbit.init) {
    orbit.init = true
    orbit.target.copy(look)
    off.copy(pos).sub(look)
    orbit.radius = off.length()
    orbit.az = Math.atan2(off.x, off.z)
    orbit.pol = Math.acos(THREE.MathUtils.clamp(off.y / orbit.radius, -1, 1))
    orbit.vAz = orbit.vPol = 0
  }
  // keys and gliding (at street level, up and down walk instead of tilting)
  const walking = walk.path && !orbit.goal
  orbit.az += orbit.keysAz * dt * (walk.path ? -0.9 : 1.1)
  if (!walking) orbit.pol += orbit.keysPol * dt * 0.8
  orbit.radius *= Math.exp(orbit.keysZoom * dt * 1.2)
  orbit.az += orbit.vAz * dt
  orbit.pol += orbit.vPol * dt
  const damp = Math.exp(-4 * dt)
  orbit.vAz *= damp
  orbit.vPol *= damp
  if (orbit.goal) {
    const g = orbit.goal
    const k = 1 - Math.exp(-(calm ? 12 : 2.6) * dt)
    let dAz = g.az - orbit.az
    dAz = Math.atan2(Math.sin(dAz), Math.cos(dAz))
    orbit.az += dAz * k
    orbit.pol += (g.pol - orbit.pol) * k
    orbit.radius += (g.radius - orbit.radius) * k
    orbit.target.lerp(g.target, k)
    if (Math.abs(dAz) < 0.002 && Math.abs(g.radius - orbit.radius) < 0.5 && orbit.target.distanceTo(g.target) < 0.5) orbit.goal = null
  }
  // limits
  if (walk.path) orbit.pol = THREE.MathUtils.clamp(orbit.pol, WALK_POL[0], WALK_POL[1])
  else orbit.pol = THREE.MathUtils.clamp(orbit.pol, LIMITS.polMin, LIMITS.polMax)
  orbit.radius = THREE.MathUtils.clamp(orbit.radius, LIMITS.rMin, LIMITS.rMax)
  const dx = orbit.target.x - LIMITS.centre[0], dz = orbit.target.z - LIMITS.centre[1]
  const d = Math.hypot(dx, dz)
  if (d > LIMITS.reach) {
    orbit.target.x = LIMITS.centre[0] + (dx / d) * LIMITS.reach
    orbit.target.z = LIMITS.centre[1] + (dz / d) * LIMITS.reach
  }
  if (walking && walk.free) {
    // zooming in walks the way you look, zooming out walks back
    const look = lookDir(orbit.az, orbit.pol)
    const hl = Math.hypot(look.x, look.z) || 1
    const step = (AHEAD - orbit.radius) * 0.7 - orbit.keysPol * dt * 7
    if (step) {
      walk.dest = null
      stepBy((look.x / hl) * step, (look.z / hl) * step)
    } else if (walk.dest) {
      const dx = walk.dest[0] - walk.x, dz = walk.dest[1] - walk.z, dl = Math.hypot(dx, dz)
      const v = Math.min(dl, dt * WALK_SPEED * Math.min(1, dl / 6 + 0.25))
      if (dl < 0.3 || !stepBy((dx / dl) * v, (dz / dl) * v)) walk.dest = null
    }
    orbit.radius = AHEAD
    walk.want.set(walk.x, groundAt(walk.x, walk.z) + EYE, walk.z)
    walk.eye.lerp(walk.want, 1 - Math.exp(-8 * dt))
    orbit.target.copy(walk.eye).addScaledVector(look, AHEAD)
  } else if (walking) {
    // zooming in walks forward along the street, zooming out walks back
    const look = lookDir(orbit.az, orbit.pol)
    const [, , dx, dz] = pathAt(walk.path, walk.s)
    const along = look.x * dx + look.z * dz
    const dir = Math.abs(along) > 0.2 ? Math.sign(along) : 0
    walk.s += ((AHEAD - orbit.radius) * 0.7 - orbit.keysPol * dt * 7) * dir
    if (walk.loop) walk.s = ((walk.s % walk.path.len) + walk.path.len) % walk.path.len
    else walk.s = THREE.MathUtils.clamp(walk.s, 0, walk.path.len)
    orbit.radius = AHEAD
    const [x, z] = pathAt(walk.path, walk.s, walk.off)
    walk.want.set(x, walk.y ?? groundAt(x, z) + EYE, z)
    walk.eye.lerp(walk.want, 1 - Math.exp(-6 * dt))
    orbit.target.copy(walk.eye).addScaledVector(look, AHEAD)
  } else if (!orbit.goal) orbit.target.y += (groundAt(orbit.target.x, orbit.target.z) + 4 - orbit.target.y) * (1 - Math.exp(-3 * dt))

  const sp = Math.sin(orbit.pol)
  const ox = orbit.target.x + orbit.radius * sp * Math.sin(orbit.az)
  const oy = orbit.target.y + orbit.radius * Math.cos(orbit.pol)
  const oz = orbit.target.z + orbit.radius * sp * Math.cos(orbit.az)
  if (walk.path && orbit.goal) walk.eye.set(ox, oy, oz)
  pos.set(THREE.MathUtils.lerp(pos.x, ox, w), THREE.MathUtils.lerp(pos.y, oy, w), THREE.MathUtils.lerp(pos.z, oz, w))
  look.lerp(orbit.target, w)
}

if (typeof window !== 'undefined') {
  window.__orbit = orbit
  window.__walk = walk
}
