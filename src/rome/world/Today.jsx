// Rome today (session 8): what still stands of the AD 100 city, in weathered
// stone, and the great buildings put up after AD 100, in blue-grey. Drawn only
// in "today" mode, on top of the ghost of the AD 100 city. Sources and the
// Documented / Inferred / Invented split: HISTORY.md and FACT-CHECK-ROME.md.
import { useMemo } from 'react'
import * as THREE from 'three'
import { Builder } from './geo'
import { PLACES, VIA_FORI } from './layout'
import { heightAt } from './terrain'
import { T } from './era'
import { CIRCUS } from './Circus'

function at(b, name, y) {
  const p = PLACES[name]
  const g = y ?? heightAt(p.at[0], p.at[1])
  b.at(p.at[0], g, p.at[1], p.rot)
  return g
}
const shift = (b, x, y, z, ry = 0) => b.frame.multiply(new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), ry), new THREE.Vector3(1, 1, 1)))

// The column grid of a temple, worked out exactly as in Forum.jsx, so the
// survivors stand where the AD 100 columns stand.
function grid({ w, d, cols = 6 }) {
  const r = Math.min(0.8, ((w - 2) / cols) * 0.16)
  const inset = r * 1.7
  const xs = []
  for (let i = 0; i < cols; i++) xs.push(-w / 2 + inset + ((w - 2 * inset) * i) / (cols - 1))
  return { r, xs, space: (w - 2 * inset) / (cols - 1), zFront: d / 2 - inset }
}
function column(b, x, y, z, r, h, hex) {
  b.box(x, y, z, r * 2.6, 0.45, r * 2.6, hex, 0, 0.96)
  b.cyl(x, y + 0.45, z, r, r * 0.86, h - 1.35, hex, 10)
  b.box(x, y + h - 0.9, z, r * 2.5, 0.9, r * 2.5, hex, 0, 1.04)
}
// a stretch of entablature over columns from (x0, z0) to (x1, z1)
function beam(b, x0, z0, x1, z1, y, h, w, hex) {
  const len = Math.hypot(x1 - x0, z1 - z0) + w
  b.box((x0 + x1) / 2, y, (z0 + z1) / 2, len, h, w, hex, -Math.atan2(z1 - z0, x1 - x0), 0.98)
}
// the podium as it is now: the concrete core, its marble facing stripped
function core(b, w, h, d, hex = T.ruinDark) {
  b.box(0, 0, 0, w, h, d, hex, 0, 0.95)
  b.box(0, h - 0.3, 0, w * 0.96, 0.3, d * 0.96, hex, 0, 1.06)
}

function forumToday(b) {
  // the Forum square: the paving survives in patches, the rest is earth
  at(b, 'forum')
  b.box(0, -0.1, 0, 120, 0.2, 52, '#CFC3AA')
  for (const [x, z, w, d] of [[-30, -8, 22, 12], [12, 6, 30, 14], [40, -12, 16, 10]]) b.box(x, 0.1, z, w, 0.06, d, T.paving)

  // Temple of Saturn: the podium core and eight granite columns of the porch,
  // six across the front and one more down each side, with their beam.
  {
    const o = { w: 22, d: 40, podium: 9, colH: 11, cols: 6 }
    at(b, 'saturn')
    core(b, o.w, o.podium, o.d)
    const { r, xs, space, zFront } = grid(o)
    const pts = xs.map((x) => [x, zFront]).concat([[xs[0], zFront - space], [xs[5], zFront - space]])
    for (const [x, z] of pts) column(b, x, o.podium, z, r, o.colH, '#B9AEA2')
    const top = o.podium + o.colH
    beam(b, xs[0], zFront, xs[5], zFront, top, 2.6, r * 3, T.marble)
    beam(b, xs[0], zFront, xs[0], zFront - space, top, 2.6, r * 3, T.marble)
    beam(b, xs[5], zFront, xs[5], zFront - space, top, 2.6, r * 3, T.marble)
  }
  // Temple of Vespasian: the podium core and three columns of the porch's
  // south-east corner (two on the front, one on the side) with their beam.
  {
    const o = { w: 22, d: 33, podium: 6.5, colH: 14, cols: 6 }
    at(b, 'vespasian')
    core(b, o.w, o.podium * 0.8, o.d)
    const { r, xs, space, zFront } = grid(o)
    const top = o.podium + o.colH
    for (const [x, z] of [[xs[0], zFront], [xs[1], zFront], [xs[0], zFront - space]]) column(b, x, o.podium * 0.8, z, r, o.colH + o.podium * 0.2, T.marble)
    beam(b, xs[0], zFront, xs[1], zFront, top, 2.4, r * 3, T.marble)
    beam(b, xs[0], zFront, xs[0], zFront - space, top, 2.4, r * 3, T.marble)
  }
  // Temple of Castor: the tall podium core and three columns on its east side.
  {
    const o = { w: 32, d: 50, podium: 7, colH: 12.5, cols: 8 }
    at(b, 'castor')
    core(b, o.w * 0.92, o.podium, o.d * 0.92)
    const { r, xs, space, zFront } = grid(o)
    const z0 = zFront - 3 * space // behind the porch, where the side colonnade starts (Inferred)
    for (let i = 0; i < 3; i++) column(b, xs[0], o.podium, z0 - i * space, r, o.colH, T.marble)
    beam(b, xs[0], z0, xs[0], z0 - 2 * space, o.podium + o.colH, 3.75, r * 3, T.marble)
  }
  // Concord, Divus Julius, the Rostra: only cores and footings
  at(b, 'concord')
  b.box(0, 0, -3, 45, 2.2, 24, T.ruinDark, 0, 0.95)
  at(b, 'divusJulius')
  core(b, 24, 2.6, 26)
  b.box(0, 0, 18.5, 26, 2.2, 7, T.ruinDark, 0, 0.9)
  b.box(0, 0, 22.1, 6, 2, 0.4, '#6E6252') // the round niche, now with a modern roof (left out)
  at(b, 'rostra')
  b.box(0, 0, 0, 24, 3, 12, T.brick, 0, 0.92)

  // The Senate house stands to its full height: Diocletian's rebuilding of
  // 284–305, a church from about 630, restored in 1930–36. Brick, no stucco.
  at(b, 'curia')
  b.box(0, 0, 0, 18, 1.2, 27, T.ruinDark)
  b.box(0, 1.2, 0, 18, 21.6, 27, T.brick, 0, 0.96)
  for (let i = -1; i <= 1; i++) b.box(i * 4.2, 14, 13.56, 2.6, 5.4, 0.15, '#3A312A')
  b.box(0, 1.2, 13.56, 4.6, 7.6, 0.2, '#4E5A46') // the bronze doors are copies; the originals are at St John Lateran
  b.gable(0, 22.8, 0, 18.4, 4.6, 27.4, '#9B6A55')

  // The Basilica Julia: its floor and the stumps of its piers.
  at(b, 'basilicaJulia')
  b.box(0, 0, 0, 101, 1.2, 49, '#D9CFBC')
  for (let i = 0; i < 18; i++) for (const z of [-17, -9, 9, 17]) b.box(-47.5 + i * 5.6, 1.2, z, 1.6, 0.8 + ((i * 7 + z) % 3) * 0.6, 1.6, T.ruin, 0, 0.95)
  // The Basilica Aemilia: the floor, a few column drums set back up.
  at(b, 'basilicaAemilia')
  shift(b, 0, 0, 0, Math.PI)
  b.box(0, 0, 0, 90, 1, 29, '#D2C6B0')
  for (let i = 0; i < 6; i++) b.cyl(-30 + i * 11, 1, -12, 0.55, 0.5, 2 + (i % 3) * 1.6, T.marble, 8)
  b.box(0, 0, -20, 92, 2.2, 9, T.ruin, 0, 0.92)

  // Vesta: the round podium and a short arc of its columns, set back up in 1930.
  at(b, 'vesta')
  b.cyl(0, 0, 0, 7.5, 7.5, 2.6, T.ruinDark, 20)
  for (let i = 0; i < 4; i++) {
    const a = Math.PI * 0.9 + i * ((Math.PI * 2) / 20)
    column(b, Math.cos(a) * 6.6, 2.6, Math.sin(a) * 6.6, 0.26, 8.5, T.marble)
  }
  for (let i = 0; i < 3; i++) {
    const p = Math.PI * 0.9 + (i + 0.5) * ((Math.PI * 2) / 20)
    b.box(Math.cos(p) * 6.6, 11.1, Math.sin(p) * 6.6, 2.2, 1.5, 0.9, T.marble, -p + Math.PI / 2) // the beam
  }
  // the Regia and the House of the Vestals: low walls; the pools are still there
  at(b, 'regia')
  b.box(0, 0, 0, 20, 1.2, 14, T.ruin, 0, 0.9)
  at(b, 'vestals')
  for (const [x, z, w, d] of [[0, -19, 70, 7], [0, 19, 70, 7], [-32, 0, 6, 31], [32, 0, 6, 31]]) b.box(x, 0, z, w, 2.4, d, T.brick, 0, 0.94)
  b.box(0, 0, 0, 58, 0.5, 31, T.grass)
  for (const x of [-15, 0, 15]) b.box(x, 0.5, 0, 9, 0.1, 5, T.water)

  // The Tabularium's arcade still carries a building: the Palazzo Senatorio,
  // Rome's city hall, rebuilt from the 1540s on Michelangelo's plan.
  at(b, 'tabularium')
  b.box(0, -14, 0, 73, 18, 20, T.ruin, 0, 0.94)
  for (let i = 0; i < 11; i++) b.arched(-30 + i * 6, -2, 10.2, 6, 10, 0.8, 3.4, 7.5, T.ruin, 0, 1.03)
  b.box(0, 4, -2, 73, 24, 22, T.later, 0, 0.98)
  b.box(0, 28, -2, 74, 1.2, 23, T.laterLight)
  b.box(0, 29.2, -6, 9, 22, 9, T.later) // the bell tower
  b.box(0, 51.2, -6, 6, 6, 6, T.laterLight)

  // The Arch of Titus: freed from the medieval Frangipane fortress and
  // restored by Stern and Valadier (1817–21), the new parts in travertine.
  at(b, 'archTitus')
  const pier = (13.5 - 5.4) / 2
  b.box(-13.5 / 2 + pier / 2, 0, 0, pier, 15.4 * 0.72, 4.75, T.ruin)
  b.box(13.5 / 2 - pier / 2, 0, 0, pier, 15.4 * 0.72, 4.75, T.ruin)
  b.box(-13.5 / 2 + pier / 2 + (pier * 0.2), 0, 0, pier * 0.6, 15.4 * 0.72, 4.8, T.marble) // the original core
  b.box(13.5 / 2 - pier / 2 - (pier * 0.2), 0, 0, pier * 0.6, 15.4 * 0.72, 4.8, T.marble)
  b.box(0, 15.4 * 0.72 - 1.35, 0, 5.4, 1.35, 4.75, T.marble, 0, 0.96)
  b.box(0, 15.4 * 0.72, 0, 13.5, 15.4 * 0.28, 4.75, T.ruin)
  b.box(0, 15.4 * 0.72, 0, 5.4, 15.4 * 0.28, 4.8, T.marble)
}

// ---------- built after AD 100 ----------
function arch3(b, { w, h, d, cw, ch, sw, sh, hex }) {
  // a triumphal arch with three bays: a high centre and two lower sides
  const sp = (w - cw - 2 * sw) / 4 // pier width
  const xs = [-w / 2 + sp / 2, -cw / 2 - sp / 2, cw / 2 + sp / 2, w / 2 - sp / 2]
  for (const x of xs) b.box(x, 0, 0, sp, ch, d, hex)
  for (const s of [-1, 1]) b.box(s * (cw / 2 + sp + sw / 2), sh, 0, sw, ch - sh, d, hex, 0, 0.97)
  b.box(0, ch, 0, w, h - ch, d, hex, 0, 0.99)
  b.box(0, h - (h - ch) * 0.42, 0, w + 0.4, 0.5, d + 0.4, hex, 0, 1.05)
}
function laterBuildings(b) {
  // Arch of Septimius Severus, AD 203: 25 m wide, 23 m high, about 12 m deep.
  at(b, 'severus')
  arch3(b, { w: 25, h: 23, d: 11.85, cw: 7, ch: 12.2, sw: 3, sh: 7.5, hex: T.later })
  // Column of Phocas, AD 608: a reused 13.6 m column on a stepped base.
  at(b, 'phocas')
  for (let i = 0; i < 4; i++) b.box(0, i * 0.7, 0, 9 - i * 1.6, 0.7, 9 - i * 1.6, T.laterDark, 0, 0.96)
  b.box(0, 2.8, 0, 3.2, 3, 3.2, T.later)
  b.cyl(0, 5.8, 0, 0.7, 0.6, 12.6, T.later, 12)
  b.box(0, 18.4, 0, 1.8, 1, 1.8, T.laterLight)
  // Temple of Antoninus and Faustina, AD 141: ten columns of the porch still
  // stand, with the church of San Lorenzo in Miranda (1602) built behind them.
  at(b, 'antoninus')
  {
    const w = 20, d = 33, podium = 5, colH = 17
    b.box(0, 0, 0, w, podium, d, T.laterDark)
    const g = grid({ w, d, cols: 6 })
    for (let row = 0; row < 3; row++) {
      const xs = row === 0 ? g.xs : [g.xs[0], g.xs[5]]
      for (const x of xs) column(b, x, podium, g.zFront - row * g.space, 0.75, colH, T.later)
    }
    b.box(0, podium + colH, g.zFront - g.space, w, 3, g.space * 2 + 2, T.later)
    b.box(0, podium, -4, w - 1, 16, d - 12, T.later, 0, 0.96) // the cella walls
    b.box(0, podium + 16, -4, w - 2, 10, 2, T.laterLight) // the church's baroque front, set back inside
    b.gable(0, podium + 19, -6, w - 1, 4, d - 16, T.laterDark)
  }
  // Basilica of Maxentius, 308–312, finished by Constantine: a 100 × 65 m
  // platform; the north aisle stands, three bays 20.5 m wide, 17.5 m deep and
  // 24.5 m high, open to the vanished nave.
  at(b, 'maxentius')
  b.box(0, 0, 0, 100, 1.4, 65, T.laterDark, 0, 0.95)
  for (const z of [-32, 32]) b.box(0, 1.4, z, 100, 2.4, 1.6, T.later, 0, 0.92)
  for (const x of [-50, 50]) b.box(x, 1.4, 0, 1.6, 2.4, 65, T.later, 0, 0.92)
  for (let i = -1; i <= 1; i++) {
    b.arched(i * 22, 1.4, -14.8, 22, 24.5, 2.2, 18.5, 20.5, T.later)
    b.box(i * 22, 1.4, -31.5, 22, 24.5, 2.4, T.later, 0, 0.94) // back wall
  }
  for (const x of [-33, -11, 11, 33]) b.box(x, 1.4, -23.2, 2.6, 24.5, 17.5, T.later, 0, 0.97) // the cross walls
  b.box(0, 25.9, -23.2, 68, 2.4, 19, T.laterDark)
  // the stumps of the great piers of the nave
  for (const x of [-22, 22]) for (const z of [-12.5, 12.5]) b.box(x, 1.4, z, 5, 3 + (x > 0 ? 2 : 0), 5, T.later)
  // Temple of Venus and Roma, dedicated 135 by Hadrian: the platform, the
  // stumps of the colonnade, and the back-to-back apses (rebuilt by Maxentius).
  at(b, 'venusRoma')
  b.box(0, 0, 0, 145, 2.4, 100, T.laterDark, 0, 0.95)
  b.box(0, 2.4, 0, 108, 1.2, 50, T.later)
  for (let i = 0; i < 20; i++) for (const z of [-23, 23]) b.cyl(-51 + i * 5.4, 3.6, z, 0.8, 0.8, 1.2 + (i % 4) * 0.5, T.later, 8)
  for (const s of [-1, 1]) {
    b.push(new THREE.CylinderGeometry(9.5, 9.5, 21, 16, 1, true, s > 0 ? 0 : Math.PI, Math.PI), T.later, b.local(s * 1, 3.6 + 10.5, 0, 0))
    b.box(s * 14, 3.6, 0, 26, 12, 22, T.later, 0, 0.94)
  }
  b.box(-58, 3.6, 18, 9, 38, 9, T.laterLight) // bell tower of Santa Francesca Romana (Inferred height)
  // Arch of Constantine, AD 315: 21 m high, 25.9 m wide, 7.4 m deep; the
  // middle bay 11.5 × 6.5 m, the sides 7.4 × 3.4 m.
  at(b, 'constantine')
  arch3(b, { w: 25.9, h: 21, d: 7.4, cw: 6.5, ch: 11.5, sw: 3.4, sh: 7.4, hex: T.later })
  // The Pantheon as Hadrian rebuilt it, about 113–125: a rotunda 43.3 m across
  // and as high, with a portico of sixteen columns.
  at(b, 'pantheon')
  shift(b, 0, 0, 0, Math.PI) // Hadrian turned it to face north; Agrippa's faced south
  b.cyl(0, 0, -6, 23, 23, 30, T.later, 32)
  b.push(new THREE.SphereGeometry(22.8, 32, 10, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.62, 1), T.later, b.local(0, 30, -6))
  b.box(0, 0, 21, 33, 1.6, 16, T.laterDark)
  for (let i = 0; i < 8; i++) for (const z of [26, 22, 18]) if (z === 26 || i === 0 || i === 7 || i === 2 || i === 5) column(b, -14 + i * 4, 1.6, z, 0.75, 14, T.later)
  b.box(0, 15.6, 21, 33, 2.4, 15, T.later)
  b.gable(0, 18, 21, 33, 6, 15, T.laterDark)
  // The Vittoriano, 1885–1935: 135 m wide, 130 m deep, 70 m high, white
  // Botticino marble; its front faces north to Piazza Venezia.
  at(b, 'vittoriano')
  {
    const W = T.laterLight
    b.box(0, 0, 10, 135, 14, 110, W, 0, 0.94) // the base terraces
    for (let i = 0; i < 6; i++) b.box(0, i * 2.3, -50 - i * 5.5, 41, 2.3, 34 - i * 5.5, W, 0, 0.98) // the stairs
    b.box(0, 14, 5, 120, 10, 80, W, 0, 0.97)
    b.box(0, 24, 10, 72, 8, 26, W) // the colonnade's base
    for (let i = 0; i < 16; i++) b.cyl(-34 + i * 4.55, 32, 0, 0.9, 0.8, 15, W, 10)
    b.box(0, 47, 10, 74, 5, 26, W)
    for (const s of [-1, 1]) {
      b.box(s * 40, 24, 10, 14, 32, 28, W, 0, 0.98) // the propylaea
      b.box(s * 40, 56, 10, 6, 6, 9, '#8A7A52') // the bronze quadrigas
    }
    b.box(0, 14, -38, 14, 12, 14, W) // the Altar of the Fatherland
    b.box(0, 26, -38, 5, 12, 9, '#7A6C48') // the king on his horse, in bronze
  }
}

// Via dei Fori Imperiali, 1932: about 30 m wide, cut straight through the
// imperial forums and across the levelled Velia.
function road(b) {
  const [[x0, z0], [x1, z1]] = VIA_FORI
  const len = Math.hypot(x1 - x0, z1 - z0), n = Math.ceil(len / 20)
  const ry = -Math.atan2(z1 - z0, x1 - x0)
  b.at(0, 0, 0, 0)
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n
    const x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t
    const y = Math.max(heightAt(x, z), heightAt(x + 12, z), heightAt(x - 12, z), heightAt(x, z + 12), heightAt(x, z - 12)) + 0.15
    b.box(x, y, z, len / n + 1, 0.35, 30, T.road, ry, 0.98 + (i % 2) * 0.03)
    b.box(x, y + 0.35, z, len / n + 1, 0.05, 0.4, '#E8E4D8', ry) // the centre line
  }
}

// The Circus Maximus today: a long grass park in the shape of the track.
function circusPark(b) {
  const p = PLACES.circus
  b.at(p.at[0], heightAt(p.at[0], p.at[1]) + 0.25, p.at[1], p.rot)
  const L = CIRCUS.L, W = CIRCUS.W
  b.box(-W / 4, 0, 0, L - W / 2, 0.3, W * 0.86, T.grass, 0, 0.98)
  b.push(new THREE.CylinderGeometry(W * 0.43, W * 0.43, 0.3, 24, 1, false, 0, Math.PI), T.grass, b.local(L / 2 - W / 2, 0.15, 0, Math.PI))
  b.box(0, 0.3, 0, L - 2 * W, 0.4, 8, '#93A57A') // the line of the old central barrier
  // excavated seating at the curved end, and the medieval Frangipane tower
  for (let i = 0; i < 6; i++) {
    const a = (i / 5 - 0.5) * Math.PI * 0.8
    b.box(L / 2 - W / 2 + Math.cos(a) * 52, 0, Math.sin(a) * 52, 8, 4 + (i % 2) * 2, 12, T.ruin, -a)
  }
  b.box(L / 2 - 30, 0, 40, 8, 18, 8, T.later)
}

let cache = null // built the first time "today" is switched on, then kept
function build() {
  if (cache) return cache
  {
    const t0 = performance.now()
    const b = new Builder()
    forumToday(b)
    laterBuildings(b)
    road(b)
    circusPark(b)
    cache = b.merge()
    window.__today = { ms: Math.round(performance.now() - t0), triangles: cache.attributes.position.count / 3 }
  }
  return cache
}

export function Today({ on }) {
  const geometry = useMemo(() => (on ? build() : null), [on])
  const material = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, side: THREE.DoubleSide }), [])
  if (!on || !geometry) return null
  return <mesh geometry={geometry} material={material} castShadow receiveShadow />
}
