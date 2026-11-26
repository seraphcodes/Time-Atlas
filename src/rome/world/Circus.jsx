// The Circus Maximus in AD 100, while Trajan rebuilds it in stone (session 6).
// Documented: about 621 × 118 m; seating for perhaps 150,000 (Dionysius 3.68;
// Pliny's 250,000 is doubted); arcades with shops on the outside; Augustus's
// obelisk on the central barrier; Agrippa's bronze dolphins as lap counters;
// the triple Arch of Titus (AD 81) in the middle of the curved east end.
// Trajan's works: finished by 103 (coins); he extended the seats on the Palatine
// side (Encyclopaedia Romana) and did away with Domitian's private box (Pliny,
// Panegyricus 51). Where the scaffolding stood is our invention.
// Circus frame (PLACES.circus): x along the track, from the starting gates
// (-x, north-west) to the curved end (+x, south-east); -z is the Palatine side.
import { useMemo } from 'react'
import * as THREE from 'three'
import { GHOST, useNow } from './era'
import { Builder, archPanelGeometry } from './geo'
import { PLACES } from './layout'
import { C } from './colours'
import { Crowd } from './Colosseum'

const COARSE = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
const FORCED = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('q')
const LITE = FORCED === 'low' || (COARSE && FORCED !== 'high')

export const CIRCUS = { L: 621, W: 118, tW: 40 }
const half = CIRCUS.L / 2 // 310.5
const R = CIRCUS.W / 2 // 59: outer half width
const tW = CIRCUS.tW // half width of the track
const straight = half - R // the curved end is centred here
const X0 = -half + 14 // the line of the starting gates
const SEAT = '#E6DDCB', SEAT2 = '#D6CBB5', TRAV = C.travertine, WOOD = '#8A6A47', DARK = '#2C241E'
const WORKS = [-120, 170] // the stretch of the Palatine side still being rebuilt (our guess)

// stepped seats in cross-section, run along x from xa to xb (side s = ±1)
function seatBank(b, xa, xb, s, rows, unfinished = false) {
  const shape = new THREE.Shape()
  const z0 = tW + 2.4, y0 = 4.2, tread = 0.66, rise = 0.92
  shape.moveTo(z0, 0)
  shape.lineTo(z0, y0)
  let z = z0, y = y0
  for (let i = 0; i < rows; i++) {
    z += tread
    shape.lineTo(z, y)
    y += rise
    shape.lineTo(z, y)
    if (i === 7 || i === 15) {
      z += 1.4 // a walkway between the tiers
      shape.lineTo(z, y)
    }
  }
  shape.lineTo(R - 2.6, y)
  shape.lineTo(R - 2.6, 0)
  shape.lineTo(z0, 0)
  const g = new THREE.ExtrudeGeometry(shape, { depth: xb - xa, bevelEnabled: false, curveSegments: 1 })
  g.rotateY(-Math.PI / 2) // extrusion along x, the profile across z
  g.scale(-1, 1, s) // x' = -(-z) runs from xa to xb after the shift below; mirror for the Palatine side
  g.translate(xa, 0, 0)
  b.push(g, unfinished ? '#CFC6B2' : SEAT, b.local(0, 0, 0))
  return y
}

// two storeys of arcades with shops on the outside, an attic above
function facade(b, xa, xb, s, top = 3) {
  const bay = 6.6
  const n = Math.round((xb - xa) / bay)
  const w = (xb - xa) / n
  for (let st = 0; st < Math.min(top, 2); st++) {
    for (let i = 0; i < n; i++) b.push(archPanelGeometry(+w.toFixed(3), 9.4, +(w - 2.2).toFixed(3), 7.4, 2.2), TRAV, b.local(xa + (i + 0.5) * w, st * 9.4, s * R), 1 - st * 0.03)
    // the shops and the stairways behind the ground-floor arches
    if (st === 0) b.box((xa + xb) / 2, 0, s * (R - 4.4), xb - xa, 9.4, 6.4, '#4A3B2F', 0, 0.9)
  }
  if (top >= 3) {
    b.box((xa + xb) / 2, 18.8, s * R, xb - xa, 8.6, 2.2, TRAV, 0, 0.97)
    for (let i = 0; i < n; i++) b.box(xa + (i + 0.5) * w, 21, s * (R + 1.12), 1.6, 3.2, 0.1, DARK)
    b.box((xa + xb) / 2, 27.4, s * R, xb - xa, 0.8, 2.8, TRAV, 0, 1.04)
  }
  b.box((xa + xb) / 2, 0, s * (tW + 1.2), xb - xa, 4.2, 2.4, C.marble) // podium wall along the track
}

function scaffold(b, xa, xb, s) {
  // poles and ledgers in front of the unfinished Palatine side, a ramp, two cranes
  const z = s * (R + 2.2)
  for (let x = xa; x <= xb; x += 3.3) b.box(x, 0, z, 0.22, 30, 0.22, WOOD)
  for (let y = 2; y <= 30; y += 2.2) b.box((xa + xb) / 2, y, z, xb - xa, 0.16, 0.16, WOOD, 0, 0.9)
  for (let y = 2; y <= 30; y += 4.4) b.box((xa + xb) / 2, y - 0.05, s * (R + 1.2), xb - xa, 0.1, 2.0, '#A08262', 0, 0.85) // planks
  for (const cx of [xa + 150, xb - 70]) {
    // a treadwheel crane on the top of the works
    const y0 = 19
    b.push(new THREE.TorusGeometry(2.6, 0.22, 4, 18), WOOD, b.local(cx, y0 + 2.8, s * (R - 6), Math.PI / 2))
    b.box(cx, y0, s * (R - 6), 0.4, 5.6, 3.4, WOOD)
    const boom = new THREE.Matrix4().compose(new THREE.Vector3(cx, y0 + 9, s * (R - 2)), new THREE.Quaternion().setFromEuler(new THREE.Euler(s * 0.35, 0, 0)), new THREE.Vector3(1, 1, 1))
    b.push(new THREE.BoxGeometry(0.5, 20, 0.5), WOOD, boom)
    b.box(cx, y0 + 6, s * (R + 2.6), 0.05, 12, 0.05, '#3A3029') // rope
    b.box(cx, y0 + 4.5, s * (R + 2.6), 1.6, 1.2, 1.1, TRAV) // a block on its way up
  }
  // blocks and columns waiting on the ground
  for (let i = 0; i < 14; i++) b.box(xa + 10 + i * ((xb - xa - 20) / 13), 0, s * (R + 9 + (i % 3) * 2.2), 2.2, 1.1, 1.4, i % 4 ? TRAV : C.marble)
  for (let i = 0; i < 4; i++) b.cyl(xa + 40 + i * 6, 0.5, s * (R + 16), 0.55, 0.55, 8, C.marble, 10, 0.95)
}

// the triple Arch of Titus, AD 81, about 17 m wide, 15 m deep, nearly 20 m high
function archOfTitus(b, x) {
  const P = (w, h, ow, oh) => archPanelGeometry(w, h, ow, oh, 15)
  b.push(P(7, 14, 5, 11), C.marble, b.local(x, 0, 0, Math.PI / 2))
  b.push(P(5, 14, 3.2, 7.6), C.marble, b.local(x, 0, -6, Math.PI / 2))
  b.push(P(5, 14, 3.2, 7.6), C.marble, b.local(x, 0, 6, Math.PI / 2))
  b.box(x, 14, 0, 15, 4.6, 17, C.marble, 0, 1.03) // attic with the inscription
  b.box(x + 7.55, 15, 0, 0.1, 2.6, 9, '#D7C9A6')
  for (const z of [-5.2, -2.6, 2.6, 5.2]) for (const dx of [-8.1, 8.1]) b.cyl(x + dx, 1.2, z, 0.5, 0.45, 10, C.marble, 10) // four columns on each face
  // a bronze four-horse chariot on top (shown on coins; its form is ours)
  b.box(x, 18.6, 0, 3, 1.2, 6, C.bronze).box(x, 19.8, 0, 2.2, 2.2, 1.6, C.bronze)
  for (const z of [-2.2, -0.75, 0.75, 2.2]) b.box(x + 2, 19.8, z, 2.4, 1.6, 0.55, C.bronze)
}

function build() {
  const b = new Builder()
  const p = PLACES.circus
  b.at(p.at[0], 0.2, p.at[1], p.rot)

  // the track
  b.box((X0 + straight) / 2, -0.3, 0, straight - X0, 0.5, tW * 2, C.sand)
  b.at(p.at[0], 0.2, p.at[1], p.rot)
  b.frame.multiply(new THREE.Matrix4().makeTranslation(straight, 0, 0))
  b.disc(tW, tW, 0.05, C.sand, 40)
  // the curved end: seats, wall, façade band
  // seats in two halves, leaving the passage under the Arch of Titus open
  b.bank(tW + 2.4, tW + 2.4, R - 3, R - 3, 4.2, 26, SEAT2, 16, -Math.PI / 2, -0.15)
  b.bank(tW + 2.4, tW + 2.4, R - 3, R - 3, 4.2, 26, SEAT2, 16, 0.15, Math.PI / 2)
  b.at(p.at[0], 0.2, p.at[1], p.rot)
  const segs = 30
  for (let i = 0; i < segs; i++) {
    const a = -Math.PI / 2 + ((i + 0.5) / segs) * Math.PI
    const len = (R * Math.PI) / segs + 0.3
    if (Math.abs(a) < 0.12) continue // the arch stands here
    b.box(straight + Math.cos(a) * R, 0, Math.sin(a) * R, 2.2, 28.2, len, TRAV, -a)
    b.box(straight + Math.cos(a) * (tW + 1.2), 0, Math.sin(a) * (tW + 1.2), 2.4, 4.2, ((tW + 1.2) * Math.PI) / segs + 0.3, C.marble, -a)
    for (let st = 0; st < 3; st++) b.box(straight + Math.cos(a) * (R + 1.15), 2 + st * 9.4, Math.sin(a) * (R + 1.15), 0.1, 5.6, 2.4, DARK, -a)
  }
  archOfTitus(b, straight + R - 1)

  // the long sides: seats and façades; the Palatine side partly unfinished
  for (const s of [1, -1]) {
    if (s === 1) {
      seatBank(b, X0, straight, s, 24)
      facade(b, X0, straight, s)
    } else {
      seatBank(b, X0, WORKS[0], s, 24)
      seatBank(b, WORKS[0], WORKS[1], s, 15, true) // the upper tiers are not yet built
      seatBank(b, WORKS[1], straight, s, 24)
      facade(b, X0, WORKS[0], s)
      facade(b, WORKS[0], WORKS[1], s, 2)
      facade(b, WORKS[1], straight, s)
      scaffold(b, WORKS[0], WORKS[1], s)
    }
  }

  // the starting gates: twelve stalls, a ceremonial gate in the middle, towers at each end
  const gw = (tW * 2 - 8) / 13
  for (let i = 0; i < 13; i++) {
    const z = -tW + 4 + (i + 0.5) * gw
    const mid = i === 6
    b.push(archPanelGeometry(+gw.toFixed(3), mid ? 11 : 7.5, +(gw - 1.2).toFixed(3), mid ? 8.5 : 5.6, 4), C.marble, b.local(X0 - 2, 0, z, Math.PI / 2))
  }
  b.box(X0 - 6, 0, 0, 6, 7.5, tW * 2 - 8, '#4A3B2F', 0, 0.9)
  b.box(X0 - 4, 7.5, 0, 9, 3.5, tW * 2 - 8, C.marble, 0, 0.98) // the gallery for the magistrate who starts the race
  for (const s of [-1, 1]) {
    b.box(X0 - 5, 0, s * (R - 9), 18, 24, 16, TRAV) // the towers (oppida)
    b.box(X0 - 5, 24, s * (R - 9), 18.6, 1.2, 16.6, TRAV, 0, 1.05)
  }

  // the central barrier: water basins, shrines and statues, turning posts, lap counters
  const sp = 344, sx = (X0 + straight) / 2 - 12
  b.box(sx, 0, 0, sp, 1.8, 8.6, C.marble)
  b.box(sx, 1.8, 0, sp - 8, 0.3, 6, '#6C8A92') // water basin (euripus)
  for (const x of [sx - sp / 2 - 4, sx + sp / 2 + 4]) {
    b.cyl(x, 0, 0, 4, 4, 2.6, C.marble, 16) // the turning posts: three gilded cones each
    for (const dz of [-2, 0, 2]) b.cone(x, 2.6, dz, 1.0, 6.5, C.gold || C.bronze, 10)
  }
  // Augustus's obelisk, brought from Heliopolis in 10 BC (now in the Piazza del Popolo)
  b.box(sx, 1.8, 0, 3.6, 3, 3.6, C.marble)
  b.cyl(sx, 4.8, 0, 1.4, 0.85, 23.7, '#B88F78', 4)
  b.cone(sx, 28.5, 0, 0.85, 1.4, C.bronze, 4)
  // seven eggs and seven bronze dolphins count the laps
  for (const [x, kind] of [[sx - 95, 'eggs'], [sx + 95, 'dolphins']]) {
    b.box(x, 1.8, 0, 7, 0.6, 2.4, C.marble)
    for (const dx of [-3.1, 3.1]) b.cyl(x + dx, 2.4, 0, 0.18, 0.18, 3.6, C.marble, 6)
    b.box(x, 6, 0, 7, 0.4, 1.2, C.marble)
    for (let i = 0; i < 7; i++) {
      if (kind === 'eggs') b.push(new THREE.SphereGeometry(0.28, 6, 4).scale(1, 1.4, 1), C.bronze, b.local(x - 2.4 + i * 0.8, 6.8, 0))
      else b.push(new THREE.BoxGeometry(0.7, 0.24, 0.2), C.bronze, b.local(x - 2.4 + i * 0.8, 6.7, 0, 0).multiply(new THREE.Matrix4().makeRotationZ(0.7)))
    }
  }
  // small shrines and statues on columns along the barrier
  for (const dx of [-140, -60, 30, 130]) {
    b.box(sx + dx, 1.8, 0, 5, 3.5, 4, C.marbleWarm)
    b.gable(sx + dx, 5.3, 0, 5.4, 1.2, 4.4, C.roof, Math.PI / 2)
  }
  for (const dx of [-115, -30, 60, 160]) {
    b.cyl(sx + dx, 1.8, 0, 0.45, 0.45, 7, C.marble, 8)
    b.box(sx + dx, 8.8, 0, 0.8, 1.9, 0.6, C.bronze)
  }

  // the gods' box (pulvinar) on the Palatine side, open to the crowd
  b.box(-40, 4.2, -(tW + 7), 22, 1.0, 10, C.marble)
  for (const dx of [-9, -3, 3, 9]) b.cyl(-40 + dx, 5.2, -(tW + 3), 0.45, 0.42, 7, C.marble, 8)
  b.box(-40, 12.2, -(tW + 7), 23, 1.2, 10.6, C.marble, 0, 1.03)
  b.gable(-40, 13.4, -(tW + 7), 23.4, 2.6, 11, C.roof, Math.PI / 2)
  return b.merge()
}

// people: a few out on the track, workmen at the works, crowds in the arcades and streets
function people() {
  const p = PLACES.circus
  const c = Math.cos(p.rot), s = Math.sin(p.rot)
  const W = (lx, lz) => [p.at[0] + lx * c + lz * s, p.at[1] - lx * s + lz * c]
  let seed = 31
  const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  const cols = ['#C9A06B', '#9C6B4A', '#7E6A55', '#A64B3C', '#5A6670', '#B9B19E', '#D8CBB0', '#8A7A5E', '#E9E3D4', '#B5643F']
  const items = []
  const add = (lx, lz, y = 0.2) => {
    const [x, z] = W(lx, lz)
    items.push([x, y, z, cols[Math.floor(r() * cols.length)]])
  }
  const n = LITE ? 160 : 360
  for (let i = 0; i < n; i++) {
    const k = r()
    if (k < 0.55) add(X0 + r() * (straight - X0), (r() < 0.5 ? -1 : 1) * (R + 4 + r() * 10)) // outside the arcades
    else if (k < 0.75) add(WORKS[0] + r() * (WORKS[1] - WORKS[0]), -(R + 6 + r() * 12)) // workmen
    else if (k < 0.85) add(X0 + 20 + r() * 400, (r() - 0.5) * 2 * (tW - 8)) // on the track
    else add(X0 + r() * (straight - X0), (r() < 0.5 ? -1 : 1) * (tW + 6 + r() * 8), 4.2 + r() * 8) // a few on the seats
  }
  return items
}

export function Circus() {
  const parts = useMemo(() => {
    const t0 = performance.now()
    const out = { stone: build(), crowd: people() }
    window.__circus = { ms: Math.round(performance.now() - t0), triangles: out.stone.attributes.position.count / 3 }
    return out
  }, [])
  const material = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.84, side: THREE.DoubleSide }), [])
  const now = useNow()
  return (
    <group>
      <mesh geometry={parts.stone} material={now ? GHOST : material} castShadow={!now} receiveShadow={!now} />
      {!now && <Crowd items={parts.crowd} />}
    </group>
  )
}
