// The monuments of Rome in AD 100. Each is built from the generators in
// geo.js and merged, so all of them together are two draw calls (stone and
// gilded bronze). Status and evidence for each one: HISTORY.md.
import { useMemo } from 'react'
import * as THREE from 'three'
import { GHOST, useNow } from './era'
import { colonnade, peristyle } from './Palatine'
import { Builder, archPanelGeometry, temple, roundTemple, basilica, portico, arch, theatre } from './geo'
import { PLACES, FORUM, along, facing, DEG } from './layout'
import { heightAt } from './terrain'

import { C } from './colours'
export { C }

// Ground level for a building: the highest ground under it, so it sits on a
// terrace with its substructure showing on the downhill side, as Roman
// buildings on slopes did.
function baseOf(name) {
  const p = PLACES[name]
  const [w, , d] = p.pick
  const c = Math.cos(p.rot), s = Math.sin(p.rot)
  let hi = -Infinity, lo = Infinity
  for (const [fx, fz] of [[0, 0], [-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]]) {
    const lx = fx * w, lz = fz * d
    const h = heightAt(p.at[0] + lx * c + lz * s, p.at[1] - lx * s + lz * c)
    hi = Math.max(hi, h)
    lo = Math.min(lo, h)
  }
  return { hi, lo }
}

function place(b, name, plinthHex = C.tuff) {
  const p = PLACES[name]
  const { hi, lo } = baseOf(name)
  b.at(p.at[0], hi, p.at[1], p.rot)
  if (hi - lo > 0.6) b.box(0, lo - hi - 2, 0, p.pick[0] * 0.98, hi - lo + 2, p.pick[2] * 0.98, plinthHex, 0, 0.9)
  return hi
}

// ---------- the Capitol ----------
function capitol(b, g) {
  place(b, 'capitolium')
  temple(b, { w: 54, d: 62, podium: 6, colH: 16, cols: 6, depthCols: 3, side: true, stone: C.marble, podiumCol: C.tuff, roof: C.roof, gilt: g })
  // three cellae: Jupiter, Juno, Minerva
  b.box(0, 6, -16, 50, 16, 28, C.stucco, 0, 0.95)
  place(b, 'junoMoneta')
  temple(b, { w: 20, d: 30, podium: 4, colH: 10, cols: 4, depthCols: 2, stone: C.marbleWarm })
}

// ---------- imperial fora (massing) ----------
function enclosure(b, w, d, h, wallHex, { porticoDepth = 10, temple: t, firewall } = {}) {
  b.box(0, -0.3, 0, w, 0.5, d, C.paving)
  b.box(0, 0, -d / 2, w, firewall || h, 2.2, wallHex)
  b.box(0, 0, d / 2, w, h, 2.2, wallHex)
  b.box(-w / 2, 0, 0, 2.2, h, d, wallHex)
  b.box(w / 2, 0, 0, 2.2, h, d, wallHex)
  portico(b, -w / 2 + porticoDepth, d / 2 - 2, w / 2 - porticoDepth, d / 2 - 2, { h: h * 0.6, depth: porticoDepth - 1, stone: C.marble })
  portico(b, w / 2 - porticoDepth, -d / 2 + 2, -w / 2 + porticoDepth, -d / 2 + 2, { h: h * 0.6, depth: porticoDepth - 1, stone: C.marble })
  return t
}

// A temple placed inside an enclosure: (lx, lz) in the enclosure's frame,
// turned by `turn` so its front faces the right way.
function templeIn(b, lx, lz, turn, opts) {
  b.frame.multiply(new THREE.Matrix4().makeTranslation(lx, 0, lz).multiply(new THREE.Matrix4().makeRotationY(turn)))
  temple(b, opts)
}

function fora() {
  const b = this
  // Forum of Caesar (46 BC): long axis south-east to north-west, the Temple of
  // Venus Genetrix at the north-west end, facing down the square.
  place(b, 'forumCaesar')
  enclosure(b, 160, 75, 14, C.tuff)
  templeIn(b, -58, 0, Math.PI / 2, { w: 30, d: 40, podium: 5, colH: 14, cols: 8, depthCols: 3, side: true, stone: C.marble })
  // Forum of Augustus (2 BC): Temple of Mars Ultor at the north-east end, high
  // firewall towards the Subura.
  place(b, 'forumAugustus')
  enclosure(b, 125, 90, 30, C.tuff)
  templeIn(b, 36, 0, -Math.PI / 2, { w: 36, d: 50, podium: 3.5, colH: 17.7, cols: 8, depthCols: 3, side: true, stone: C.marble })
  // Forum of Nerva (AD 97): long and narrow, Temple of Minerva at the north-east end.
  place(b, 'forumNerva')
  enclosure(b, 120, 45, 16, C.tuff, { porticoDepth: 4 })
  templeIn(b, 42, 0, -Math.PI / 2, { w: 22, d: 34, podium: 4, colH: 15, cols: 6, depthCols: 2, stone: C.marble })
  // Temple of Peace (AD 75): a garden square with porticoes.
  place(b, 'templumPacis')
  enclosure(b, 135, 110, 15, C.tuff, { porticoDepth: 12 })
  for (let i = 0; i < 6; i++) b.box(-40 + i * 16, 0, 0, 6, 0.6, 70, C.green)
}

// ---------- the Colosseum valley ----------
function valley(b) {
  place(b, 'metaSudans')
  b.cyl(0, 0, 0, 8, 8, 1.2, C.travertine, 24)
  b.cyl(0, 1.2, 0, 4, 1.6, 15, C.brick, 16)
  b.cone(0, 16.2, 0, 1.6, 2, C.bronze, 12)

  place(b, 'vestibule')
  enclosure(b, 140, 95, 10, C.stucco, { porticoDepth: 7 })
  place(b, 'colossus')
  // The Colossus, recast by Vespasian as the Sun god with a radiate crown.
  b.box(0, 0, 0, 12, 6, 12, C.marbleWarm)
  b.cyl(0, 6, 0, 2.6, 1.9, 14, C.bronze, 10)
  b.cyl(0, 20, 0, 1.9, 2.4, 9, C.bronze, 10)
  b.cyl(2.8, 20, 0, 0.6, 0.6, 10, C.bronze, 6)
  b.cyl(0, 29, 0, 1.3, 1.3, 3.4, C.bronze, 10)
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI - Math.PI / 2
    b.box(Math.sin(a) * 1.4, 32, Math.cos(a) * 0.3 + 0.4, 0.3, 2.6, 0.3, C.bronze)
  }

  place(b, 'ludusMagnus')
  b.box(0, 0, 0, 80, 12, 62, C.brick)
  b.box(0, 12, 0, 70, 0.4, 52, C.dark)
  b.at(PLACES.ludusMagnus.at[0], heightAt(...PLACES.ludusMagnus.at) + 0.6, PLACES.ludusMagnus.at[1], PLACES.ludusMagnus.rot)
  b.disc(31, 20, 11.8, C.sand, 32)

  // The Baths of Titus, dedicated in AD 80: the first "imperial" baths. Plan after
  // Palladio's (questionable) drawing: symmetrical, frigidarium, tepidarium and
  // caldarium on one axis, an exercise court on each side; a broad stair down to
  // the square of the Colosseum, with a portico at its foot. Heights are ours.
  {
    const p = PLACES.bathsTitus, cs = Math.cos(p.rot), sn = Math.sin(p.rot)
    const W = (lx, lz) => [p.at[0] + lx * cs + lz * sn, p.at[1] - lx * sn + lz * cs]
    const top = 41
    b.at(p.at[0], top, p.at[1], p.rot)
    const BR = C.brick, ST = '#E3D3B4'
    b.box(0, -32, -12, 122, 32, 88, BR, 0, 0.85) // the platform on the slope of the Oppian
    for (let i = 0; i < 15; i++) b.push(archPanelGeometry(8, 11, 4.6, 8, 1.6), BR, b.local(-56 + i * 8, -11, 32), 0.95)
    b.box(0, -0.3, -12, 122, 0.3, 88, '#D9CDB4')
    // a vaulted hall: walls, a half-barrel roof along x or z, dark lunettes
    const vaulted = (cx, cz, w, d, h, alongX = true) => {
      b.box(cx, 0, cz, w, h, d, ST)
      const r = (alongX ? d : w) / 2, len = alongX ? w : d
      const g = new THREE.CylinderGeometry(r, r, len, 14, 1, false, 0, Math.PI)
      g.rotateZ(Math.PI / 2)
      if (!alongX) g.rotateY(Math.PI / 2)
      b.push(g, C.roof, b.local(cx, h, cz, alongX ? Math.PI / 2 : 0), 0.95)
      if (alongX) for (const sx of [-1, 1]) b.box(cx + sx * (w / 2 + 0.02), h - r * 0.2, cz, 0.1, r * 0.8, r * 1.2, C.dark)
    }
    vaulted(0, -28, 48, 24, 22) // frigidarium, cross-vaulted
    vaulted(0, -28, 24, 48, 22, false)
    vaulted(0, -10, 20, 12, 16) // tepidarium
    vaulted(0, 7, 36, 22, 20) // caldarium, its big windows to the south-west sun
    for (let i = 0; i < 5; i++) b.box(-14 + i * 7, 4, 18.05, 3.4, 11, 0.1, C.dark)
    for (const sx of [-1, 1]) b.cyl(sx * 18, 0, 7, 6, 6, 16, ST, 12)
    // the two exercise courts with porticoes, and the rooms round them
    for (const sx of [-1, 1]) {
      const pt = peristyle(b, sx * 44, -22, 30, 46, 0, 6, 3.6, { depth: 4.5, floor: '#CDBE9C' })
      b.box(sx * 44, -0.25, -22, pt.ix1 - pt.ix0 - 1, 0.3, pt.iz1 - pt.iz0 - 1, '#C9B48C')
      b.box(sx * 54, 0, 12, 12, 10, 18, ST, 0, 0.96)
      b.hip(sx * 54, 10, 12, 12.6, 2.4, 18.6, C.roof)
    }
    b.box(0, 0, -50, 122, 12, 10, ST, 0, 0.96) // the north range (cisterns and service rooms)
    b.hip(0, 12, -50, 122.6, 2.5, 10.6, C.roof)
    // terrace, then the great stair down to the square, with a portico at its foot
    b.box(0, 0, 25, 70, 1.0, 0.4, ST)
    let y = 0, z = 32, i = 0
    while (i < 60) {
      const [wx, wz] = W(0, z)
      const g = heightAt(wx, wz) - top
      if (y <= g + 0.4) break
      b.box(0, g - 1, z, 44, y - g + 1, 1.35, i % 2 ? '#D6CAB0' : '#DDD2BA')
      y -= 0.72
      z += 1.35
      i++
    }
    for (let k = 0; k < 9; k++) b.push(archPanelGeometry(5.6, 9, 3.6, 7, 4), ST, b.local(-22.4 + k * 5.6, y, z + 2), 0.96)
    b.box(0, y + 9, z + 2, 50.4, 0.8, 4.6, ST, 0, 1.03)
  }

  // What still stands of Nero's Golden House: the wing on the Oppian, with a
  // portico along its south front and the domed octagonal hall. It burned in
  // 104 and Trajan's baths were built over it. The rest of the park is gone.
  {
    const p = PLACES.domusAurea
    b.at(p.at[0], 42, p.at[1], p.rot)
    b.box(0, -14, 0, 250, 28, 60, C.stucco)
    b.box(-30, 13.8, 18, 40, 0.3, 24, C.green) // the five-sided court, open to the south
    for (let i = 0; i < 40; i++) b.box(-120 + i * 6.1, -10, 30.1, 3.0, 8, 0.2, C.dark)
    colonnade(b, -124, 34, 124, 34, -14, 9, 4.2)
    b.hip(0, -4, 32.5, 250, 1.6, 6, C.roof)
    b.hip(-90, 14, 0, 70, 3.5, 62, C.roof)
    b.hip(85, 14, 0, 80, 3.5, 62, C.roof)
    b.cyl(30, 14, -2, 9.5, 9.5, 6, C.stucco, 8) // the octagonal hall's drum
    b.push(new THREE.SphereGeometry(9.5, 16, 6, 0, Math.PI * 2, 0, Math.PI / 2), C.roofDark, b.local(30, 20, -2))
    b.cyl(30, 29.4, -2, 1.8, 1.8, 0.2, C.dark, 12) // the oculus
    b.box(0, -28, 36, 252, 14, 6, C.brick, 0, 0.85) // the terrace wall above the valley
  }

  place(b, 'claudius')
  b.box(0, 0, 0, 175, 9, 200, C.travertine)
  b.box(0, 9, 0, 170, 0.4, 195, C.green)
  b.at(PLACES.claudius.at[0], baseOf('claudius').hi + 9, PLACES.claudius.at[1], PLACES.claudius.rot)
  temple(b, { w: 30, d: 44, podium: 4, colH: 14, cols: 6, depthCols: 3, side: true, stone: C.marble })
}

// ---------- the Palatine: the temples beside the palace ----------
// The palace itself is in Palatine.jsx, the Circus Maximus in Circus.jsx (session 6).
function palatine(b) {
  // Magna Mater, on the south-west corner
  {
    const p = PLACES.palace, c = Math.cos(p.rot), s = Math.sin(p.rot)
    const x = p.at[0] - 175 * c + 40 * s, z = p.at[1] + 175 * s + 40 * c
    b.at(x, heightAt(x, z), z, p.rot)
  }
  temple(b, { w: 18, d: 33, podium: 6, colH: 11, cols: 6, depthCols: 2, stone: C.marbleWarm })
  place(b, 'apollo')
  temple(b, { w: 24, d: 40, podium: 4, colH: 12, cols: 6, depthCols: 2, side: true, stone: C.marble })
}

// ---------- by the Tiber ----------
function riverside(b) {
  place(b, 'portunus')
  temple(b, { w: 12, d: 20, podium: 2.6, colH: 8.8, cols: 4, depthCols: 2, stone: C.travertine })
  place(b, 'hercules')
  roundTemple(b, { r: 7.4, podium: 1.5, colH: 10.6, n: 20, stone: C.marble, roof: C.roof })

  place(b, 'marcellus')
  theatre(b, { r: 65, h: 32, stone: C.travertine })
  place(b, 'octavia')
  enclosure(b, 120, 130, 11, C.marbleWarm, { porticoDepth: 8 })
  b.at(...b._at)
  b.frame.multiply(new THREE.Matrix4().makeTranslation(-25, 0, 0))
  temple(b, { w: 18, d: 30, podium: 3, colH: 10, cols: 6, depthCols: 2, side: true, stone: C.marble })
  b.frame.multiply(new THREE.Matrix4().makeTranslation(50, 0, 0))
  temple(b, { w: 18, d: 30, podium: 3, colH: 10, cols: 6, depthCols: 2, side: true, stone: C.marble })

  // the Tiber Island: temple of Aesculapius and buildings
  place(b, 'island')
  b.box(0, -6, 0, 240, 8, 50, C.travertine, 0, 0.85)
  b.at(PLACES.island.at[0], 2, PLACES.island.at[1], PLACES.island.rot)
  temple(b, { w: 16, d: 26, podium: 3, colH: 9, cols: 4, depthCols: 2, stone: C.marble })
  for (let i = 0; i < 6; i++) b.box(-95 + i * 28 + (i > 2 ? 30 : 0), 0, 6, 18, 9 + (i % 3) * 3, 22, C.stucco)

  // the bridges of AD 100
  const bridge = (x0, z0, x1, z1, wdt = 9) => {
    const len = Math.hypot(x1 - x0, z1 - z0)
    b.at((x0 + x1) / 2, -7, (z0 + z1) / 2, Math.atan2(x1 - x0, z1 - z0))
    b.box(0, 7.5, 0, wdt, 2, len, C.travertine)
    const n = Math.max(2, Math.round(len / 25))
    for (let i = 1; i < n; i++) b.box(0, -2, -len / 2 + (len * i) / n, wdt + 1, 9.5, 5, C.travertine, 0, 0.9)
    b.box(wdt / 2 - 0.3, 9.5, 0, 0.6, 1.1, len, C.travertine)
    b.box(-wdt / 2 + 0.3, 9.5, 0, 0.6, 1.1, len, C.travertine)
  }
  bridge(-640, 175, -548, 128) // Pons Fabricius (62 BC, still standing)
  bridge(-675, 255, -748, 300) // Pons Cestius
  bridge(-470, 330, -640, 400, 10) // Pons Aemilius
  bridge(-560, 590, -705, 640, 8) // Pons Sublicius (wooden; position uncertain)
  bridge(-1180, 0, -1290, 60, 10) // Pons Agrippae
  bridge(-1590, -890, -1495, -960, 9) // Pons Neronianus

  place(b, 'emporium')
  // Porticus Aemilia: the great warehouse by the river port, 487 m long
  for (let i = 0; i < 25; i++) {
    const x = -243 + 9.5 + i * 19.4
    b.box(x, 0, 0, 18.6, 10, 60, C.tuff)
    b.gable(x, 10, 0, 18.8, 4, 60.5, C.roof)
  }
}

// ---------- Campus Martius ----------
function campus(b) {
  place(b, 'pompey')
  theatre(b, { r: 80, h: 34, stone: C.travertine })
  // temple of Venus Victrix at the top of the seats
  b.frame.multiply(new THREE.Matrix4().makeTranslation(0, 22, -78))
  temple(b, { w: 22, d: 26, podium: 4, colH: 10, cols: 6, depthCols: 2, stone: C.marble })
  place(b, 'porticusPompey')
  enclosure(b, 180, 135, 11, C.marbleWarm, { porticoDepth: 9 })
  for (let i = 0; i < 4; i++) b.box(-60 + i * 40, 0, 0, 30, 0.6, 80, C.green)

  place(b, 'stadium')
  b.box(0, 0, 0, 275, 0.3, 50, C.sand)
  for (const side of [-1, 1]) {
    b.box(-10, 0, side * 40, 250, 20, 22, C.travertine, 0, 0.96)
    b.box(-10, 0, side * 29, 250, 6, 1.2, C.marble)
  }
  b.box(-137, 0, 0, 2, 20, 106, C.travertine)
  b.box(137, 0, 0, 2, 20, 106, C.travertine)

  place(b, 'pantheon')
  // Agrippa's Pantheon as restored by Domitian: its form is not known.
  // Shown as a plain rectangular temple, labelled as uncertain.
  temple(b, { w: 44, d: 30, podium: 2, colH: 12, cols: 8, depthCols: 2, stone: C.marbleWarm, roof: C.bronze })
  place(b, 'bathsAgrippa')
  b.box(0, 0, 0, 110, 16, 90, C.brick)
  b.cyl(0, 16, 0, 15, 15, 6, C.brick, 20)
  b.cone(0, 22, 0, 15, 5, C.roofDark, 20)
  b.hip(-38, 16, 0, 30, 4, 88, C.roof)
  b.hip(38, 16, 0, 30, 4, 88, C.roof)
  place(b, 'bathsNero')
  b.box(0, 0, 0, 190, 18, 120, C.brick)
  b.box(0, 18, 0, 80, 10, 40, C.brick, 0, 0.94)
  b.gable(0, 28, 0, 81, 8, 41, C.roofDark, Math.PI / 2)
  b.hip(-70, 18, 0, 48, 4, 118, C.roof)
  b.hip(70, 18, 0, 48, 4, 118, C.roof)
  place(b, 'saepta')
  enclosure(b, 300, 95, 14, C.marbleWarm, { porticoDepth: 12 })

  place(b, 'mausoleum')
  b.cyl(0, 0, 0, 45, 45, 12, C.travertine, 48)
  b.cyl(0, 12, 0, 40, 26, 14, C.green, 32)
  b.cyl(0, 26, 0, 14, 14, 10, C.travertine, 24)
  b.cyl(0, 36, 0, 6, 6, 3, C.travertine, 16)
  b.box(0, 39, 0, 2, 5, 2, C.bronze)
}

// ---------- outskirts ----------
function outskirts(b) {
  place(b, 'castra')
  const w = 440, d = 380
  for (const [x, z, ww, dd] of [[0, -d / 2, w, 3], [0, d / 2, w, 3], [-w / 2, 0, 3, d], [w / 2, 0, 3, d]]) b.box(x, 0, z, ww, 7, dd, C.brick)
  for (let i = 0; i < 18; i++) b.box(-180 + (i % 6) * 72, 0, -140 + Math.floor(i / 6) * 120, 60, 8, 40, C.brick, 0, 0.95)
  for (let i = 0; i < 18; i++) b.hip(-180 + (i % 6) * 72, 8, -140 + Math.floor(i / 6) * 120, 61, 3, 41, C.roof)
}

// The aqueducts: the Aqua Claudia and Anio Novus arriving from the south-east
// on one line of arches, and Nero's branch over the Caelian to the Palatine.
function aqueducts(b) {
  // Arches stand about `lift` metres over the ground, smoothed over 200 m so
  // the water channel runs level rather than following every bump.
  const run = (pts, lift, step = 6.3) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, z0] = pts[i], [x1, z1] = pts[i + 1]
      const len = Math.hypot(x1 - x0, z1 - z0)
      const ang = Math.atan2(x1 - x0, z1 - z0)
      const n = Math.round(len / step)
      const ux = (x1 - x0) / len, uz = (z1 - z0) / len
      for (let k = 0; k < n; k++) {
        const f = (k + 0.5) / n
        const x = x0 + (x1 - x0) * f, z = z0 + (z1 - z0) * f
        const g = heightAt(x, z)
        let top = -Infinity
        for (const o of [-100, -50, 0, 50, 100]) top = Math.max(top, heightAt(x + ux * o, z + uz * o))
        const yTop = top + lift
        b.at(x, g, z, ang)
        b.box(0, -1, 0, 3, yTop - g - 1.6, 3.4, C.tuff)
        b.box(0, yTop - g - 2.6, 0, 3.4, 2.6, step + 0.05, C.tuff, 0, 0.94)
      }
    }
  }
  run([[2500, 120], [3300, 700], [4300, 1500], [5500, 2400], [7000, 3500]], 22)
  run([[2500, 120], [1900, 430], [1300, 620], [880, 560]], 14, 7.5)
}

export function Landmarks() {
  const { stone, gold } = useMemo(() => {
    const t0 = performance.now()
    const b = new Builder()
    const g = new Builder()
    capitol(b, g)
    fora.call(b)
    valley(b)
    palatine(b)
    riverside(b)
    campus(b)
    outskirts(b)
    aqueducts(b)
    const out = { stone: b.merge(), gold: g.parts.length ? g.merge() : null }
    window.__landmarks = { ms: Math.round(performance.now() - t0), triangles: out.stone.attributes.position.count / 3 }
    return out
  }, [])
  const materials = useMemo(
    () => ({
      stone: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.86, metalness: 0, side: THREE.DoubleSide }),
      gold: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.38, metalness: 0.85, side: THREE.DoubleSide }),
    }),
    [],
  )
  const now = useNow()
  return (
    <group>
      <mesh geometry={stone} material={now ? GHOST : materials.stone} castShadow={!now} receiveShadow={!now} />
      {gold && <mesh geometry={gold} material={now ? GHOST : materials.gold} castShadow={!now} />}
    </group>
  )
}

export { DEG, along, facing }
