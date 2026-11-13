// The construction ramp: a causeway of rubble and mudbrick that winds around
// the pyramid, one face at a time. This is one of several hypotheses that
// archaeologists discuss; the scene labels it as a reconstruction.
import * as THREE from 'three'
import { GIZA, RAMP_START_TOP } from '../design/tokens'

export const RAMP_WIDTH = 9
const SLOPE = 0.125 // one metre up for every eight metres along
const FACE = GIZA.height / (GIZA.base / 2) // how fast the faces lean in
const halfWidthAt = (y) => (GIZA.base / 2) * (1 - y / GIZA.height)

// Corners in the order the ramp visits them: SW, SE, NE, NW (x east, z south).
const CORNERS = [[-1, 1], [1, 1], [1, -1], [-1, -1]]

// Each leg climbs along one face, from one corner of the pyramid to the next.
function buildLegs(maxHeight) {
  const legs = []
  let h = 0
  for (let k = 0; h < maxHeight; k++) {
    const hb = GIZA.base / 2
    const h1 = (h + SLOPE * (halfWidthAt(h) + hb)) / (1 + (SLOPE * hb) / GIZA.height)
    const c0 = CORNERS[k % 4], c1 = CORNERS[(k + 1) % 4]
    const A = new THREE.Vector3(c0[0] * halfWidthAt(h), h, c0[1] * halfWidthAt(h))
    const B = new THREE.Vector3(c1[0] * halfWidthAt(h1), h1, c1[1] * halfWidthAt(h1))
    const dir = new THREE.Vector3(c1[0] - c0[0], 0, c1[1] - c0[1]).normalize()
    const out = new THREE.Vector3(c0[0] + c1[0], 0, c0[1] + c1[1]).normalize() // away from the face
    legs.push({ A, B, dir, out, h0: h, h1 })
    h = h1
  }
  return legs
}

export const LEGS = buildLegs(126)
export const START_LEGS = 5 // legs already built when the visitor arrives
export const START_TOP = LEGS[START_LEGS - 1].h1 // about 92 m
if (Math.abs(START_TOP - RAMP_START_TOP) > 0.05) console.warn('RAMP_START_TOP in design/tokens.js is out of date:', START_TOP)

// Ramp mesh, ordered bottom to top so it can be drawn up to any height.
// Returns the geometry plus, for each section, its height and vertex count.
export function rampGeometry() {
  const pos = [], along = []
  const steps = [] // { height, count }
  let dist = 0
  const quad = (a, b, c, d, d0, d1) => {
    for (const [p, s] of [[a, d0], [b, d0], [c, d1], [a, d0], [c, d1], [d, d1]]) {
      pos.push(p.x, p.y, p.z)
      along.push(s)
    }
  }
  const drop = (p) => new THREE.Vector3(p.x, Math.max(p.y - (FACE * RAMP_WIDTH + 1.5), -0.6), p.z)
  const N = 14
  for (const leg of LEGS) {
    const o = leg.out.clone().multiplyScalar(RAMP_WIDTH)
    const len = leg.A.distanceTo(leg.B)
    for (let i = 0; i < N; i++) {
      const a = leg.A.clone().lerp(leg.B, i / N), b = leg.A.clone().lerp(leg.B, (i + 1) / N)
      const ao = a.clone().add(o), bo = b.clone().add(o)
      const d0 = dist + (len * i) / N, d1 = dist + (len * (i + 1)) / N
      quad(a, ao, bo, b, d0, d1) // hauling surface (a→ao→bo→b seen from above)
      quad(ao, drop(ao), drop(bo), bo, d0, d1) // retaining wall
      steps.push({ height: b.y, count: pos.length / 3 })
    }
    dist += len
    // Level landing where the ramp turns the corner.
    const e = leg.dir.clone().multiplyScalar(RAMP_WIDTH)
    const b = leg.B, bo = b.clone().add(o), be = b.clone().add(e), boe = bo.clone().add(e)
    quad(b, bo, boe, be, dist, dist + RAMP_WIDTH)
    quad(bo, drop(bo), drop(boe), boe, dist, dist + RAMP_WIDTH)
    quad(boe, drop(boe), drop(be), be, dist, dist + RAMP_WIDTH)
    steps.push({ height: b.y, count: pos.length / 3 })
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('aAlong', new THREE.Float32BufferAttribute(along, 1))
  g.computeVertexNormals()
  return { geometry: g, steps }
}

// The route the hauling teams walk: across the site, up the legs built so
// far, and onto the working platform.
function buildRoute() {
  const pts = []
  const hb = GIZA.base / 2
  const mid = RAMP_WIDTH / 2
  pts.push(new THREE.Vector3(-hb - 30, 0, hb + 250))
  pts.push(new THREE.Vector3(-hb - 12, 0, hb + mid + 6))
  for (let k = 0; k < START_LEGS; k++) {
    const leg = LEGS[k]
    const o = leg.out.clone().multiplyScalar(mid)
    pts.push(leg.A.clone().add(o))
    pts.push(leg.B.clone().add(o))
    pts.push(leg.B.clone().add(o).addScaledVector(leg.dir, mid))
  }
  const top = halfWidthAt(START_TOP)
  pts.push(new THREE.Vector3(top - 10, START_TOP, top - 9))
  pts.push(new THREE.Vector3(6, START_TOP, 12))
  const cum = [0]
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1]))
  return { pts, cum, length: cum[cum.length - 1] }
}

export const ROUTE = buildRoute()

// Position on the route at distance d from its start. `lat` shifts sideways.
// Returns the direction of travel in outDir.
export function routePoint(d, lat, outPos, outDir) {
  const { pts, cum, length } = ROUTE
  d = THREE.MathUtils.clamp(d, 0, length - 0.001)
  let lo = 0, hi = cum.length - 1
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1
    if (cum[m] <= d) lo = m
    else hi = m
  }
  const f = (d - cum[lo]) / (cum[hi] - cum[lo] || 1)
  outPos.lerpVectors(pts[lo], pts[hi], f)
  outDir.subVectors(pts[hi], pts[lo])
  const flat = Math.hypot(outDir.x, outDir.z) || 1
  outPos.x += (-outDir.z / flat) * lat
  outPos.z += (outDir.x / flat) * lat
  return outPos
}
