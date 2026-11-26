// The Palatine in AD 100: Domitian's palace, finished in 92 by his architect
// Rabirius, where Trajan now lives (session 6).
// Plan after the excavated remains (Claridge; Turismo Roma; Parco archeologico
// del Colosseo): the Domus Flavia (state rooms: throne hall, basilica,
// lararium, peristyle with an octagonal labyrinth fountain, banquet hall with
// two oval fountains), the Domus Augustana (residence: upper peristyle with a
// pool and island shrine, lower sunken peristyle with a fountain, a curved
// façade over the Circus Maximus), the garden "stadium" (160 × 48 m) and the
// Domus Tiberiana on arcaded substructures above the Forum.
// Heights are our reconstruction: the walls stood over 30 m in the halls.
// Palace frame (PLACES.palace): x towards east-north-east, z towards south-
// south-east; -z looks down to the Forum, +z to the Circus Maximus.
import { useMemo } from 'react'
import * as THREE from 'three'
import { GHOST, useNow } from './era'
import { Builder, archPanelGeometry } from './geo'
import { PLACES } from './layout'
import { heightAt } from './terrain'
import { C } from './colours'

const WALL = '#E3D3B4' // stucco over brick-faced concrete
const WALL2 = '#D8C4A0'
const BRICK = '#B4704F'
const COL = '#EFE7D6'
const COL2 = '#C9A27E' // coloured marble shafts (giallo antico, pavonazzetto…)
const ROOF = C.roof
const WATER = '#5F8794'
const GREEN = '#6E8A4E'
const DARK = '#2C241E'
const PAVE = '#D9CDB4'

// a row of columns from (x0,z0) to (x1,z1) with an architrave on top
export function colonnade(b, x0, z0, x1, z1, y, h, step, hex = COL, r = 0.45) {
  const L = Math.hypot(x1 - x0, z1 - z0)
  const n = Math.max(1, Math.round(L / step))
  for (let i = 0; i <= n; i++) {
    const t = i / n
    b.cyl(x0 + (x1 - x0) * t, y, z0 + (z1 - z0) * t, r, r * 0.88, h, hex, 8)
  }
  const ry = Math.atan2(-(z1 - z0), x1 - x0)
  b.box((x0 + x1) / 2, y + h, (z0 + z1) / 2, L + r * 2, 0.9, r * 2.4, COL, ry)
}

// a courtyard with a portico on four sides; returns the inner open area
export function peristyle(b, cx, cz, w, d, y, h, step, o = {}) {
  const depth = o.depth ?? 5
  const x0 = cx - w / 2, x1 = cx + w / 2, z0 = cz - d / 2, z1 = cz + d / 2
  const ix0 = x0 + depth, ix1 = x1 - depth, iz0 = z0 + depth, iz1 = z1 - depth
  b.box(cx, y - 0.4, cz, w, 0.4, d, o.floor ?? PAVE)
  colonnade(b, ix0, iz0, ix1, iz0, y, h, step, o.col)
  colonnade(b, ix0, iz1, ix1, iz1, y, h, step, o.col)
  colonnade(b, ix0, iz0, ix0, iz1, y, h, step, o.col)
  colonnade(b, ix1, iz0, ix1, iz1, y, h, step, o.col)
  // lean-to portico roofs
  const rh = 1.6
  b.hip(cx, y + h + 0.9, z0 + depth / 2, w, rh, depth + 1, ROOF)
  b.hip(cx, y + h + 0.9, z1 - depth / 2, w, rh, depth + 1, ROOF)
  b.hip(x0 + depth / 2, y + h + 0.9, cz, depth + 1, rh, d - depth * 2, ROOF)
  b.hip(x1 - depth / 2, y + h + 0.9, cz, depth + 1, rh, d - depth * 2, ROOF)
  return { ix0, ix1, iz0, iz1 }
}

// a tall hall: walls, a band of clerestory windows, a gabled roof (ridge along z)
function hall(b, cx, cz, w, d, y, h, o = {}) {
  b.box(cx, y, cz, w, h, d, o.wall ?? WALL)
  const win = o.windows ?? Math.floor(w / 6)
  for (const side of [-1, 1]) {
    for (let i = 0; i < Math.floor(d / 6); i++) {
      const z = cz - d / 2 + 3 + i * 6
      b.box(cx + side * (w / 2 + 0.02), y + h - 7, z, 0.1, 4.2, 2.2, DARK)
    }
  }
  for (const side of [-1, 1]) for (let i = 0; i < win; i++) b.box(cx - w / 2 + 3 + i * 6, y + h - 7, cz + side * (d / 2 + 0.02), 2.2, 4.2, 0.1, DARK)
  b.box(cx, y + h - 0.6, cz, w + 1.2, 1.2, d + 1.2, o.wall ?? WALL, 0, 1.06) // cornice
  if (o.roof !== false) b.gable(cx, y + h, cz, w + 1.6, Math.min(w, d) * 0.22, d + 1.6, ROOF, o.ridgeX ? Math.PI / 2 : 0)
}

// an octagonal fountain shaped like a labyrinth (Domus Flavia peristyle)
function labyrinth(b, x, y, z, r) {
  b.at(...b._base)
  b.frame.multiply(new THREE.Matrix4().makeTranslation(x, y, z))
  b.disc(r, r, 0.1, '#CFC3A8', 8)
  for (let k = 1; k <= 4; k++) b.band(r * (k / 4.4), r * (k / 4.4), 0, 0.55, 0.35, '#E8DFCC', 8)
  b.disc(r * 0.22, r * 0.22, 0.6, '#E8DFCC', 8)
  b.at(...b._base)
}

function substructure(b, x0, x1, z, yTop, depth, tiers, face = 1) {
  // tiers of arches down a slope (brick-faced concrete), facing +z (face 1) or -z
  const bay = 8
  const n = Math.round((x1 - x0) / bay)
  for (let t = 0; t < tiers; t++) {
    const y = yTop - (t + 1) * 11
    for (let i = 0; i < n; i++) b.push(archPanelGeometry(bay, 11, 4.6, 8, 1.6), BRICK, b.local(x0 + (i + 0.5) * bay, y, z), 0.95 - t * 0.04)
  }
  b.box((x0 + x1) / 2, yTop - tiers * 11 - 30, z - face * depth / 2, x1 - x0, tiers * 11 + 30, depth, BRICK, 0, 0.8)
}

function build() {
  const b = new Builder()
  const p = PLACES.palace
  const Y = heightAt(p.at[0], p.at[1]) // the hilltop, about 40 m above the Forum
  b._base = [p.at[0], Y, p.at[1], p.rot]
  b.at(...b._base)

  // ===== the Domus Flavia: the state rooms (west) =====
  const FX = -95
  // forecourt (Area Palatina) and the porch along the north front
  b.box(FX + 10, -20, -132, 150, 20, 26, BRICK, 0, 0.85)
  b.box(FX + 10, -0.3, -132, 150, 0.3, 26, PAVE)
  colonnade(b, FX - 52, -119, FX + 52, -119, 0, 13, 4.4, COL2, 0.6)
  b.box(FX, 13.9, -116.5, 106, 1.1, 6, WALL, 0, 1.04)
  b.hip(FX, 15, -116.5, 106, 1.6, 6.5, ROOF)
  // the throne hall (aula regia): over 30 m high, the emperor's apse to the south
  hall(b, FX, -95, 32, 39, 0, 31)
  for (let i = 0; i < 4; i++) b.box(FX - 12 + i * 8, 2, -114.6, 2.6, 9, 0.2, DARK) // doors and niches on the front
  b.cyl(FX, 0, -74.5, 7, 7, 26, WALL, 14) // the apse
  // the basilica (west) and the lararium (east)
  hall(b, FX - 28, -97, 22, 35, 0, 24)
  b.cyl(FX - 28, 0, -79, 6, 6, 20, WALL, 12)
  hall(b, FX + 26, -99, 18, 31, 0, 20)
  // the peristyle: a pool almost filling the court, round an octagonal labyrinth
  const ps = peristyle(b, FX, -36, 64, 66, 0, 8.5, 3.9, { depth: 6 })
  b.box(FX, -0.9, -36, ps.ix1 - ps.ix0 - 4, 1.0, ps.iz1 - ps.iz0 - 4, WATER)
  labyrinth(b, FX, 0.1, -36, 12)
  // rooms round the peristyle (two storeys)
  for (const side of [-1, 1]) {
    b.box(FX + side * 41, 0, -36, 18, 15, 66, WALL2)
    b.hip(FX + side * 41, 15, -36, 18.6, 3, 66.6, ROOF)
    for (let i = 0; i < 9; i++) b.box(FX + side * 50.05, 8, -66 + i * 7.4, 0.1, 3, 1.8, DARK)
  }
  // the banquet hall (cenatio Iovis) opening onto the peristyle, an oval fountain on each side
  hall(b, FX, 18, 32, 30, 0, 23, { ridgeX: true })
  colonnade(b, FX - 14, 2.6, FX + 14, 2.6, 0, 11, 4, COL2, 0.6)
  for (const side of [-1, 1]) {
    const nx = FX + side * 31
    b.box(nx, 0, 18, 20, 9, 30, WALL2, 0, 0.94)
    b.box(nx, 9, 18, 13, 0.3, 18, WATER)
    b.at(...b._base)
    b.frame.multiply(new THREE.Matrix4().makeTranslation(nx, 9.3, 18))
    b.disc(4.5, 6.5, 0.05, '#E8DFCC', 24)
    b.band(4.5, 6.5, 0, 1.0, 0.5, COL, 24)
    b.at(...b._base)
  }
  // the west flank falls to the Velabrum on substructures
  b.box(FX - 50, -40, -20, 8, 40, 170, BRICK, 0, 0.85)

  // ===== the Domus Augustana: the residence (centre) =====
  const AX = 15
  // upper peristyle with a pool and a small shrine on an island
  const up = peristyle(b, AX, -20, 62, 58, 0, 7.5, 3.6, { depth: 5.5 })
  b.box(AX, -0.9, -20, up.ix1 - up.ix0 - 8, 1.0, up.iz1 - up.iz0 - 8, WATER)
  b.box(AX, -0.2, -20, 12, 0.6, 9, PAVE)
  b.box(AX, 0.4, -20, 6, 1.0, 8, COL)
  for (const dx of [-2.2, 2.2]) for (const dz of [-3.2, 0, 3.2]) b.cyl(AX + dx, 1.4, -20 + dz, 0.25, 0.22, 4, COL, 8)
  b.gable(AX, 5.4, -20, 6.2, 1.5, 8.4, ROOF)
  // wings round it
  for (const side of [-1, 1]) {
    b.box(AX + side * 39, 0, -18, 16, 14, 70, WALL2)
    b.hip(AX + side * 39, 14, -18, 16.6, 3, 70.6, ROOF)
  }
  b.box(AX, 0, -58, 94, 14, 18, WALL2)
  b.hip(AX, 14, -58, 94.6, 3, 18.6, ROOF)
  // the lower peristyle, sunk about 10 m into the hill towards the Circus
  // (the lower peristyle lay about 10 m below the upper one; our hill is a flat
  // plateau here, so we keep it at the same level and say so on the card)
  const LY = 0
  const lo = peristyle(b, AX, 60, 46, 44, LY, 7.5, 3.7, { depth: 5 })
  // fountain: a square basin with four crescent-shaped islands (peltae)
  b.box(AX, LY - 0.9, 60, 20, 1.0, 20, WATER)
  for (const [dx, dz] of [[-4.5, 0], [4.5, 0], [0, -4.5], [0, 4.5]]) b.cyl(AX + dx, LY, 60 + dz, 2.6, 2.6, 0.6, '#E8DFCC', 10)
  // two-storey rooms on three sides, rising to the upper level
  for (const side of [-1, 1]) {
    b.box(AX + side * 33, LY, 60, 20, 24.5, 44, WALL2, 0, 0.97)
    b.hip(AX + side * 33, LY + 24.5, 60, 20.6, 3, 44.6, ROOF)
    for (let s = 0; s < 2; s++) for (let i = 0; i < 6; i++) b.box(AX + side * 23.05, LY + 2.5 + s * 9, 42 + i * 7, 0.1, 4, 2.2, DARK)
  }
  b.box(AX, LY, 23.5, 46, 24.5, 29, WALL2, 0, 0.97)
  b.box(AX, LY, 89, 68, 20, 14, WALL2, 0, 0.97) // rooms behind the curved façade
  b.hip(AX, LY + 20, 89, 68.6, 3, 14.6, ROOF)
  b.hip(AX, LY + 24.5, 23.5, 46.6, 3, 29.6, ROOF)
  // the great curved façade over the Circus Maximus: a concave exedra on substructures
  {
    const R = 34, cz = 112, segs = 16
    for (let i = 0; i < segs; i++) {
      const a0 = (i / segs) * Math.PI, a1 = ((i + 1) / segs) * Math.PI
      const am = (a0 + a1) / 2
      const x = AX + Math.cos(am) * R, z = cz - Math.sin(am) * R * 0.55
      const len = R * (a1 - a0) * 1.06
      const ry = am - Math.PI / 2
      b.box(x, -40, z, len, 40 + LY + 20, 3, WALL, ry, 0.96)
      for (let s = 0; s < 3; s++) b.box(x - Math.cos(am) * 1.6, -14 + s * 9, z + Math.sin(am) * 1.6 * 0.55, 2.6, 5.5, 0.2, DARK, ry)
      b.cyl(x - Math.cos(am) * 3.2, -6, z + Math.sin(am) * 3.2 * 0.55, 0.5, 0.45, 9, COL, 8)
    }
  }
  // terraces south of the palace to the edge of the hill, held up by arches
  b.box(-64, -40, 113, 172, 40, 34, BRICK, 0, 0.8)
  b.box(-64, -0.1, 113, 172, 0.2, 34, GREEN)
  b.box(71, -40, 121, 38, 40, 18, BRICK, 0, 0.8)
  b.box(71, -0.1, 121, 38, 0.2, 18, PAVE)
  b.box(AX, -40, 121.5, 68, 40, 17, BRICK, 0, 0.8)
  b.box(AX, -0.1, 121.5, 68, 0.2, 17, PAVE)
  // the south front of the whole palace, on two tiers of arches
  substructure(b, -150, 90, 130, 0, 14, 2)

  // ===== the garden "stadium": 160 × 48 m, sunk below the palace (east) =====
  {
    const SX = 112, SZ = 10, L = 160, W = 48, FY = 0.3 // it was sunk below the palace; see the note on the card
    const hL = L / 2, hW = W / 2
    // outer walls up to the palace level, the floor below
    b.box(SX, FY - 2, SZ - 12, W, 2, L - hW, GREEN) // garden
    b.at(...b._base)
    b.frame.multiply(new THREE.Matrix4().makeTranslation(SX, 0, SZ + hL - hW))
    b.disc(hW, hW, FY, GREEN, 24)
    b.at(...b._base)
    // the curved south end
    for (let i = 0; i < 12; i++) {
      const a = ((i + 0.5) / 12) * Math.PI
      b.box(SX + Math.cos(a) * (hW + 1), FY - 10, SZ + hL - hW + Math.sin(a) * (hW + 1), 2, 26, (hW * Math.PI) / 12 + 0.6, WALL2, -a, 0.95)
    }
    for (const side of [-1, 1]) b.box(SX + side * (hW + 1), FY - 10, SZ - 12, 2, 26, L - hW, WALL2, 0, 0.95)
    b.box(SX, FY - 10, SZ - hL - 1, W + 4, 26, 2, WALL2, 0, 0.95)
    // a two-storey portico round the inside
    for (const side of [-1, 1]) {
      colonnade(b, SX + side * (hW - 4.5), SZ - hL + 4.5, SX + side * (hW - 4.5), SZ + hL - hW, FY, 6, 4.2, COL2, 0.42)
      colonnade(b, SX + side * (hW - 4.5), SZ - hL + 4.5, SX + side * (hW - 4.5), SZ + hL - hW, FY + 6.9, 5.2, 4.2, COL, 0.36)
      b.box(SX + side * (hW - 2.2), FY + 6, SZ - 12, 4.6, 0.9, L - hW, WALL2)
      b.hip(SX + side * (hW - 2.2), FY + 13, SZ - 12, 5.6, 1.4, L - hW, ROOF)
    }
    colonnade(b, SX - hW + 4.5, SZ - hL + 4.5, SX + hW - 4.5, SZ - hL + 4.5, FY, 6, 4.2, COL2, 0.42)
    // garden: paths, beds, two semicircular fountains, rows of trees
    b.box(SX, FY, SZ - 12, 3, 0.08, L - hW - 20, PAVE)
    for (const dz of [-hL + 14, hL - hW - 6]) {
      b.at(...b._base)
      b.frame.multiply(new THREE.Matrix4().makeTranslation(SX, FY + 0.05, SZ + dz))
      b.disc(6, 6, 0.02, WATER, 20)
      b.band(6, 6, 0, 0.6, 0.4, COL, 20)
      b.at(...b._base)
    }
    for (const side of [-1, 1]) {
      for (let i = 0; i < 12; i++) {
        const z = SZ - hL + 14 + i * 9.5
        b.cyl(SX + side * 9, FY, z, 0.18, 0.18, 1.6, '#5B4636', 5)
        b.cone(SX + side * 9, FY + 1.4, z, 0.9, 6.5, '#3F5A35', 7) // cypress
      }
    }
    // the emperor's box: a great exedra in the middle of the east side
    b.box(SX + hW + 8, FY, SZ, 14, 22, 26, WALL, 0, 0.98)
    b.box(SX + hW + 0.6, FY + 8, SZ, 0.3, 7, 12, DARK)
    b.hip(SX + hW + 8, FY + 22, SZ, 14.6, 3, 26.6, ROOF)
  }

  // ===== the Domus Tiberiana, on arcades above the Forum (north-west) =====
  {
    const TX = -88, TZ = -178
    b.box(TX, -50, TZ, 130, 50, 66, BRICK, 0, 0.82) // the platform
    substructure(b, TX - 64, TX + 64, TZ - 33, 0, 4, 3, -1)
    const t = peristyle(b, TX, TZ, 110, 52, 0, 7, 4.2, { depth: 6 })
    b.box(TX, -0.3, TZ, t.ix1 - t.ix0 - 4, 0.35, t.iz1 - t.iz0 - 4, GREEN)
    b.box(TX, -0.9, TZ, 30, 1.0, 12, WATER) // fishpond
    for (const side of [-1, 1]) {
      b.box(TX, 0, TZ + side * 30, 116, 12, 8, WALL2)
      b.hip(TX, 12, TZ + side * 30, 116.6, 2.5, 8.6, ROOF)
      for (let i = 0; i < 18; i++) b.box(TX - 54 + i * 6.3, 6, TZ + side * 34.05, 1.6, 3, 0.1, DARK)
    }
  }
  return b.merge()
}

export function Palatine() {
  const geometry = useMemo(() => {
    const t0 = performance.now()
    const g = build()
    window.__palatine = { ms: Math.round(performance.now() - t0), triangles: g.attributes.position.count / 3 }
    return g
  }, [])
  const material = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.84, side: THREE.DoubleSide }), [])
  const now = useNow()
  return <mesh geometry={geometry} material={now ? GHOST : material} castShadow={!now} receiveShadow={!now} />
}
