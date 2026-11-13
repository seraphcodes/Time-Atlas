// Works out where each marker is on the screen, every frame. The HTML markers
// in ui/Overlay.jsx just follow these numbers.
import * as THREE from 'three'
import { GIZA } from '../design/tokens'
import { HOTSPOTS } from '../content/hotspots'

const p = new THREE.Vector3()
const half = GIZA.base / 2

// Is the straight line from the camera to the marker blocked by the pyramid?
// Only matters while the pyramid is closed; once it is cut open you can see in.
function blocked(camera, pos, height) {
  for (let i = 1; i < 22; i++) {
    const f = i / 22
    const x = camera.position.x + (pos.x - camera.position.x) * f
    const y = camera.position.y + (pos.y - camera.position.y) * f
    const z = camera.position.z + (pos.z - camera.position.z) * f
    if (y < 0 || y > height) continue
    const h = half * (1 - y / GIZA.height) * 0.985
    if (Math.abs(x) < h && Math.abs(z) < h) return true
  }
  return false
}

export function projectHotspots(camera, size, t, v, journey) {
  const orbiting = v.orbit > 0.5
  const open = v.cut < half // the pyramid is cut open
  const height = Math.min(v.build, v.coreTop, GIZA.height)
  HOTSPOTS.forEach((h, i) => {
    const slot = journey.hot[i] || (journey.hot[i] = { x: 0, y: 0, on: false })
    const wanted = orbiting ? h.explore : v.orbit < 0.05 && t > h.t[0] && t < h.t[1]
    slot.wanted = wanted
    if (!wanted) {
      slot.on = false
      return
    }
    p.set(...h.pos)
    const off = p.clone().sub(camera.position)
    const ahead = off.dot(camera.getWorldDirection(new THREE.Vector3())) > 1
    p.project(camera)
    const inside = Math.abs(p.x) < 0.96 && Math.abs(p.y) < 0.92
    // Markers on the far side of the closed pyramid are hidden.
    const hidden = !open && v.inside < 0.5 && blocked(camera, new THREE.Vector3(...h.pos), height)
    slot.on = ahead && inside && !hidden
    slot.x = (p.x * 0.5 + 0.5) * size.width
    slot.y = (-p.y * 0.5 + 0.5) * size.height
  })
}
