// The Colosseum in AD 100, twenty years after its opening.
// Local frame: x along the major axis (188.5 m), z along the minor axis
// (156 m), +z towards the south-south-west. Measurements and their sources:
// HISTORY.md and FACT-CHECK-ROME.md. What is reconstructed rather than known
// (statues in the arches, porches, colours, the awning, the crowd) is said so
// on the markers.
import { useLayoutEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { GHOST, T, useNow } from './era'
import { Games } from './ColosseumGames'
import { Builder } from './geo'
import { PLACES } from './layout'
import { C } from './colours'
import { getState, subscribeState } from '../state'

const COARSE = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
const FORCED = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('q')
const LITE = FORCED === 'low' || (COARSE && FORCED !== 'high')

// The outer ellipse and the façade storeys (ground level = 0).
export const COL = {
  A: 94.25, B: 78, // outer half-axes
  arena: [41.5, 24], // sand: about 83 × 48 m
  bays: 80,
  storeys: [
    { y0: 0, y1: 10.6, ow: 4.2, oh: 7.05, order: 'Tuscan' },
    { y0: 10.6, y1: 22.4, ow: 4.2, oh: 6.45, order: 'Ionic' },
    { y0: 22.4, y1: 33.4, ow: 4.2, oh: 6.4, order: 'Corinthian' },
  ],
  attic: [33.4, 48],
}
const TAU = Math.PI * 2

// Point on an ellipse and the angle that turns a panel to lie along it.
function onEllipse(a, b, t) {
  const x = a * Math.cos(t), z = b * Math.sin(t)
  const ry = -Math.atan2(b * Math.cos(t), -a * Math.sin(t)) // panel width along the curve
  const nx = Math.cos(t) / a, nz = Math.sin(t) / b, nl = Math.hypot(nx, nz)
  return { x, z, ry, nx: nx / nl, nz: nz / nl }
}

function build() {
  const b = new Builder().at(0, 0, 0, 0)
  const gold = new Builder().at(0, 0, 0, 0)
  const { A, B, bays } = COL
  const per = (Math.PI * (3 * (A + B) - Math.sqrt((3 * A + B) * (A + 3 * B)))) / bays // bay width along the curve
  const depth = 2.4
  const ac = A - depth / 2, bc = B - depth / 2

  // ---- façade: three arcaded storeys ----
  COL.storeys.forEach((s, k) => {
    const h = s.y1 - s.y0
    for (let i = 0; i < bays; i++) {
      const t = (i / bays) * TAU
      const p = onEllipse(ac, bc, t)
      const axial = i % 20 === 0
      const ow = k === 0 && axial ? 5.2 : s.ow
      b.arched(p.x, s.y0, p.z, per * 1.02, h - 1.6, depth, ow, s.oh, C.travertine, p.ry)
      // engaged half-column between the bays, with base and capital
      const q = onEllipse(A + 0.25, B + 0.25, ((i + 0.5) / bays) * TAU)
      b.cyl(q.x, s.y0 + 0.5, q.z, 0.62, 0.55, h - 2.6, C.travertine, 8)
      b.box(q.x, s.y0, q.z, 1.6, 0.5, 1.6, C.travertine, q.ry, 0.95)
      b.box(q.x, s.y1 - 2.1, q.z, k === 0 ? 1.4 : 1.6, k === 0 ? 0.4 : 0.6, k === 0 ? 1.4 : 1.6, C.travertine, q.ry, 0.97)
      // a statue in each arch of the upper two storeys (shown on the coins of Titus)
      if (k > 0) {
        b.box(p.x + p.nx * 0.3, s.y0, p.z + p.nz * 0.3, 1.6, 0.9, 1.1, C.travertine, p.ry, 0.92)
        b.cyl(p.x + p.nx * 0.3, s.y0 + 0.9, p.z + p.nz * 0.3, 0.42, 0.32, 2.2, C.marble, 6)
        b.cyl(p.x + p.nx * 0.3, s.y0 + 3.1, p.z + p.nz * 0.3, 0.2, 0.2, 0.4, C.marble, 6)
      }
      // a number plate over each public ground-floor arch (76 of the 80)
      if (k === 0 && !axial) b.box(p.x + p.nx * 1.25, s.oh + 0.5, p.z + p.nz * 1.25, 1.3, 0.55, 0.12, '#CDBFA4', p.ry)
    }
    // entablature: architrave, frieze and a projecting cornice
    b.band(A + 0.6, B + 0.6, s.y1 - 1.6, s.y1 - 0.5, 1.4, C.travertine, 160, 0.96)
    b.band(A + 1.0, B + 1.0, s.y1 - 0.5, s.y1, 1.8, C.travertine, 160, 1.02)
  })

  // ---- the attic: pilasters, windows and gilded bronze shields ----
  const [a0, a1] = COL.attic
  b.band(A, B, a0, a1 - 1.2, depth, C.travertine, 160)
  b.band(A + 0.9, B + 0.9, a1 - 1.2, a1, 1.9, C.travertine, 160, 1.03)
  for (let i = 0; i < bays; i++) {
    const t = (i / bays) * TAU
    const q = onEllipse(A + 0.2, B + 0.2, ((i + 0.5) / bays) * TAU)
    b.box(q.x, a0, q.z, 1.1, a1 - a0 - 1.4, 0.5, C.travertine, q.ry, 1.04) // pilaster
    const p = onEllipse(A + 0.05, B + 0.05, t)
    if (i % 2 === 0) b.box(p.x, a0 + 5.2, p.z, 1.6, 2.4, 0.3, C.dark, p.ry) // window
    else gold.push(new THREE.CylinderGeometry(1.25, 1.25, 0.25, 16).rotateX(Math.PI / 2), '#D7B060', gold.local(p.x + p.nx * 0.15, a0 + 6.4, p.z + p.nz * 0.15, p.ry))
    // three corbels per bay carry the 240 masts of the awning
    for (let m = 0; m < 3; m++) {
      const c = onEllipse(A + 0.45, B + 0.45, ((i + (m + 0.5) / 3) / bays) * TAU)
      b.box(c.x, a1 - 6.2, c.z, 0.55, 0.9, 0.9, C.travertine, c.ry, 0.9)
      b.box(c.x, a1 - 5.3, c.z, 0.32, 12.5, 0.32, C.wood, c.ry)
    }
  }

  // ---- the four main entrances on the axes: porches (reconstructed) ----
  for (let k = 0; k < 4; k++) {
    const t = (k / 4) * TAU
    const p = onEllipse(A + 2.6, B + 2.6, t)
    const ox = p.nx * 1.6, oz = p.nz * 1.6
    b.box(p.x + ox, 0, p.z + oz, 9, 10.2, 3.6, C.marble, p.ry)
    b.box(p.x + ox * 1.9, 0, p.z + oz * 1.9, 5.4, 7.2, 0.3, C.dark, p.ry)
    b.gable(p.x + ox, 10.2, p.z + oz, 9.6, 2.2, 4, C.marble, p.ry)
    for (const side of [-1, 1]) {
      const sx = Math.cos(p.ry) * side * 3.6, sz = -Math.sin(p.ry) * side * 3.6
      b.cyl(p.x + ox * 2.6 + sx, 0, p.z + oz * 2.6 + sz, 0.5, 0.45, 9.6, C.marble, 10)
    }
  }

  // ---- inside: the corridors behind the arcades (seen through the arches) ----
  b.band(A - depth - 0.2, B - depth - 0.2, 0, 33.4, 9, C.dark, 96)
  b.band(A - 11.5, B - 11.5, 0, 33.4, 2, '#6E6255', 96)

  // ---- the seating (cavea), lowest and best seats nearest the sand ----
  const [ra, rb] = COL.arena
  b.band(ra + 0.6, rb + 0.6, -0.5, 4, 0.6, C.marble, 96) // podium wall round the arena
  b.band(ra + 1.0, rb + 1.0, 4, 5.1, 0.35, C.marble, 96) // marble balustrade
  b.bank(ra + 0.9, rb + 0.9, ra + 4.5, rb + 4.5, 4, 4, '#D9CDB8', 96) // podium terrace for senators' chairs
  b.steps(ra + 4.5, rb + 4.5, 4, 20, 0.42, 0.75, C.marble, 96, C.marbleWarm) // ima cavea
  b.band(ra + 20.2, rb + 20.2, 12.4, 14.6, 0.6, C.marbleWarm, 96) // first dividing wall (praecinctio)
  b.bank(ra + 19.5, rb + 19.5, ra + 21.5, rb + 21.5, 14.6, 14.6, '#D2C5AE', 96)
  b.steps(ra + 21.5, rb + 21.5, 14.6, 16, 0.5, 0.75, C.marbleWarm, 96, C.stucco) // media cavea
  b.band(ra + 33.8, rb + 33.8, 22.6, 26.5, 0.8, C.stucco, 96) // the high wall below the top tier
  b.bank(ra + 33, rb + 33, ra + 35.5, rb + 35.5, 26.5, 26.5, '#C9BBA2', 96)
  b.steps(ra + 35.5, rb + 35.5, 26.5, 12, 0.5, 0.75, C.wood, 96, '#9A7752') // wooden seats at the top
  // vomitoria: the openings through which the crowd poured in and out
  for (const [aa, yy, n] of [[ra + 12, 8, 32], [ra + 28, 18.6, 40], [ra + 41, 29.5, 40]]) {
    for (let i = 0; i < n; i++) {
      const p = onEllipse(aa, aa - (ra - rb), ((i + 0.25) / n) * TAU)
      b.box(p.x, yy - 0.4, p.z, 2.6, 2.2, 0.6, C.dark, p.ry)
    }
  }
  // the colonnade crowning the cavea, and the roof where the sailors worked
  for (let i = 0; i < 96; i++) {
    const p = onEllipse(A - 6.4, B - 6.4, (i / 96) * TAU)
    b.cyl(p.x, 32.5, p.z, 0.36, 0.3, 7.6, C.marble, 6)
  }
  b.band(A - 6.1, B - 6.1, 40.1, 41.1, 1.2, C.stucco, 96)
  b.bank(A - 6.8, B - 6.8, A - 2.3, B - 2.3, 41.1, 45.4, C.roof, 96)
  // boxes on the podium at both ends of the minor axis (emperor; magistrates)
  for (const side of [-1, 1]) {
    const z = side * (rb + 2.6)
    b.box(0, 4, z, 12, 1.2, 5, C.marble)
    for (const x of [-5, 5]) b.cyl(x, 5.2, z, 0.3, 0.3, 4.2, C.marble, 8)
    b.box(0, 9.4, z, 12.6, 0.6, 5.6, C.red)
  }
  return { stone: b.merge(), gold: gold.merge() }
}

// Who sat where (Lex Iulia theatralis): colours laid over the tiers on request.
// Podium: senators; first tier: knights; second: citizens; top, in wood: women
// and the poor. Simplified: the real divisions also sorted soldiers, boys with
// their tutors, priests and the Vestals.
export const SEAT_CLASSES = [
  { a: COL.arena[0] + 0.9, y0: 4.05, rows: 5, rise: 0, tread: 0.72, hex: '#D4AF4A' },
  { a: COL.arena[0] + 4.5, y0: 4, rows: 20, rise: 0.42, tread: 0.75, hex: '#9E2F3C' },
  { a: COL.arena[0] + 21.5, y0: 14.6, rows: 16, rise: 0.5, tread: 0.75, hex: '#3F6E8C' },
  { a: COL.arena[0] + 35.5, y0: 26.5, rows: 12, rise: 0.5, tread: 0.75, hex: '#5E8A4A' },
]
function seatingGeometry() {
  const b = new Builder().at(0, 0, 0, 0)
  const d = COL.arena[0] - COL.arena[1]
  for (const c of SEAT_CLASSES) {
    const a1 = c.a + c.rows * c.tread
    b.bank(c.a, c.a - d, a1, a1 - d, c.y0 + c.rise + 0.15, c.y0 + (c.rows + 1) * c.rise + 0.15, c.hex, 96)
  }
  return b.merge()
}

// The arena floor: wooden boards covered with sand, with its trapdoors.
function arenaGeometry() {
  const [ra, rb] = COL.arena
  const g = new THREE.CircleGeometry(1, 64).rotateX(-Math.PI / 2).scale(ra + 0.6, 1, rb + 0.6)
  return g
}

// The hypogeum, Domitian's service level under the arena: walls about 6 m
// high, a long central corridor, parallel and curved walls, lift shafts.
function hypogeum() {
  const b = new Builder().at(0, -6, 0, 0)
  const [ra, rb] = COL.arena
  const tuff = '#9C8A6C', brick = '#A3644A'
  b.disc(ra + 0.6, rb + 0.6, 0.02, '#6B5B48', 48)
  b.band(ra + 0.6, rb + 0.6, 0, 7, 1.2, tuff, 64)
  for (const z of [-3.2, 3.2]) b.box(0, 0, z, ra * 2 - 8, 6, 0.9, brick)
  for (const z of [-9, 9, -15, 15]) b.box(0, 0, z, ra * 2 - 18 - Math.abs(z) * 0.9, 6, 0.8, tuff)
  b.band(ra - 6, rb - 6, 0, 6, 0.8, brick, 48)
  // in the Flavian period 28 lifts stood along the curved corridor, each
  // worked by a capstan, hoisting cages to trapdoors in the floor (Parco
  // archeologico del Colosseo); the 60 small lifts in the straight corridors came
  // later, under the Severans, and are not shown
  for (let i = 0; i < 28; i++) {
    const p = onEllipse(ra - 3, rb - 3, ((i + 0.5) / 28) * TAU)
    b.box(p.x, 0, p.z, 1.8, 6, 1.8, C.wood, p.ry, 0.8) // the lift cage frame
    b.cyl(p.x - p.nx * 1.8, 0, p.z - p.nz * 1.8, 0.25, 0.25, 2.4, C.wood, 6) // capstan
  }
  return b.merge()
}

// SEAT_ROW: the visitor's seat (content/rome.js, "Take a seat"): rows 0–2 of the
// middle tier are left empty so nobody stands in front of the eye.
export const SEAT_ROW = 6.5
function crowd(count, seed) {
  // Spectators on the rows: togas white near the sand, colours higher up.
  let s = seed >>> 0
  const rand = () => ((s = (s + 0x6d2b79f5) | 0), (((s ^ (s >>> 15)) * (1 | s)) >>> 0) / 4294967296)
  const [ra, rb] = COL.arena
  const tiers = [
    { a: ra + 4.5, y: 4, rows: 20, rise: 0.42, colours: ['#F2EEE4', '#F2EEE4', '#E9E3D4', '#E7D9BE'] },
    { a: ra + 21.5, y: 14.6, rows: 16, rise: 0.5, colours: ['#E9E3D4', '#C9A06B', '#9C6B4A', '#B9B19E', '#7E6A55', '#A64B3C'] },
    { a: ra + 35.5, y: 26.5, rows: 12, rise: 0.5, colours: ['#7E6A55', '#6E5A48', '#9C6B4A', '#5A6670', '#8C7A5C', '#A64B3C'] },
  ]
  const items = []
  for (let i = 0; i < count; i++) {
    const tier = tiers[rand() < 0.38 ? 0 : rand() < 0.6 ? 1 : 2]
    const row = Math.floor(rand() * tier.rows)
    if (tier === tiers[1] && row <= 2) continue
    const a = tier.a + row * 0.75 + 0.35, bb = a - (ra - rb)
    const t = rand() * TAU
    items.push([a * Math.cos(t), tier.y + (row + 1) * tier.rise, bb * Math.sin(t), tier.colours[Math.floor(rand() * tier.colours.length)]])
  }
  // people on the paving outside
  for (let i = 0; i < count * 0.06; i++) {
    const t = rand() * TAU, r = 1.03 + rand() * 0.17
    items.push([COL.A * r * Math.cos(t), 0, COL.B * r * Math.sin(t), ['#E9E3D4', '#9C6B4A', '#7E6A55', '#A64B3C', '#C9A06B'][Math.floor(rand() * 5)]])
  }
  return items
}

const personGeometry = (() => {
  const body = new THREE.CylinderGeometry(0.22, 0.3, 1.25, 6).translate(0, 0.62, 0)
  const head = new THREE.SphereGeometry(0.17, 6, 4).translate(0, 1.42, 0)
  const g = new THREE.BufferGeometry()
  const parts = [body.toNonIndexed(), head.toNonIndexed()]
  const pos = [], nrm = [], col = []
  parts.forEach((p, k) => {
    pos.push(...p.attributes.position.array)
    nrm.push(...p.attributes.normal.array)
    const c = k === 0 ? [1, 1, 1] : [0.62, 0.45, 0.36]
    for (let i = 0; i < p.attributes.position.count; i++) col.push(...c)
  })
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3))
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  return g
})()

export function Crowd({ items }) {
  const ref = useRef()
  useLayoutEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(1, 1, 1), c = new THREE.Color()
    items.forEach(([x, y, z, hex, yaw], i) => {
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw ?? Math.atan2(-x, -z))
      // seated spectators are a little shorter
      s.set(1, yaw === undefined && y > 1 ? 0.78 : 1, 1)
      m.compose(p.set(x, y, z), q, s)
      ref.current.setMatrixAt(i, m)
      // the head keeps its skin tone: instance colour tints only the body
      ref.current.setColorAt(i, c.set(hex))
    })
    ref.current.instanceMatrix.needsUpdate = true
    ref.current.instanceColor.needsUpdate = true
    ref.current.computeBoundingSphere()
  }, [items])
  return (
    <instancedMesh ref={ref} args={[personGeometry, null, items.length]} frustumCulled={false}>
      <meshStandardMaterial vertexColors roughness={1} />
    </instancedMesh>
  )
}

// The awning: canvas strips from the masts down towards a central opening.
function velariumGeometry() {
  const n = 80
  const pos = [], col = []
  const { A, B } = COL
  const c1 = new THREE.Color('#EFE6D2'), c2 = new THREE.Color('#D9B88A')
  for (let i = 0; i < n; i++) {
    const t0 = (i / n) * TAU, t1 = ((i + 1) / n) * TAU
    const P = (a, b, t, y) => [a * Math.cos(t), y, b * Math.sin(t)]
    const o0 = P(A + 0.5, B + 0.5, t0, 56), o1 = P(A + 0.5, B + 0.5, t1, 56)
    const i0 = P(A - 40, B - 40, t0, 36), i1 = P(A - 40, B - 40, t1, 36)
    // a slight sag in the middle of each strip
    const m0 = P(A - 20, B - 20, t0, 44.5), m1 = P(A - 20, B - 20, t1, 44.5)
    pos.push(...o0, ...m1, ...o1, ...o0, ...m0, ...m1, ...m0, ...i1, ...m1, ...m0, ...i0, ...i1)
    const c = i % 2 ? c1 : c2
    for (let v = 0; v < 12; v++) col.push(c.r, c.g, c.b)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  g.computeVertexNormals()
  return g
}

// Travertine paving round the building, about 17 m wide, edged with stone
// posts (cippi), then the basalt street.
function paving() {
  const b = new Builder().at(0, 0, 0, 0)
  const { A, B } = COL
  b.bank(A, B, A + 17.5, B + 17.5, 0.08, 0.08, '#D8CDB6', 96)
  b.bank(A + 17.5, B + 17.5, A + 30, B + 30, 0.06, 0.06, '#7B756C', 96)
  for (let i = 0; i < 80; i++) {
    const p = onEllipse(A + 17.3, B + 17.3, ((i + 0.5) / 80) * TAU)
    b.box(p.x, 0, p.z, 0.6, 1.6, 0.6, C.travertine, p.ry)
  }
  // the colonnade from the north entrance towards the Esquiline (on the coins
  // of Titus; mentioned by Platner & Ashby)
  for (let i = 0; i < 18; i++) {
    for (const side of [-4, 4]) b.box(side, 0, -B - 20 - i * 6, 1.2, 9, 1.2, C.travertine)
  }
  b.box(0, 9, -B - 71, 10, 1, 108, C.travertine)
  b.hip(0, 10, -B - 71, 10.5, 1.6, 108.5, C.roof)
  return b.merge()
}


// ---------- today (session 8) ----------
// The same stone, cut back to what stands now: on the south side the outer
// ring and the second ring fell (the earthquake of 1349, then centuries of
// quarrying) between the two buttresses of the 1800s; there only the inner
// rings stand, about two storeys high. The cut is done in the shader.
function ruinPatch(m) {
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vObj;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvObj = position;')
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vObj;')
      .replace(
        'void main() {',
        `void main() {
  {
    float rr = length(vec2(vObj.x / ${COL.A.toFixed(2)}, vObj.z / ${COL.B.toFixed(2)}));
    float s = vObj.z / (${COL.B.toFixed(2)} * max(rr, 0.05));
    float a = atan(vObj.z, vObj.x);
    float edge = 0.1 + 0.04 * sin(vObj.y * 0.35);
    float ragged = 3.0 * sin(a * 37.0) + 2.0 * sin(a * 11.0 + 1.3);
    if (s > edge && rr > 0.8) discard;
    if (s > edge + 0.06 && rr > 0.5 && vObj.y > 21.0 + ragged) discard;
  }`,
      )
    if (sh.fragmentShader.includes('#include <color_fragment>'))
      sh.fragmentShader = sh.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\n  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.78, 0.70, 0.58), 0.5);')
  }
  m.customProgramCacheKey = () => 'colosseum-ruin-' + m.type
  return m
}
function todayExtras() {
  const b = new Builder().at(0, 0, 0, 0)
  const { A, B } = COL
  // East: Raffaele Stern's sloping brick buttress (1806–07), holding up the
  // end of the outer ring.
  for (let i = 0; i < 6; i++) {
    const t = 0.1 + i * 0.022
    const p = onEllipse(A - 2.5, B - 2.5, t)
    b.box(p.x, 0, p.z, 5.6, 47 - i * 8, 3.6, T.brick, p.ry, 0.95 + (i % 2) * 0.05)
  }
  // West: Giuseppe Valadier's rebuilt bays (1820s), brick in the shape of
  // the stone arcades, stepping down.
  for (let i = 0; i < 4; i++) {
    const t = Math.PI - 0.1 - i * 0.05
    const p = onEllipse(A - 0.8, B - 0.8, t)
    b.box(p.x, 0, p.z, 4.6, 47 - i * 9, 1.6, T.brick, p.ry, 0.97)
    for (const st of COL.storeys) if (st.y1 < 47 - i * 9) b.box(p.x, st.y1 - 0.6, p.z, 4.8, 0.8, 1.9, T.ruin, p.ry)
  }
  // A modern wooden floor over the east end of the arena (Inferred extent).
  for (let x = 20; x <= 39; x += 2.5) {
    const hz = COL.arena[1] * Math.sqrt(Math.max(0, 1 - (x / COL.arena[0]) ** 2)) * 0.94
    b.box(x, 0.2, 0, 2.5, 0.4, hz * 2, T.wood, 0, x % 5 < 2.5 ? 1 : 0.94)
  }
  return b.merge()
}

export function Colosseum() {
  const p = PLACES.colosseum
  const parts = useMemo(() => {
    const t0 = performance.now()
    const built = build()
    const out = { ...built, seating: seatingGeometry(), arena: arenaGeometry(), hyp: hypogeum(), velarium: velariumGeometry(), paving: paving(), crowd: crowd(LITE ? 3500 : 9000, 100) }
    window.__colosseum = { ms: Math.round(performance.now() - t0), triangles: built.stone.attributes.position.count / 3 }
    return out
  }, [])
  const mats = useMemo(
    () => ({
      stone: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.86, side: THREE.DoubleSide }),
      gold: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.35, metalness: 0.85 }),
      sand: new THREE.MeshStandardMaterial({ color: '#D7BD8C', roughness: 1 }),
      canvas: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, side: THREE.DoubleSide, transparent: true, opacity: 0.94 }),
      seating: new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, transparent: true, opacity: 0.62, depthWrite: false }),
      ruin: ruinPatch(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.94, side: THREE.DoubleSide })),
      ruinDepth: ruinPatch(new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking })),
      today: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92 }),
    }),
    [],
  )
  const st = useSyncExternalStore(subscribeState, getState)
  const now = st.now
  const extras = useMemo(() => (now ? todayExtras() : null), [now])
  // The sand fades away to show the hypogeum, and the awning unrolls.
  const arena = useRef(), velarium = useRef()
  const k = useRef({ beneath: 0, vel: 0 })
  useFrame((_, dt) => {
    const e = 1 - Math.exp(-3 * Math.min(dt, 0.1))
    k.current.beneath += ((st.beneath ? 1 : 0) - k.current.beneath) * e
    k.current.vel += ((st.velarium ? 1 : 0) - k.current.vel) * e
    if (arena.current) {
      arena.current.visible = k.current.beneath < 0.98 && !now
      const see = k.current.beneath > 0.01
      if (mats.sand.transparent !== see) {
        mats.sand.transparent = see
        mats.sand.needsUpdate = true
      }
      mats.sand.opacity = 1 - k.current.beneath
    }
    if (velarium.current) {
      velarium.current.visible = k.current.vel > 0.01 && !now
      velarium.current.scale.setScalar(0.35 + 0.65 * k.current.vel)
      velarium.current.position.y = (1 - k.current.vel) * 30
      mats.canvas.opacity = 0.94 * Math.min(1, k.current.vel * 1.5)
    }
  })
  return (
    <group position={[p.at[0], 1, p.at[1]]} rotation-y={p.rot}>
      <mesh geometry={parts.stone} material={now ? GHOST : mats.stone} castShadow={!now} receiveShadow={!now} />
      {now && <mesh geometry={parts.stone} material={mats.ruin} customDepthMaterial={mats.ruinDepth} castShadow receiveShadow />}
      {now && extras && <mesh geometry={extras} material={mats.today} castShadow receiveShadow />}
      {!now && <mesh geometry={parts.gold} material={mats.gold} />}
      <mesh geometry={parts.paving} material={mats.stone} receiveShadow />
      <mesh geometry={parts.hyp} material={now ? mats.ruin : mats.stone} receiveShadow />
      <mesh ref={arena} geometry={parts.arena} material={mats.sand} position-y={0.4} receiveShadow visible={!now} />
      {!now && <Crowd items={parts.crowd} />}
      <mesh geometry={parts.seating} material={mats.seating} visible={st.seating && !now} renderOrder={2} />
      {!now && <Games hunt={st.hunt} fight={st.fight} />}
      <group ref={velarium} visible={!now}>
        <mesh geometry={parts.velarium} material={mats.canvas} castShadow />
      </group>
    </group>
  )
}
