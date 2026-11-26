// Everyday Rome, AD 100: one street in the Subura (session 5).
// The street follows the line of the Argiletum from the firewall of the Forum
// of Augustus towards the Clivus Suburanus. Everything on it is our
// reconstruction (Invented), built from what is known elsewhere:
//  - apartment blocks (insulae) of four or five storeys, under the height
//    limits of Augustus (70 ft) and Trajan (60 ft, about 18 m);
//  - shops (tabernae) with wide doorways, wooden shutters and a mezzanine
//    lit by a window over the door, as excavated at Ostia;
//  - porticoes in front of the blocks, as Nero ordered after the fire of 64,
//    with flat roofs used as terraces (Tacitus, Annals 15.43; Suetonius, Nero 16);
//  - a bakery with lava mills and a domed oven, a food bar with jars set in the
//    counter (Pompeii, Ostia); a street fountain (Frontinus counts 591) and a
//    crossroads shrine of the Lares (Pliny counts 265 in AD 73);
//  - no carts: wheeled traffic was barred from the streets by day.
// Street frame: x along (towards the north-east), z across (+z south-east).
import { useMemo } from 'react'
import * as THREE from 'three'
import { GHOST, useNow } from './era'
import { Builder, archPanelGeometry } from './geo'
import { PLACES, STREET, streetPoint } from './layout'
import { heightAt } from './terrain'
import { C } from './colours'
import { Crowd } from './Colosseum'
import { patchStandard } from '../../design/patch'

const COARSE = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
const FORCED = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('q')
const LITE = FORCED === 'low' || (COARSE && FORCED !== 'high')

const { y: Y, half: HALF, front: FRONT, cross: XC } = STREET
const XEND = 96 // north-east end of the detailed street
const ALLEY = 2.6 // half-width of the side lane
const CURB = 0.28 // pavement height above the carriageway
const G1 = 4.2 // ground floor with the shop mezzanine
const FH = 3.15 // upper floors

const PAL = {
  plaster: ['#D9B98C', '#CFA376', '#E2CBA4', '#C99A6E', '#DCC49A', '#D2AE80', '#E6D3AE'],
  brick: ['#A8603F', '#B06A4A', '#9E5A3E', '#B3714F'],
  roof: ['#A8553A', '#B3603F', '#9A4C34', '#B86A48', '#8F4733'],
  shutter: ['#6B4F35', '#5E4630', '#5D6A4A', '#7A5536', '#4F5B4E'],
  cloth: ['#A6402F', '#C7953F', '#3F5F78', '#E8DFC9', '#7D2E3A', '#5E7A49', '#D7B46A'],
  tunic: ['#C9A06B', '#9C6B4A', '#7E6A55', '#A64B3C', '#5A6670', '#B9B19E', '#D8CBB0', '#8A7A5E', '#6B4A38', '#E9E3D4', '#4E5E4A', '#B5643F'],
}
const DARK = '#2A221C'
const INSIDE = '#4A3B2F'
const WOOD = '#7A5A3C'
const TRAV = '#D8CDB5'

function rng(seed) {
  let s = seed
  return () => ((s = (s + 0x6d2b79f5) | 0), (((s ^ (s >>> 15)) * (1 | s)) >>> 0) / 4294967296)
}

// A box tilted about the street axis (x): awnings and leaning things.
function tilted(b, x, y, z, w, h, d, tilt, hex) {
  const m = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(tilt, 0, 0)), new THREE.Vector3(1, 1, 1))
  return b.push(new THREE.BoxGeometry(w, h, d), hex, m)
}

function amphora(b, x, y, z, hex = '#B5774F') {
  b.cyl(x, y + 0.18, z, 0.2, 0.22, 0.55, hex, 7)
  b.cone(x, y + 0.73, z, 0.21, 0.22, hex, 7)
  b.cyl(x, y + 0.9, z, 0.05, 0.05, 0.14, hex, 5)
  b.push(new THREE.ConeGeometry(0.2, 0.2, 7).rotateX(Math.PI), hex, b.local(x, y + 0.08, z))
}

// ---------- one apartment block (insula) ----------
// x0..x1 along the street, side s = +1 / -1, ground-floor use `kind`.
function insula(b, rand, x0, x1, s, o = {}) {
  const w = x1 - x0, cx = (x0 + x1) / 2
  const storeys = o.storeys ?? (rand() < 0.55 ? 5 : 4)
  const H = G1 + (storeys - 1) * FH // 13.65 or 16.8 m: under Trajan's 60 feet
  const D = o.depth ?? 19 + rand() * 4
  const portico = o.portico ?? rand() < 0.4
  const fz = portico ? FRONT + 3 : FRONT
  const brick = rand() < 0.35
  const wall = brick ? PAL.brick[Math.floor(rand() * PAL.brick.length)] : PAL.plaster[Math.floor(rand() * PAL.plaster.length)]
  const Z = (z) => s * z
  const deep = o.shopDepth ?? 4.6

  // upper storeys and the back of the ground floor
  b.box(cx, G1, Z(fz + D / 2), w - 0.15, H - G1, D, wall)
  b.box(cx, -0.6, Z(fz + deep + (D - deep) / 2), w - 0.15, G1 + 0.6, D - deep, wall, 0, 0.72)
  // shop floors at pavement height
  b.box(cx, -0.4, Z(fz + deep / 2), w - 0.15, 0.4 + CURB, deep, '#8C7D69')

  // ground floor: shops between piers, a lintel band with mezzanine windows
  const bays = Math.max(1, Math.round(w / (o.bay ?? 4.7)))
  const bw = w / bays
  for (let i = 0; i <= bays; i++) {
    const px = x0 + i * bw
    const pw = i === 0 || i === bays ? 0.7 : 0.95
    b.box(THREE.MathUtils.clamp(px, x0 + pw / 2, x1 - pw / 2), CURB, Z(fz + 0.45), pw, G1 - CURB, 0.9, wall, 0, 0.86)
    if (i > 0 && i < bays) b.box(px, CURB, Z(fz + 0.9 + (deep - 0.9) / 2), 0.25, G1 - CURB, deep - 0.9, wall, 0, 0.6)
  }
  b.box(cx, 3.05, Z(fz + 0.45), w - 0.15, G1 - 3.05, 0.9, wall, 0, 0.92)
  const shops = []
  for (let i = 0; i < bays; i++) {
    const sx = x0 + (i + 0.5) * bw
    shops.push(sx)
    b.box(sx, 3.3, Z(fz - 0.02), Math.min(1.3, bw * 0.3), 0.55, 0.06, DARK) // mezzanine window
    b.box(sx, CURB, Z(fz + 0.2), bw - 0.95, 0.06, 0.4, TRAV) // threshold with the shutter groove
    b.box(sx, CURB, Z(fz + deep - 0.05), bw - 1.2, 3.0 - CURB, 0.1, INSIDE) // back wall of the shop
  }

  // upper floors: windows with sills and shutters, a string course per floor
  for (let f = 1; f < storeys; f++) {
    const y = G1 + (f - 1) * FH
    b.box(cx, y - 0.12, Z(fz - 0.07), w - 0.15, 0.2, 0.3, wall, 0, 1.08)
    const n = Math.max(2, Math.floor(w / (f === 1 ? 3.4 : 2.9)))
    const step = w / n
    const wh = f === 1 ? 1.5 : f === storeys - 1 ? 0.9 : 1.2
    for (let k = 0; k < n; k++) {
      const wx = x0 + (k + 0.5) * step
      if (rand() < 0.06) continue
      b.box(wx, y + 0.95, Z(fz - 0.03), 0.95, wh, 0.08, DARK)
      b.box(wx, y + 0.88, Z(fz - 0.12), 1.15, 0.08, 0.26, TRAV)
      const r = rand()
      if (r < 0.45) {
        const sh = PAL.shutter[Math.floor(rand() * PAL.shutter.length)]
        b.box(wx - 0.74, y + 0.95, Z(fz - 0.06), 0.48, wh, 0.05, sh) // shutters open
        b.box(wx + 0.74, y + 0.95, Z(fz - 0.06), 0.48, wh, 0.05, sh)
      } else if (r < 0.62) {
        b.box(wx, y + 0.95, Z(fz - 0.08), 0.95, wh, 0.05, PAL.shutter[Math.floor(rand() * PAL.shutter.length)]) // closed
      } else if (r < 0.7 && f > 1) {
        b.cyl(wx - 0.3, y + 0.92, Z(fz - 0.2), 0.12, 0.14, 0.22, '#9C5A3C', 6) // pots on the sill
        b.box(wx - 0.3, y + 1.14, Z(fz - 0.2), 0.3, 0.25, 0.25, '#5D7340')
      }
    }
  }

  // a wooden balcony on the first floor, or the portico with a terrace on top
  if (portico) {
    const pb = Math.max(2, Math.round(w / 3.6))
    const pw = w / pb
    for (let i = 0; i < pb; i++) {
      const ax = x0 + (i + 0.5) * pw
      b.push(archPanelGeometry(+pw.toFixed(2), 3.7, +(pw - 0.95).toFixed(2), 3.25, 0.6), wall, b.local(ax, CURB, Z(FRONT + 0.3)), 0.95)
    }
    b.box(cx, CURB + 3.7, Z(FRONT + 1.5), w - 0.15, 0.3, 3.0, wall, 0, 1.05) // terrace floor
    b.box(cx, CURB + 4.0, Z(FRONT + 0.15), w - 0.15, 0.85, 0.3, wall, 0, 1.02) // parapet
    for (let i = 0; i < pb; i += 2) {
      b.cyl(x0 + (i + 0.5) * pw, CURB + 4.0, Z(FRONT + 1.6), 0.25, 0.3, 0.4, '#9C5A3C', 7)
      b.push(new THREE.IcosahedronGeometry(0.55, 0), '#5E7342', b.local(x0 + (i + 0.5) * pw, CURB + 4.9, Z(FRONT + 1.6)))
    }
    b.box(cx, CURB, Z(FRONT + 1.6), w - 0.15, 0.04, 2.6, '#BDB09A') // paving under the portico
  } else if (o.balcony ?? rand() < 0.6) {
    const bl = Math.min(w - 2, 4 + rand() * (w - 5)), bx = cx + (rand() - 0.5) * (w - bl - 1)
    const by = G1 + 0.05
    b.box(bx, by - 0.15, Z(fz - 0.6), bl, 0.15, 1.2, WOOD)
    for (let x = bx - bl / 2 + 0.3; x < bx + bl / 2; x += 1.5) b.box(x, by - 0.65, Z(fz - 0.5), 0.14, 0.5, 1.0, WOOD, 0, 0.8)
    b.box(bx, by + 0.95, Z(fz - 1.15), bl, 0.08, 0.08, WOOD)
    for (let x = bx - bl / 2 + 0.05; x <= bx + bl / 2; x += 0.55) b.box(x, by, Z(fz - 1.15), 0.06, 0.95, 0.06, WOOD, 0, 0.9)
    // laundry and plants
    if (rand() < 0.6) {
      b.box(bx, by + 1.75, Z(fz - 1.1), bl, 0.02, 0.02, '#3A3029')
      for (let x = bx - bl / 2 + 0.5; x < bx + bl / 2 - 0.4; x += 0.9 + rand() * 0.6) {
        b.box(x, by + 1.0 + rand() * 0.2, Z(fz - 1.1), 0.5 + rand() * 0.3, 0.7, 0.03, PAL.cloth[Math.floor(rand() * PAL.cloth.length)])
      }
    }
    b.cyl(bx + bl / 2 - 0.4, by, Z(fz - 0.4), 0.2, 0.24, 0.35, '#9C5A3C', 7)
    b.push(new THREE.IcosahedronGeometry(0.4, 0), '#5E7342', b.local(bx + bl / 2 - 0.4, by + 0.65, Z(fz - 0.4)))
  }

  // cornice and tiled roof (now and then a roof terrace)
  b.box(cx, H - 0.25, Z(fz - 0.15 + D / 2), w + 0.2, 0.3, D + 0.6, wall, 0, 1.06)
  if (rand() < 0.12) {
    b.box(cx, H, Z(fz + D / 2), w - 0.15, 0.9, D, wall, 0, 1.02)
    b.box(cx, H + 0.9, Z(fz + D / 2), w - 1.2, 0.1, D - 1.2, '#B9A385')
  } else {
    b.hip(cx, H + 0.05, Z(fz + D / 2), w + 0.7, Math.min(w, D) * 0.2, D + 0.9, PAL.roof[Math.floor(rand() * PAL.roof.length)])
  }
  return { cx, fz, shops, wall, H, D, portico }
}

// What a shop sells, set out inside its doorway (behind the threshold:
// Domitian had ordered shopkeepers off the street, Martial 7.61).
function shopFront(b, rand, sx, fz, s, kind) {
  const Z = (z) => s * z
  const yIn = CURB
  if (kind === 'shut') {
    b.box(sx, yIn, Z(fz + 0.32), 3.5, 2.75, 0.12, PAL.shutter[Math.floor(rand() * PAL.shutter.length)])
    for (let i = -1; i <= 1; i++) b.box(sx + i * 1.15, yIn, Z(fz + 0.24), 0.04, 2.75, 0.04, '#3B2E22')
    return
  }
  if (kind === 'jars') {
    for (let i = 0; i < 6; i++) amphora(b, sx - 1.4 + (i % 3) * 0.55 + rand() * 0.1, yIn, Z(fz + 1.4 + Math.floor(i / 3) * 0.6))
    b.box(sx + 0.9, yIn, Z(fz + 1.2), 1.3, 0.95, 0.6, WOOD)
  } else if (kind === 'cloth') {
    for (let i = 0; i < 5; i++) b.box(sx - 1.3 + i * 0.62, yIn + 1.1, Z(fz + 1.0), 0.5, 1.8, 0.04, PAL.cloth[Math.floor(rand() * PAL.cloth.length)])
    b.box(sx, yIn + 2.95, Z(fz + 1.0), 3.2, 0.06, 0.06, WOOD)
    b.box(sx, yIn, Z(fz + 2.6), 3.0, 0.9, 1.0, '#8E6B47')
  } else if (kind === 'pots') {
    for (let i = 0; i < 8; i++) b.cyl(sx - 1.5 + (i % 4) * 0.8, yIn + (i >= 4 ? 0.9 : 0), Z(fz + 2.2), 0.18, 0.26, 0.4, i % 2 ? '#B0603E' : '#9A5232', 7)
    b.box(sx, yIn, Z(fz + 2.2), 3.4, 0.88, 0.7, WOOD)
  } else if (kind === 'smith') {
    b.box(sx - 0.8, yIn, Z(fz + 2.0), 1.2, 0.8, 1.0, '#6B5A4A') // hearth
    b.box(sx - 0.8, yIn + 0.8, Z(fz + 2.0), 0.6, 0.12, 0.5, '#B8592F')
    b.cyl(sx + 0.7, yIn, Z(fz + 1.6), 0.25, 0.3, 0.55, '#4D4C4A', 6) // anvil block
    b.box(sx + 0.7, yIn + 0.55, Z(fz + 1.6), 0.6, 0.18, 0.25, '#3E3F42')
  } else if (kind === 'food') {
    // an L-shaped masonry counter with jars (dolia) set into a marble top
    b.box(sx - 0.25, yIn, Z(fz + 0.95), 3.1, 0.95, 0.75, '#C6A47A')
    b.box(sx - 0.25, yIn + 0.95, Z(fz + 0.95), 3.2, 0.07, 0.85, '#EFE8DA')
    b.box(sx - 1.55, yIn, Z(fz + 1.95), 0.75, 0.95, 1.4, '#C6A47A')
    b.box(sx - 1.55, yIn + 0.95, Z(fz + 1.95), 0.85, 0.07, 1.5, '#EFE8DA')
    for (let i = 0; i < 3; i++) b.cyl(sx - 0.9 + i * 0.85, yIn + 0.99, Z(fz + 0.95), 0.24, 0.24, 0.03, '#31261E', 10)
    b.box(sx - 0.25, yIn, Z(fz + 0.57), 3.1, 0.95, 0.02, '#A9473A') // painted front
    // stepped shelf for jugs, and a painted shrine on the back wall
    b.box(sx + 0.9, yIn, Z(fz + 3.9), 1.6, 1.4, 0.5, '#B79A73')
    for (let i = 0; i < 4; i++) b.cyl(sx + 0.35 + i * 0.36, yIn + 1.4, Z(fz + 3.9), 0.09, 0.12, 0.3, '#A65B3A', 6)
    b.box(sx - 0.4, yIn + 1.6, Z(fz + 4.5), 1.0, 1.2, 0.04, '#A9473A')
  }
  // a cloth awning over some doorways
  if (rand() < 0.35) tilted(b, sx, G1 - 0.4, Z(fz - 0.7), 3.6, 0.04, 1.5, s * 0.32, PAL.cloth[Math.floor(rand() * PAL.cloth.length)])
}

// ---------- the bakery (pistrinum) ----------
function bakery(b, x0, x1, s) {
  const Z = (z) => s * z
  const cx = (x0 + x1) / 2, fz = FRONT, D = 22, deep = 9.5
  const wall = '#B06A4A'
  const H = G1 + 3 * FH
  b.box(cx, G1, Z(fz + D / 2), x1 - x0 - 0.15, H - G1, D, wall)
  b.box(cx, -0.6, Z(fz + deep + (D - deep) / 2), x1 - x0 - 0.15, G1 + 0.6, D - deep, wall, 0, 0.72)
  b.box(cx, -0.4, Z(fz + deep / 2), x1 - x0 - 0.15, 0.4 + CURB, deep, '#8F806C')
  // a wide hall open to the street on three arches
  const n = 3, bw = (x1 - x0) / n
  for (let i = 0; i < n; i++) {
    b.push(archPanelGeometry(+bw.toFixed(2), G1 - CURB, +(bw - 1.3).toFixed(2), 3.4, 0.9), wall, b.local(x0 + (i + 0.5) * bw, CURB, Z(fz + 0.45)), 0.86)
  }
  b.box(x0 + 0.1, CURB, Z(fz + deep / 2), 0.2, G1, deep, wall, 0, 0.6)
  b.box(x1 - 0.1, CURB, Z(fz + deep / 2), 0.2, G1, deep, wall, 0, 0.6)
  b.box(cx, G1 - 0.15, Z(fz + deep / 2), x1 - x0 - 0.15, 0.2, deep, '#5A4636') // ceiling
  // counter with round loaves at the front arch
  const kx = x0 + 0.5 * bw
  b.box(kx, CURB, Z(fz + 1.5), bw - 1.6, 0.95, 0.7, '#C6A47A')
  b.box(kx, CURB + 0.95, Z(fz + 1.5), bw - 1.5, 0.06, 0.8, '#EFE8DA')
  for (let i = 0; i < 14; i++) b.cyl(kx - 1.3 + (i % 7) * 0.42, CURB + 1.01, Z(fz + 1.3 + Math.floor(i / 7) * 0.38), 0.15, 0.17, 0.08, '#B87B40', 8)
  // three hourglass mills of lava stone, a wooden bar through each
  for (let i = 0; i < 3; i++) {
    const mx = x0 + bw * 1.1 + i * 3.2, mz = fz + 5.2
    b.cyl(mx, CURB, Z(mz), 0.95, 0.95, 0.45, '#8E8A82', 12) // platform
    b.cone(mx, CURB + 0.45, Z(mz), 0.55, 0.75, '#77736C', 10) // the fixed cone (meta)
    b.push(new THREE.CylinderGeometry(0.48, 0.18, 0.55, 10), '#827D75', b.local(mx, CURB + 1.33, Z(mz))) // the hourglass (catillus)
    b.push(new THREE.CylinderGeometry(0.18, 0.5, 0.55, 10), '#827D75', b.local(mx, CURB + 0.82, Z(mz)))
    b.box(mx, CURB + 1.05, Z(mz), 3.2, 0.12, 0.12, WOOD, i * 0.9)
  }
  // a donkey at the first mill
  {
    const dx = x0 + bw * 1.1 + 1.4, dz = fz + 5.9
    const col = '#7B6E62'
    b.box(dx, CURB + 0.6, Z(dz), 1.15, 0.5, 0.42, col)
    b.box(dx + 0.68, CURB + 0.95, Z(dz), 0.45, 0.32, 0.26, col)
    b.box(dx + 0.85, CURB + 1.2, Z(dz), 0.1, 0.25, 0.08, col)
    for (const [lx, lz] of [[-0.45, -0.14], [-0.45, 0.14], [0.4, -0.14], [0.4, 0.14]]) b.box(dx + lx, CURB, Z(dz + lz), 0.1, 0.62, 0.1, '#5C5248')
  }
  // the domed brick oven at the back, with its dark mouth
  const ox = x1 - bw * 0.9, oz = fz + deep - 1.6
  b.box(ox, CURB, Z(oz), 3.0, 1.0, 2.6, '#A2583C')
  b.push(new THREE.SphereGeometry(1.35, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), '#A2583C', b.local(ox, CURB + 1.0, Z(oz)))
  b.box(ox, CURB + 1.0, Z(oz - 1.32), 0.8, 0.6, 0.06, '#1E1612')
  b.cyl(ox + 0.9, CURB + 2.2, Z(oz + 0.5), 0.2, 0.2, 1.6, '#8F4E36', 6) // flue
  // sacks of grain
  for (let i = 0; i < 4; i++) b.cyl(x1 - 1.2 - (i % 2) * 0.6, CURB, Z(fz + 2.5 + Math.floor(i / 2) * 0.7), 0.3, 0.26, 0.75, '#CDB98F', 7)
  // upper floors
  for (let f = 1; f < 4; f++) {
    const y = G1 + (f - 1) * FH
    b.box(cx, y - 0.12, Z(fz - 0.07), x1 - x0 - 0.15, 0.2, 0.3, wall, 0, 1.08)
    const m = Math.floor((x1 - x0) / 3.1)
    for (let k = 0; k < m; k++) {
      const wx = x0 + (k + 0.5) * ((x1 - x0) / m)
      b.box(wx, y + 0.95, Z(fz - 0.03), 0.95, 1.2, 0.08, DARK)
      b.box(wx, y + 0.88, Z(fz - 0.12), 1.15, 0.08, 0.26, TRAV)
    }
  }
  b.box(cx, H - 0.25, Z(fz - 0.15 + D / 2), x1 - x0 + 0.2, 0.3, D + 0.6, wall, 0, 1.06)
  b.hip(cx, H + 0.05, Z(fz + D / 2), x1 - x0 + 0.7, 4, D + 0.9, PAL.roof[1])
  // a sign: a painted panel over the middle arch
  b.box(cx, 3.55, Z(fz - 0.04), 2.6, 0.5, 0.06, '#EFE4CC')
  b.box(cx, 3.55, Z(fz - 0.07), 2.2, 0.12, 0.04, '#A9473A')
}

// ---------- the street fountain (lacus) ----------
function lacus(b, x, s) {
  const Z = (z) => s * z
  const z = HALF + 0.9, st = '#D5C8AE'
  b.box(x, 0, Z(z - 0.62), 2.6, 0.85, 0.24, st)
  b.box(x, 0, Z(z + 0.62), 2.6, 0.85, 0.24, st)
  b.box(x - 1.18, 0, Z(z), 0.24, 0.85, 1.48, st)
  b.box(x + 1.18, 0, Z(z), 0.24, 0.85, 1.48, st)
  b.box(x, 0, Z(z), 2.2, 0.72, 1.0, '#5F8090') // water
  b.box(x, 0, Z(z + 0.95), 0.55, 1.45, 0.45, st) // the spout stone
  b.cyl(x, 1.05, Z(z + 0.68), 0.16, 0.16, 0.04, '#9A8E74', 10).box(x, 1.0, Z(z + 0.6), 0.06, 0.06, 0.25, C.bronze)
  b.box(x, 0.4, Z(z + 0.55), 0.04, 0.55, 0.04, '#9FC0CC') // the jet
}

// ---------- the crossroads shrine (compitum) ----------
function compitum(b, x, s) {
  const Z = (z) => s * z
  const z = FRONT - 0.7
  b.box(x, CURB, Z(z), 1.9, 1.2, 1.3, '#D9CBAE')
  for (const cx of [-0.65, 0.65]) b.cyl(x + cx, CURB + 1.2, Z(z - 0.35), 0.09, 0.1, 1.55, '#EFE8DA', 8)
  b.box(x, CURB + 1.2, Z(z + 0.45), 1.6, 1.55, 0.12, '#A9473A') // painted back: the two Lares
  b.box(x - 0.35, CURB + 1.55, Z(z + 0.38), 0.22, 0.75, 0.04, '#E9D8A8')
  b.box(x + 0.35, CURB + 1.55, Z(z + 0.38), 0.22, 0.75, 0.04, '#E9D8A8')
  b.box(x, CURB + 2.75, Z(z), 1.9, 0.22, 1.3, '#E6DAC2')
  b.gable(x, CURB + 2.97, Z(z), 1.9, 0.6, 1.3, '#A8553A', Math.PI / 2)
  b.box(x, CURB, Z(z - 1.15), 0.75, 0.95, 0.6, '#E6DAC2') // altar
  b.box(x, CURB + 0.95, Z(z - 1.15), 0.85, 0.1, 0.7, '#D4C6A8')
  // garlands: Augustus had the Lares crowned with flowers twice a year
  for (const cx of [-0.65, 0.65]) b.push(new THREE.TorusGeometry(0.2, 0.05, 4, 8), '#6E8A3E', b.local(x + cx, CURB + 2.35, Z(z - 0.45)))
}

// ---------- the litter, the mule, porters ----------
function litter(b, x, z) {
  b.box(x, 0.95, z, 2.1, 0.9, 0.85, '#6E2E2A')
  b.box(x, 1.85, z, 2.2, 0.08, 0.95, '#E2CFA2')
  for (const [lx, lz] of [[-1, -0.4], [-1, 0.4], [1, -0.4], [1, 0.4]]) b.box(x + lx, 0.95, z + lz, 0.06, 0.95, 0.06, '#C9A35A')
  b.box(x, 1.2, z - 0.55, 4.4, 0.1, 0.1, WOOD)
  b.box(x, 1.2, z + 0.55, 4.4, 0.1, 0.1, WOOD)
  b.box(x, 1.0, z - 0.43, 2.0, 0.75, 0.03, '#B9843F') // curtains
  b.box(x, 1.0, z + 0.43, 2.0, 0.75, 0.03, '#B9843F')
}
function mule(b, x, z, ry) {
  const col = '#6D5E50'
  const L = (lx, y, lz) => [x + lx * Math.cos(ry), y, z - lx * Math.sin(ry) + lz]
  b.box(...L(0, 0.75, 0), 1.3, 0.55, 0.45, col, ry)
  b.box(...L(0.78, 1.05, 0), 0.5, 0.34, 0.28, col, ry)
  for (const lx of [-0.5, 0.45]) for (const lz of [-0.15, 0.15]) b.box(...L(lx, 0, lz), 0.11, 0.76, 0.11, '#54483D', ry)
  b.box(...L(0, 0.85, -0.42), 0.8, 0.6, 0.35, '#A58A5C', ry) // panniers
  b.box(...L(0, 0.85, 0.42), 0.8, 0.6, 0.35, '#A58A5C', ry)
}

// ---------- the street itself ----------
function build() {
  const b = new Builder()
  const pave = new Builder()
  const rand = rng(100)
  const [mx, mz] = STREET.at
  b.at(mx, Y, mz, STREET.rot)
  pave.at(mx, Y, mz, STREET.rot)

  // carriageway (basalt), raised pavements (tufa) with curbs, the side lane
  const xa = -134, xb = XEND + 4
  pave.box((xa + xb) / 2, -0.5, 0, xb - xa, 0.62, HALF * 2, '#5B5752')
  b.box((-124 + xb) / 2, -0.5, -(HALF + 2.4), xb + 124, 0.5 + CURB, 4.8, '#B5A68A') // left pavement, runs under the porticoes
  b.box((-96 + xb) / 2, -0.5, HALF + 2.4, xb + 96, 0.5 + CURB, 4.8, '#B5A68A')
  b.box((-124 + xb) / 2, -0.5, -(HALF + 0.12), xb + 124, 0.5 + CURB + 0.02, 0.24, '#C9BC9F')
  b.box((-96 + xb) / 2, -0.5, HALF + 0.12, xb + 96, 0.5 + CURB + 0.02, 0.24, '#C9BC9F')
  pave.box(XC, -0.5, 0, ALLEY * 2, 0.62, 60, '#5B5752') // the side lane, basalt too
  pave.box(-118, -0.5, 9, 30, 0.62, 18, '#5B5752') // the square before the firewall, where the road turns off to the Forum

  // ---- the blocks, side by side ----
  const kinds = ['jars', 'cloth', 'pots', 'smith', 'shut', 'jars', 'shut', 'cloth']
  const runSide = (s, from, to, fixed) => {
    let x = from
    while (x < to - 6) {
      const f = fixed.find((q) => Math.abs(q.x0 - x) < 0.01)
      if (f) {
        f.make(x)
        x = f.x1 + (f.gap ?? 0)
        continue
      }
      const next = fixed.find((q) => q.x0 > x)
      const lim = Math.min(to, next ? next.x0 : to)
      let w = 12 + rand() * 12
      if (lim - (x + w) < 9) w = lim - x
      if (w < 6) {
        x = lim
        continue
      }
      const blk = insula(b, rand, x, x + w, s)
      blk.shops.forEach((sx) => shopFront(b, rand, sx, blk.fz, s, kinds[Math.floor(rand() * kinds.length)]))
      x += w
    }
  }
  // left side (north-west), from the firewall to the far end
  runSide(-1, STREET.from, XEND, [
    { x0: -36, x1: -24, make: (x) => {
      const blk = insula(b, rand, x, x + 12, -1, { storeys: 4, portico: false, balcony: true, bay: 6 })
      shopFront(b, rand, blk.shops[0], blk.fz, -1, 'food')
      shopFront(b, rand, blk.shops[1], blk.fz, -1, 'jars')
    } },
    { x0: XC - 22, x1: XC - ALLEY, make: (x) => {
      const blk = insula(b, rand, x, XC - ALLEY, -1, { storeys: 4 })
      blk.shops.forEach((sx) => shopFront(b, rand, sx, blk.fz, -1, 'cloth'))
    }, gap: ALLEY * 2 },
    { x0: 40, x1: 64, make: (x) => {
      const blk = insula(b, rand, x, 64, -1, { storeys: 5, portico: true, depth: 22 })
      blk.shops.forEach((sx, i) => shopFront(b, rand, sx, blk.fz, -1, ['pots', 'jars', 'shut', 'cloth', 'smith', 'jars'][i % 6]))
    } },
  ])
  // right side (south-east): the bakery just past the crossing
  runSide(1, -96, XEND, [
    { x0: XC - 20, x1: XC - ALLEY, make: (x) => {
      const blk = insula(b, rand, x, XC - ALLEY, 1, { storeys: 5, portico: false })
      blk.shops.forEach((sx) => shopFront(b, rand, sx, blk.fz, 1, 'jars'))
    }, gap: ALLEY * 2 },
    { x0: XC + ALLEY, x1: XC + ALLEY + 21, make: () => bakery(b, XC + ALLEY, XC + ALLEY + 21, 1) },
  ])
  // laundry across the side lane
  for (let i = 0; i < 3; i++) {
    for (const s of [-1, 1]) {
      const z = s * (FRONT + 6 + i * 5), y = G1 + 3 + i * 2.6
      b.box(XC, y, z, ALLEY * 2 + 0.4, 0.02, 0.02, '#3A3029')
      for (let k = 0; k < 4; k++) b.box(XC - 1.8 + k * 1.2, y - 0.45, z, 0.6, 0.8, 0.03, PAL.cloth[(i * 3 + k) % PAL.cloth.length])
    }
  }

  // the fountain and the shrine at the crossing
  lacus(b, XC - ALLEY - 1.5, 1)
  compitum(b, XC + ALLEY + 1.3, -1)
  // a litter, a mule with panniers, a hawker's tray and a porter's jars
  litter(b, -12, 0.4)
  mule(b, 58, -0.8, 0)
  amphora(b, 30.6, CURB, -3.6)
  amphora(b, 31.1, CURB, -3.4)
  b.box(-58, 1.72, 1.2, 0.8, 0.08, 0.5, WOOD).box(-58, 1.8, 1.2, 0.6, 0.12, 0.35, '#C79A55')

  // the gate in the firewall of the Forum of Augustus, at the end of the street
  const fw = PLACES.firewall, ab = PLACES.forumAugustus
  const g = heightAt(ab.at[0], ab.at[1])
  const gate = new Builder()
  gate.at(fw.at[0], g, fw.at[1], fw.rot)
  gate.push(archPanelGeometry(9, 12, 5, 8.5, 1.4), '#8E877A', gate.local(4.3, -0.4, 0, Math.PI / 2))
  gate.box(3.7, -0.4, 0, 0.4, 8.3, 4.9, '#1F1A16')
  gate.box(4.9, 11.6, 0, 1.0, 0.6, 10, '#9A9284')
  gate.parts.forEach((p) => b.parts.push(p))
  return { stone: b.merge(), pave: pave.merge() }
}

// ---------- people ----------
// Where the street-level views stand and look (content/rome.js): keep a
// little space there so nobody stands in the visitor's face.
const CLEAR = [[-100, 0, 8], [34, 2.6, 6], [-36.5, 2.8, 6], [23, -2.6, 5], [6, -2.2, 5], [22, 2.4, 5], [-96, 0, 6], [-33, -1.5, 3], [9.9, 2.5, 3.5], [17.9, -2.5, 3.5]]
function people(n) {
  const rand = rng(7)
  const items = []
  const add = (lx, lz, yaw, force) => {
    if (!force && CLEAR.some(([cx, cz, r]) => Math.hypot(lx - cx, lz - cz) < r)) return
    const [x, z] = streetPoint(lx, lz)
    const onWalk = Math.abs(lz) > HALF
    items.push([x, Y + (onWalk ? CURB : 0.12) + 0.02, z, PAL.tunic[Math.floor(rand() * PAL.tunic.length)], yaw ?? rand() * 6.28])
  }
  const along = STREET.rot
  for (let i = 0; i < n; i++) {
    const k = rand()
    if (k < 0.45) {
      // walking up and down the middle of the street (no carts by day)
      add(-120 + rand() * 214, (rand() - 0.5) * 2 * (HALF - 0.4), along + (rand() < 0.5 ? 0 : Math.PI) + (rand() - 0.5) * 0.5 - Math.PI / 2)
    } else if (k < 0.8) {
      // on the pavements, at the shop doors
      const s = rand() < 0.5 ? -1 : 1
      const lx = (s < 0 ? -120 : -94) + rand() * (s < 0 ? 214 : 188)
      add(lx, s * (HALF + 0.4 + rand() * 1.3), rand() * 6.28)
    } else if (k < 0.86) {
      // a few at the fountain, the shrine and the food bar, beside them, not in front
      const c = [[XC - ALLEY - 4.2, 3.4], [XC + ALLEY + 3.8, -3.6], [-29.5, -3.3]][Math.floor(rand() * 3)]
      add(c[0] + (rand() - 0.5) * 1.6, c[1] + (rand() - 0.5) * 0.6)
    } else {
      // down the side lane
      add(XC + (rand() - 0.5) * 3.6, (rand() < 0.5 ? -1 : 1) * (FRONT + rand() * 26))
    }
  }
  // six bearers for the litter, two for the hawker and the mule
  for (const [lx, lz] of [[-14.6, -0.2], [-14.6, 1.0], [-9.4, -0.2], [-9.4, 1.0], [-12, -0.4], [-12, 1.2]]) add(lx, lz, along - Math.PI / 2, true)
  add(-58, 1.2, along, true)
  add(59.3, -1.2, along - Math.PI / 2, true)
  // the baker at his oven and a customer at the counter; the food-bar keeper
  add(XC + ALLEY + 15.5, FRONT + 6.2, 0, true)
  add(XC + ALLEY + 3.5, FRONT + 0.4, 0, true)
  add(-33.4, -(FRONT + 2.0), 0, true)
  return items
}

function paveMaterial() {
  return patchStandard(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 }), {
    fragmentPars: `vec2 h2(vec2 p){ p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return fract(sin(p) * 43758.5453); }`,
    fragmentColor: `
      // polygonal basalt blocks (selce), as on Roman streets
      vec2 p = vWPos.xz * 1.5;
      vec2 ip = floor(p), fp = fract(p);
      float d1 = 8.0, d2 = 8.0; vec2 id = vec2(0.0);
      for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
        vec2 g = vec2(float(i), float(j));
        vec2 r = g + h2(ip + g) * 0.85 - fp;
        float d = dot(r, r);
        if (d < d1) { d2 = d1; d1 = d; id = ip + g; } else if (d < d2) { d2 = d; }
      }
      float edge = sqrt(d2) - sqrt(d1);
      float fw = fwidth(p.x) + fwidth(p.y);
      float detail = 1.0 - smoothstep(0.35, 0.9, fw);
      float joint = 1.0 - smoothstep(0.03, 0.09 + fw, edge);
      diffuseColor.rgb *= mix(1.0, 0.55, joint * detail);
      diffuseColor.rgb *= mix(1.0, 0.86 + 0.26 * h2(id).x, detail);`,
  })
}

export function Street() {
  const parts = useMemo(() => {
    const t0 = performance.now()
    const out = { ...build(), crowd: people(LITE ? 170 : 340) }
    window.__street = { ms: Math.round(performance.now() - t0), triangles: out.stone.attributes.position.count / 3 }
    return out
  }, [])
  const mats = useMemo(
    () => ({
      stone: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.86, side: THREE.DoubleSide }),
      pave: paveMaterial(),
    }),
    [],
  )
  const now = useNow()
  return (
    <group>
      <mesh geometry={parts.stone} material={now ? GHOST : mats.stone} castShadow={!now} receiveShadow={!now} />
      <mesh geometry={parts.pave} material={now ? GHOST : mats.pave} receiveShadow={!now} />
      {!now && <Crowd items={parts.crowd} />}
    </group>
  )
}
