// The camera has two layers. The rail (cameraPath.js) decides where it stands
// and where it faces. This rig adds what the visitor does on top:
//  - a slight drift with the pointer everywhere,
//  - free looking-around where the journey opens it up (`freedom` = 1), such
//    as the King's Chamber,
//  - in scene 6, a free orbit around the plateau (`orbit`), held inside limits
//    so the visitor can never get lost, go underground or fly into space.
import * as THREE from 'three'
import { calm } from '../design/calm'
import { commands } from './commands'
import { GIZA, NEIGHBOURS } from '../design/tokens'

const UP = new THREE.Vector3(0, 1, 0)
const DEG = Math.PI / 180

export const rig = {
  yaw: 0, pitch: 0, // what the visitor has turned, in radians
  vYaw: 0, vPitch: 0, // turning speed, so a drag glides to a stop
  driftX: 0, driftY: 0, // pointer drift, eased
  pointerX: 0, pointerY: 0, // pointer position, -1 to 1
  freedom: 0,
  dragging: false,
  keys: 0,
}

// Where the orbit is centred at first: the middle of the three pyramids.
export const HOME = { target: [-200, 40, 200], radius: 1560, az: -80 * DEG, pol: 76.6 * DEG }
export const LIMITS = { rMin: 150, rMax: 2600, polMin: 0.22, polMax: 1.42, reach: 1500 }

export const orbit = {
  w: 0, // 1 = the visitor has the camera
  init: false,
  target: new THREE.Vector3(),
  az: 0, pol: 1, radius: 1500,
  vAz: 0, vPol: 0,
  goal: null, // { target, radius, az, pol } the camera is gliding towards
  keysAz: 0, keysPol: 0, keysZoom: 0,
}

function flyTo(view) {
  orbit.goal = { target: new THREE.Vector3(...view.target), radius: view.radius, az: view.az * DEG, pol: view.pol * DEG }
  orbit.vAz = orbit.vPol = 0
}
const orbitHome = () => flyTo({ target: HOME.target, radius: HOME.radius, az: HOME.az / DEG, pol: HOME.pol / DEG })
function orbitZoom(factor) {
  orbit.goal = { target: orbit.target.clone(), radius: orbit.radius * factor, az: orbit.az, pol: orbit.pol }
}

if (typeof window !== 'undefined') window.__orbit = orbit // handy for testing

// Markers are buttons too, but a drag may start on one: only a plain tap opens it.
const isControl = (el) => !el?.closest?.('.hot') && el?.closest?.('a, button, input, .sheet')

export function attachRig() {
  const pointers = new Map()
  let pinch = 0
  let travelled = 0
  let dragged = false
  const down = (e) => {
    if ((rig.freedom < 0.5 && orbit.w < 0.5) || isControl(e.target)) return
    if (pointers.size === 0) travelled = 0
    dragged = false
    pointers.set(e.pointerId, [e.clientX, e.clientY])
    rig.dragging = true
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()]
      pinch = Math.hypot(a[0] - b[0], a[1] - b[1])
    }
  }
  const move = (e) => {
    if (e.pointerType === 'mouse') {
      rig.pointerX = (e.clientX / window.innerWidth) * 2 - 1
      rig.pointerY = (e.clientY / window.innerHeight) * 2 - 1
    }
    const last = pointers.get(e.pointerId)
    if (!last) return
    const dx = e.clientX - last[0], dy = e.clientY - last[1]
    pointers.set(e.pointerId, [e.clientX, e.clientY])
    travelled += Math.abs(dx) + Math.abs(dy)
    if (travelled > 10) dragged = true

    if (orbit.w > 0.5) {
      if (pointers.size >= 2) {
        // Two fingers: pinch to zoom.
        const [a, b] = [...pointers.values()]
        const d = Math.hypot(a[0] - b[0], a[1] - b[1])
        if (pinch > 0 && d > 0) orbit.radius = THREE.MathUtils.clamp((orbit.radius * pinch) / d, LIMITS.rMin, LIMITS.rMax)
        pinch = d
        orbit.goal = null
      } else {
        const k = 0.0055
        orbit.goal = null
        orbit.az -= dx * k
        orbit.pol -= dy * k
        orbit.vAz = calm ? 0 : -dx * k * 60
        orbit.vPol = calm ? 0 : -dy * k * 60
      }
      return
    }
    // Looking around from a fixed spot. On a touch screen an up-down swipe
    // scrolls the journey, so only sideways movement turns the head.
    const k = 0.0042
    const sideways = dx * k
    const vertical = e.pointerType === 'mouse' ? dy * k : 0
    rig.yaw += sideways
    rig.pitch += vertical
    rig.vYaw = calm ? 0 : sideways * 60
    rig.vPitch = calm ? 0 : vertical * 60
  }
  const up = (e) => {
    pointers.delete(e.pointerId)
    if (pointers.size === 0) rig.dragging = false
    if (pointers.size < 2) pinch = 0
  }
  const key = (e) => {
    const on = e.type === 'keydown'
    if (e.target?.closest?.('input, textarea')) return // the slider keeps its own arrow keys
    if (orbit.w > 0.5) {
      let used = true
      if (e.key === 'ArrowLeft') orbit.keysAz = on ? -1 : 0
      else if (e.key === 'ArrowRight') orbit.keysAz = on ? 1 : 0
      else if (e.key === 'ArrowUp') orbit.keysPol = on ? -1 : 0
      else if (e.key === 'ArrowDown') orbit.keysPol = on ? 1 : 0
      else if (e.key === '+' || e.key === '=') orbit.keysZoom = on ? -1 : 0
      else if (e.key === '-' || e.key === '_') orbit.keysZoom = on ? 1 : 0
      else used = false
      if (used) {
        orbit.goal = null
        e.preventDefault()
      }
      return
    }
    if (e.key === 'ArrowLeft') rig.keys = on ? 1 : 0
    if (e.key === 'ArrowRight') rig.keys = on ? -1 : 0
  }
  // A drag that ends on a marker must not also open it.
  const click = (e) => {
    if (dragged && e.target.closest?.('.hot')) {
      e.stopPropagation()
      e.preventDefault()
    }
    dragged = false
  }
  window.addEventListener('click', click, true)
  window.addEventListener('pointerdown', down)
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', up)
  window.addEventListener('pointercancel', up)
  window.addEventListener('keydown', key)
  window.addEventListener('keyup', key)
  return () => {
    window.removeEventListener('click', click, true)
    window.removeEventListener('pointerdown', down)
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', up)
    window.removeEventListener('pointercancel', up)
    window.removeEventListener('keydown', key)
    window.removeEventListener('keyup', key)
  }
}

export function updateRig(dt, freedom) {
  rig.freedom = freedom
  if (freedom < 0.5) rig.dragging = rig.dragging && orbit.w > 0.5

  // Glide after a drag, and turn with the arrow keys.
  if (!rig.dragging) {
    rig.yaw += rig.vYaw * dt
    rig.pitch += rig.vPitch * dt
    const slow = Math.exp(-4 * dt)
    rig.vYaw *= slow
    rig.vPitch *= slow
    if (freedom > 0.5) rig.yaw += rig.keys * 1.1 * dt
  }

  // Looking up and down has soft limits; turning round is unlimited.
  const maxPitch = 0.95
  if (rig.pitch > maxPitch) rig.pitch += (maxPitch - rig.pitch) * Math.min(1, 12 * dt)
  if (rig.pitch < -maxPitch) rig.pitch += (-maxPitch - rig.pitch) * Math.min(1, 12 * dt)

  // When the journey moves on, the view eases back to the rail.
  if (freedom < 1) {
    rig.yaw = Math.atan2(Math.sin(rig.yaw), Math.cos(rig.yaw))
    const back = Math.exp(-3.5 * (1 - freedom) * dt)
    rig.yaw *= back
    rig.pitch *= back
  }

  const k = 1 - Math.exp(-2.5 * dt)
  rig.driftX += ((calm ? 0 : rig.pointerX) - rig.driftX) * k
  rig.driftY += ((calm ? 0 : rig.pointerY) - rig.driftY) * k
}

// Call after the rail has placed and aimed the camera.
export function applyRig(camera) {
  const drift = 0.022 * (1 - 0.7 * rig.freedom) * (1 - 0.8 * orbit.w)
  camera.rotateOnWorldAxis(UP, rig.yaw - rig.driftX * drift)
  camera.rotateX(rig.pitch - rig.driftY * drift * 0.6)
}

// ---------------------------------------------------------------- orbit ---

const _p = new THREE.Vector3()
const _o = new THREE.Vector3()
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a))

// The three pyramids as solid shapes the orbit camera must stay outside of.
const SOLIDS = [
  { x: 0, z: 0, half: GIZA.base / 2, height: GIZA.height, y: 0 },
  { x: NEIGHBOURS.khafre.x, z: NEIGHBOURS.khafre.z, half: NEIGHBOURS.khafre.base / 2, height: NEIGHBOURS.khafre.height, y: 0 },
  { x: NEIGHBOURS.menkaure.x, z: NEIGHBOURS.menkaure.z, half: NEIGHBOURS.menkaure.base / 2, height: NEIGHBOURS.menkaure.height, y: 0 },
]
const MARGIN = 22

function pushOut(p) {
  for (let i = 0; i < 80; i++) {
    let moved = false
    for (const s of SOLIDS) {
      const h = (s.half + MARGIN) * (1 - (p.y - s.y) / (s.height + MARGIN * 2))
      if (p.y > s.y - 6 && p.y < s.y + s.height + MARGIN * 2 && Math.abs(p.x - s.x) < h && Math.abs(p.z - s.z) < h) {
        _o.set(p.x - s.x, 0, p.z - s.z)
        if (_o.lengthSq() < 1) _o.set(0, 0, -1)
        p.addScaledVector(_o.normalize(), 10)
        moved = true
      }
    }
    if (!moved) return
  }
}

// Called every frame by the Director with the rail's pose in `pos` and `look`.
// `w` says how much of the camera is the visitor's. Blends and returns.
export function applyOrbit(dt, w, pos, look) {
  orbit.w = w
  // Requests from the buttons and markers; they only count while orbiting.
  for (const c of commands.queue.splice(0)) {
    if (w < 0.5) continue
    if (c.kind === 'fly') flyTo(c.view)
    else if (c.kind === 'home') orbitHome()
    else if (c.kind === 'zoom' && orbit.init) orbitZoom(c.factor)
  }
  if (w < 0.001) {
    orbit.init = false
    orbit.goal = null
    return
  }
  if (!orbit.init) {
    // Start exactly where the rail left the camera, so nothing jumps.
    orbit.target.set(...HOME.target)
    _p.copy(pos).sub(orbit.target)
    orbit.radius = _p.length()
    orbit.az = Math.atan2(_p.x, _p.z)
    orbit.pol = Math.acos(THREE.MathUtils.clamp(_p.y / orbit.radius, -1, 1))
    orbit.vAz = orbit.vPol = 0
    orbit.init = true
  }

  const free = w > 0.5
  if (free) {
    if (!rig.dragging) {
      orbit.az += orbit.vAz * dt
      orbit.pol += orbit.vPol * dt
      const slow = Math.exp(-3.2 * dt)
      orbit.vAz *= slow
      orbit.vPol *= slow
    }
    orbit.az += orbit.keysAz * 1.0 * dt
    orbit.pol += orbit.keysPol * 0.7 * dt
    orbit.radius *= Math.exp(orbit.keysZoom * 0.9 * dt)
  }

  // Glide towards a marker or the home view.
  if (orbit.goal) {
    const g = orbit.goal
    const k = 1 - Math.exp(-(calm ? 12 : 2.8) * dt)
    orbit.target.lerp(g.target, k)
    orbit.radius += (g.radius - orbit.radius) * k
    orbit.az += wrap(g.az - orbit.az) * k
    orbit.pol += (g.pol - orbit.pol) * k
    if (orbit.target.distanceTo(g.target) < 0.5 && Math.abs(g.radius - orbit.radius) < 0.5) orbit.goal = null
  }

  // Limits: not too near, not too far, never straight down or below the horizon,
  // and the middle of the view stays over the plateau.
  orbit.radius = THREE.MathUtils.clamp(orbit.radius, LIMITS.rMin, LIMITS.rMax)
  orbit.pol = THREE.MathUtils.clamp(orbit.pol, LIMITS.polMin, LIMITS.polMax)
  orbit.target.x = THREE.MathUtils.clamp(orbit.target.x, -LIMITS.reach, LIMITS.reach)
  orbit.target.z = THREE.MathUtils.clamp(orbit.target.z, -LIMITS.reach, LIMITS.reach)
  orbit.target.y = THREE.MathUtils.clamp(orbit.target.y, -60, 200)

  const sp = Math.sin(orbit.pol)
  _p.set(sp * Math.sin(orbit.az), Math.cos(orbit.pol), sp * Math.cos(orbit.az)).multiplyScalar(orbit.radius).add(orbit.target)
  pushOut(_p)
  pos.lerp(_p, w)
  look.lerp(orbit.target, w)
}
