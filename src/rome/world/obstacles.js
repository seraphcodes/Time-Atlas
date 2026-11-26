// What a walker cannot pass through (session 8): the houses of the city
// fabric, as rotated rectangles in a 24 m grid, and the river. Monuments are
// not included: in free walking you can pass through them (disclosed in the
// walk note).
import { riverDist, RIVER_HALF } from './terrain'
import { CLEARINGS, STREET, streetLocal } from './layout'

const CELL = 24
let grid = new Map()
let walkThroughStreet = false // today the Subura's houses are gone
export const setStreetOpen = (open) => (walkThroughStreet = open)
const key = (i, j) => i * 100003 + j

// walls: [x, y, z, w, h, d, rot, hex] as in Fabric.jsx
export function setObstacles(walls) {
  grid = new Map()
  for (const [x, , z, w, , d, rot] of walls) {
    const r = Math.hypot(w, d) / 2 + 0.6
    const box = { x, z, hw: w / 2 + 0.8, hd: d / 2 + 0.8, c: Math.cos(rot), s: Math.sin(rot) }
    for (let i = Math.floor((x - r) / CELL); i <= Math.floor((x + r) / CELL); i++)
      for (let j = Math.floor((z - r) / CELL); j <= Math.floor((z + r) / CELL); j++) {
        const k = key(i, j)
        if (!grid.has(k)) grid.set(k, [])
        grid.get(k).push(box)
      }
  }
}

// The Subura street (Street.jsx) is built as one piece, not from the fabric:
// its houses line both sides of the street, broken by the side lane.
const C0 = CLEARINGS[0]
function inStreetHouses(x, z) {
  const [lx, lz] = streetLocal(x, z)
  const cx = lx - streetLocal(...C0.at)[0]
  if (Math.abs(cx) > C0.w / 2 || Math.abs(lz) > C0.d / 2) return false
  if (Math.abs(lz) < STREET.front - 0.7) return false // the street and most of its pavements
  if (Math.abs(lx - STREET.cross) < 2.2) return false // the side lane
  return true
}

export function blocked(x, z) {
  if (riverDist(x, z) < RIVER_HALF + 2) return true
  if (!walkThroughStreet && inStreetHouses(x, z)) return true
  const list = grid.get(key(Math.floor(x / CELL), Math.floor(z / CELL)))
  if (!list) return false
  for (const b of list) {
    // into the box's own frame (three.js turns +x towards -z for a positive rot)
    const dx = x - b.x, dz = z - b.z
    const u = dx * b.c - dz * b.s, v = dx * b.s + dz * b.c
    if (Math.abs(u) < b.hw && Math.abs(v) < b.hd) return true
  }
  return false
}

// the nearest open spot to (x, z), searching outwards in rings
export function openSpot(x, z) {
  if (!blocked(x, z)) return [x, z]
  for (let r = 3; r < 120; r += 3)
    for (let a = 0; a < 16; a++) {
      const px = x + Math.cos((a / 16) * Math.PI * 2) * r, pz = z + Math.sin((a / 16) * Math.PI * 2) * r
      if (!blocked(px, pz)) return [px, pz]
    }
  return [x, z]
}
