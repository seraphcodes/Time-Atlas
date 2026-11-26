// The Roman Forum in AD 100. Building centres come from published
// coordinates (layout.js); sizes and status from HISTORY.md. Each building is
// set in its own frame: local x along its width, +z towards its front.
// Removed after session 1: the seven honorific columns on the south side of
// the square, which are Diocletian's (about AD 303), two centuries too late.
import { useMemo } from 'react'
import * as THREE from 'three'
import { GHOST, useNow } from './era'
import { Builder, roundTemple, arch } from './geo'
import { PLACES, FORUM, fp, along } from './layout'
import { heightAt } from './terrain'
import { C } from './colours'
import { Crowd } from './Colosseum'

const COARSE = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
const FORCED = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('q')
const LITE = FORCED === 'low' || (COARSE && FORCED !== 'high')

// Paint: Roman temples were coloured. Exact schemes are not known (Inferred).
const P = { frieze: '#9E4336', blue: '#4F6683', cap: '#E9D9A8', door: '#5B4A2E', bronze: '#77693F' }

function at(b, name, y) {
  const p = PLACES[name]
  const g = y ?? heightAt(p.at[0], p.at[1])
  b.at(p.at[0], g, p.at[1], p.rot)
  return g
}

// A Roman temple on a high podium, steps in front, columns with bases and
// capitals, cella with bronze doors, painted frieze, pediment and tiled roof.
function temple(b, g, o) {
  const { w, d, podium = 4, colH = 12, cols = 6, depthCols = 2, side = false, peri = false, stone = C.marble, roof = C.roof, gilt = false, steps = 'front' } = o
  const r = Math.min(0.8, ((w - 2) / cols) * 0.16)
  // podium with a moulded top and foot
  b.box(0, 0, 0, w, podium, d, C.travertine)
  b.box(0, podium - 0.45, 0, w + 0.6, 0.45, d + 0.6, stone, 0, 0.97)
  b.box(0, 0, 0, w + 0.6, 0.5, d + 0.6, stone, 0, 0.94)
  // steps across the front
  if (steps === 'front') {
    const n = Math.max(4, Math.round(podium / 0.3))
    for (let i = 0; i < n; i++) b.box(0, 0, d / 2 + ((n - i) * 0.32), w * 0.82, ((i + 1) * podium) / n, 0.34, stone, 0, i % 2 ? 0.97 : 1)
  }
  const top = podium
  const inset = r * 1.7
  const xs = []
  for (let i = 0; i < cols; i++) xs.push(-w / 2 + inset + ((w - 2 * inset) * i) / (cols - 1))
  const space = (w - 2 * inset) / (cols - 1)
  const zFront = d / 2 - inset
  const column = (x, z) => {
    b.box(x, top, z, r * 2.6, 0.45, r * 2.6, stone, 0, 0.96)
    b.cyl(x, top + 0.45, z, r, r * 0.86, colH - 1.35, stone, 10)
    b.box(x, top + colH - 0.9, z, r * 2.5, 0.9, r * 2.5, P.cap) // capital
  }
  for (let row = 0; row < depthCols; row++) for (const x of xs) column(x, zFront - row * space)
  const back = -d / 2 + inset
  if (side || peri) {
    for (let z = zFront - depthCols * space; z >= back - 0.01; z -= space) {
      column(xs[0], z)
      column(xs[cols - 1], z)
    }
  }
  if (peri) for (const x of xs.slice(1, -1)) column(x, back)
  // cella
  const cw = side || peri ? w - inset * 4.2 : w - 0.4
  const cz0 = zFront - (depthCols - 0.4) * space
  const cd = cz0 - (peri ? back + inset : -d / 2)
  b.box(0, top, cz0 - cd / 2, cw, colH, cd, stone, 0, 0.93)
  b.box(0, top, cz0 + 0.06, Math.min(4.5, cw * 0.28), colH * 0.62, 0.12, P.door)
  // entablature: architrave, painted frieze, cornice
  const e = colH * 0.22
  b.box(0, top + colH, 0, w, e * 0.4, d, stone)
  b.box(0, top + colH + e * 0.4, 0, w - 0.1, e * 0.35, d - 0.1, P.frieze)
  b.box(0, top + colH + e * 0.75, 0, w + 0.7, e * 0.25, d + 0.7, stone, 0, 1.03)
  // pediment and roof; a tympanum painted blue behind its sculpture
  const ph = w * 0.2
  const ry = top + colH + e
  b.gable(0, ry, 0, w + 0.9, ph, d + 0.8, roof)
  b.gable(0, ry + 0.05, d / 2 + 0.42, w - 1, ph - 0.8, 0.1, P.blue)
  for (let i = -2; i <= 2; i++) b.box(i * w * 0.12, ry + 0.25, d / 2 + 0.5, 0.9, ph * (0.65 - Math.abs(i) * 0.12), 0.5, stone)
  b.box(0, ry + ph, d / 2 + 0.3, 1.2, 1.6, 0.8, stone) // acroterion
  if (gilt) {
    g.frame.copy(b.frame)
    g.gable(0, ry + 0.04, 0, w + 0.95, ph, d + 0.85, '#D8B25A')
  }
  return ry + ph
}

// A basilica: arcaded storeys round all four sides, a high nave with a
// clerestory, tiled roofs. Long side along local x, front (the Forum) at -z.
function basilica(b, { w, d, storeys = 2, bay = 5.6, h1 = 10, h2 = 8, nave = 18, naveH = 26, stone = C.marble }) {
  b.box(0, -0.6, 0, w + 2, 0.9, d + 2, stone, 0, 0.94)
  for (let i = 0; i < 7; i++) b.box(0, -0.6, -d / 2 - 1 - i * 0.38, w + 2, 0.9 - i * 0.13, 0.4, stone, 0, i % 2 ? 0.96 : 1) // steps to the Forum
  const nx = Math.round(w / bay), nz = Math.round(d / bay)
  const bw = w / nx, bd = d / nz
  const hs = [h1, h2].slice(0, storeys)
  let y = 0.3
  for (const h of hs) {
    for (let i = 0; i < nx; i++) {
      const x = -w / 2 + bw * (i + 0.5)
      b.arched(x, y, -d / 2 + 0.6, bw * 1.01, h - 1, 1.2, bw * 0.62, h * 0.72, stone)
      b.arched(x, y, d / 2 - 0.6, bw * 1.01, h - 1, 1.2, bw * 0.62, h * 0.72, stone)
      b.box(x - bw / 2, y, -d / 2, 0.9, h - 1, 0.5, stone, 0, 1.03) // pilaster
    }
    for (let i = 0; i < nz; i++) {
      const z = -d / 2 + bd * (i + 0.5)
      b.arched(-w / 2 + 0.6, y, z, bd * 1.01, h - 1, 1.2, bd * 0.62, h * 0.72, stone, Math.PI / 2)
      b.arched(w / 2 - 0.6, y, z, bd * 1.01, h - 1, 1.2, bd * 0.62, h * 0.72, stone, Math.PI / 2)
    }
    b.box(0, y + h - 1, -d / 2 + 0.6, w + 0.6, 1, 1.6, stone, 0, 1.03)
    b.box(0, y + h - 1, d / 2 - 0.6, w + 0.6, 1, 1.6, stone, 0, 1.03)
    b.box(-w / 2 + 0.6, y + h - 1, 0, 1.6, 1, d, stone, 0, 1.03)
    b.box(w / 2 - 0.6, y + h - 1, 0, 1.6, 1, d, stone, 0, 1.03)
    y += h
  }
  // dark interior seen through the arches, and the floor of coloured marble
  b.box(0, 0.3, 0, w - 2.6, y - 0.6, d - 2.6, '#4A3F36')
  // aisle roofs
  const aisle = (d - nave) / 2
  b.hip(0, y, -d / 2 + aisle / 2, w + 1, 2.4, aisle + 1, C.roof)
  b.hip(0, y, d / 2 - aisle / 2, w + 1, 2.4, aisle + 1, C.roof)
  // the nave: clerestory wall with windows, gabled roof
  b.box(0, y, 0, w - 4, naveH - y, nave, stone, 0, 0.95)
  for (let i = 1; i < nx - 1; i++) {
    const x = -w / 2 + bw * (i + 0.5)
    for (const s of [-1, 1]) b.box(x, y + 2.5, (s * nave) / 2 + s * 0.05, 2, (naveH - y) * 0.45, 0.2, '#3A312A')
  }
  b.gable(0, naveH, 0, nave + 1.2, nave * 0.22, w - 3, C.roof, Math.PI / 2)
  return naveH
}

// Statues on bases: bronze figures, some on horseback (Inferred).
function statue(b, x, z, ry = 0, rider = false) {
  b.box(x, 0, z, rider ? 3.2 : 1.6, 2.2, rider ? 1.7 : 1.6, C.marble, ry)
  if (rider) {
    b.box(x, 2.2, z, 2.6, 1.3, 0.8, P.bronze, ry)
    b.box(x, 3.5, z, 0.6, 1.4, 0.6, P.bronze, ry)
  } else {
    b.cyl(x, 2.2, z, 0.38, 0.3, 1.6, P.bronze, 8)
    b.cyl(x, 3.8, z, 0.17, 0.17, 0.32, P.bronze, 6)
  }
}

function build() {
  const b = new Builder()
  const g = new Builder()

  // ---- the square and its paving ----
  const f = PLACES.forum
  b.at(f.at[0], 0, f.at[1], f.rot)
  b.box(0, -0.45, 0, FORUM.length + 20, 0.55, FORUM.width + 14, '#DAD0BC')
  for (let i = -6; i <= 6; i++) b.box(i * 9.5, 0.1, 0, 0.08, 0.02, FORUM.width + 10, '#C7BCA5') // slab joints
  for (let j = -3; j <= 3; j++) b.box(0, 0.1, j * 8, FORUM.length + 16, 0.02, 0.08, '#C7BCA5')
  // statues along both long sides of the square
  for (let i = 0; i < 9; i++) {
    statue(b, -48 + i * 12, 27, Math.PI)
    statue(b, -44 + i * 12, -27, 0, i === 4)
  }

  // ---- Lacus Curtius: a paved enclosure; beside it a fig, an olive and a
  // vine, and the statue of Marsyas (Pliny, Natural History 15.78) ----
  at(b, 'lacusCurtius', 0)
  b.box(0, 0, 0, 9, 0.6, 7, C.travertine)
  b.box(0, 0.6, 0, 7.6, 0.2, 5.6, '#BFB29A')
  b.cyl(0, 0.6, 0, 1.3, 1.3, 1, C.marble, 12)
  b.box(9, 0, 0, 1.4, 2, 1.4, C.marble)
  b.cyl(9, 2, 0, 0.32, 0.28, 1.5, P.bronze, 8)

  // ---- Basilica Julia, 101 × 49 m, law courts ----
  at(b, 'basilicaJulia')
  basilica(b, { w: 101, d: 49, h1: 11, h2: 9, nave: 18, naveH: 27 })

  // ---- Basilica Aemilia, with the portico of shops on the square ----
  at(b, 'basilicaAemilia')
  b.frame.multiply(new THREE.Matrix4().makeRotationY(Math.PI)) // front (local -z) to the square
  basilica(b, { w: 90, d: 29, h1: 10, h2: 8, nave: 12, naveH: 24, bay: 5.6, stone: C.marbleWarm })
  // shops (tabernae) behind a two-storey portico facing the square
  b.box(0, 0.3, -d2(29) - 5.5, 92, 7.5, 9, C.marbleWarm, 0, 0.96)
  for (let i = 0; i < 16; i++) b.box(-42.5 + i * 5.67, 0.3, -d2(29) - 10.05, 3, 4, 0.12, '#3A312A')
  for (let i = 0; i <= 16; i++) b.cyl(-45.3 + i * 5.67, 0.3, -d2(29) - 11, 0.42, 0.36, 7.2, C.marble, 8)
  b.box(0, 7.5, -d2(29) - 6.5, 92, 1, 11, C.marble)
  b.hip(0, 8.5, -d2(29) - 6.5, 92.5, 1.8, 11.5, C.roof)

  // ---- the Senate house: brick and stucco, bronze doors, tall gable ----
  at(b, 'curia')
  b.box(0, 0, 0, 18, 1.2, 27, C.travertine)
  b.box(0, 1.2, 0, 18, 9, 27, '#E9DCC4') // lower walls, stucco imitating marble blocks
  b.box(0, 10.2, 0, 18, 12.6, 27, '#E2D2B5', 0, 0.97)
  for (let i = -1; i <= 1; i++) b.box(i * 4.2, 14, 13.56, 2.6, 5.4, 0.15, '#3A312A') // three windows
  b.box(0, 1.2, 13.56, 4.6, 7.6, 0.2, P.bronze) // bronze doors
  b.box(0, 9.2, 13.6, 6, 0.6, 0.6, C.marble)
  b.box(0, 22.8, 0, 18.6, 1, 27.6, C.marble)
  b.gable(0, 23.8, 0, 19, 4.8, 28, C.roof)
  for (let i = 0; i < 6; i++) b.box(0, 0, 14 + i * 0.38, 12, 1.2 - i * 0.2, 0.4, C.marble) // steps

  // ---- the Rostra: speakers' platform with bronze ships' beaks ----
  at(b, 'rostra')
  b.box(0, 0, 0, 24, 3.6, 12, C.marble)
  b.box(0, 3.6, 0, 24, 0.9, 12, C.marble, 0, 1.03)
  for (let i = 0; i < 7; i++) {
    b.box(-10.5 + i * 3.5, 1.4, 6.6, 1.1, 0.9, 1.4, P.bronze)
    b.cone(-10.5 + i * 3.5, 1.4, 7.6, 0.45, 1.3, P.bronze, 6)
  }
  for (const x of [-9, -3, 3, 9]) statue(b, x, -2, 0)

  // ---- temples ----
  at(b, 'saturn')
  temple(b, g, { w: 22, d: 40, podium: 9, colH: 11, cols: 6, depthCols: 2 })
  // the Golden Milestone of Augustus (20 BC), from which distances were counted
  b.frame.multiply(new THREE.Matrix4().makeTranslation(15, 0, 26))
  b.box(0, 0, 0, 1.6, 0.6, 1.6, C.marble)
  g.frame.copy(b.frame)
  g.cyl(0, 0.6, 0, 0.45, 0.45, 2.6, '#D8B25A', 12)

  at(b, 'vespasian')
  temple(b, g, { w: 22, d: 33, podium: 6.5, colH: 14, cols: 6, depthCols: 2 })
  at(b, 'concord')
  // Concord: a wide cella with a narrower porch in front (Tiberius)
  b.box(0, 0, -3, 45, 6.5, 24, C.travertine)
  b.box(0, 6.5, -6, 45, 15, 18, C.marble, 0, 0.94)
  b.gable(0, 21.5, -6, 46, 4, 19, C.roof, Math.PI / 2)
  b.frame.multiply(new THREE.Matrix4().makeTranslation(0, 0, 10))
  temple(b, g, { w: 18, d: 14, podium: 6.5, colH: 15, cols: 6, depthCols: 2 })

  at(b, 'tabularium')
  b.box(0, -14, 0, 73, 18, 20, C.tuff)
  for (let i = 0; i < 11; i++) b.arched(-30 + i * 6, -2, 10.2, 6, 10, 0.8, 3.4, 7.5, C.travertine)
  b.box(0, 8, 0, 73, 12, 18, C.travertine, 0, 0.95)
  b.hip(0, 20, 0, 74, 4, 19, C.roof)

  at(b, 'divusJulius')
  temple(b, g, { w: 26, d: 30, podium: 5.5, colH: 11, cols: 6, depthCols: 2, steps: 'side' })
  // the platform in front, with the round niche over the altar where Caesar was cremated
  b.box(0, 0, 18.5, 26, 3.6, 7, C.marble)
  b.box(0, 0, 22.05, 6, 3.2, 0.2, '#5E4F3E')
  for (const x of [-11, 11]) for (let i = 0; i < 6; i++) b.box(x, 0, 6 + i * 2, 4, 3.6 + i * 0.3, 2, C.marble, 0, 0.98)

  at(b, 'castor')
  temple(b, g, { w: 32, d: 50, podium: 7, colH: 12.5, cols: 8, depthCols: 3, peri: true })
  // the spring of Juturna, where the twins watered their horses
  b.frame.multiply(new THREE.Matrix4().makeTranslation(24, 0, 10))
  b.box(0, 0, 0, 7, 1.2, 7, C.marble)
  b.box(0, 1.15, 0, 5.8, 0.05, 5.8, '#6C8A92')

  at(b, 'vesta')
  roundTemple(b, { r: 7.5, podium: 3, colH: 8.5, n: 20, stone: C.marble, roof: P.bronze })
  at(b, 'regia')
  b.box(0, 0, 0, 20, 8, 14, C.tuff)
  b.box(0, 8, 0, 20.4, 0.6, 14.4, C.marble)
  b.hip(0, 8.6, 0, 21, 2.6, 15, C.roof)
  at(b, 'vestals')
  b.box(0, 0, -19, 70, 12, 7, C.stucco)
  b.box(0, 0, 19, 70, 12, 7, C.stucco)
  b.box(-32, 0, 0, 6, 12, 31, C.stucco)
  b.box(32, 0, 0, 6, 12, 31, C.stucco)
  b.box(0, 0, 0, 58, 0.5, 31, '#7E8F6A') // the garden court with its pools
  for (const x of [-15, 0, 15]) b.box(x, 0.5, 0, 9, 0.1, 5, '#6C8A92')
  for (const z of [-19, 19]) b.hip(0, 12, z, 71, 2.6, 8, C.roof)

  // ---- arches standing in AD 100 ----
  at(b, 'archAugustus') // the Parthian arch of Augustus, 19 BC: three bays (Inferred form)
  arch(b, { w: 7, d: 4.5, h: 14, open: 0.5, stone: C.marble })
  b.frame.multiply(new THREE.Matrix4().makeTranslation(6, 0, 0))
  arch(b, { w: 4.5, d: 4.5, h: 10, open: 0.45, stone: C.marble })
  b.frame.multiply(new THREE.Matrix4().makeTranslation(-12, 0, 0))
  arch(b, { w: 4.5, d: 4.5, h: 10, open: 0.45, stone: C.marble })
  at(b, 'archTiberius') // arch of Tiberius, AD 16 (Inferred form)
  arch(b, { w: 9, d: 4, h: 12, open: 0.5, stone: C.marble })
  at(b, 'archTitus')
  arch(b, { w: 13.5, d: 4.75, h: 15.4, open: 0.4, stone: C.marble })
  b.box(0, 15.4, 0, 4, 1.4, 2.6, C.marble)
  b.box(0, 16.8, 0, 3.4, 2.6, 2, P.bronze)

  return { stone: b.merge(), gold: g.merge() }
}
const d2 = (d) => d / 2

// People: magistrates and clients in white togas, shoppers, slaves, children.
function people(n) {
  let s = 2024
  const rand = () => ((s = (s + 0x6d2b79f5) | 0), (((s ^ (s >>> 15)) * (1 | s)) >>> 0) / 4294967296)
  const cols = ['#F2EEE4', '#F2EEE4', '#E9E3D4', '#C9A06B', '#9C6B4A', '#7E6A55', '#A64B3C', '#5A6670', '#B9B19E']
  const items = []
  const add = (x, z) => items.push([x, heightAt(x, z) + 0.05, z, cols[Math.floor(rand() * cols.length)], rand() * 6.28])
  for (let i = 0; i < n; i++) {
    const k = rand()
    if (k < 0.55) {
      // the square, with groups near the Rostra and the basilica steps
      const a = (rand() - 0.5) * 120, c = (rand() - 0.5) * 52
      const [x, z] = fp(a, c)
      add(x, z)
    } else if (k < 0.8) {
      const a = -50 + rand() * 170, c = -30 + (rand() - 0.5) * 7
      const [x, z] = fp(a, c)
      add(x, z) // the Sacra Via
    } else {
      // up the Sacra Via towards the Arch of Titus and the Colosseum
      const t = rand()
      const [x0, z0] = fp(118, -6)
      const x = x0 + (445 - x0) * t + (rand() - 0.5) * 8, z = z0 + (262 - z0) * t + (rand() - 0.5) * 8
      add(x, z)
    }
  }
  return items
}

export function Forum() {
  const parts = useMemo(() => {
    const t0 = performance.now()
    const out = { ...build(), crowd: people(LITE ? 700 : 1800) }
    window.__forum = { ms: Math.round(performance.now() - t0), triangles: out.stone.attributes.position.count / 3 }
    return out
  }, [])
  const mats = useMemo(
    () => ({
      stone: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.84, side: THREE.DoubleSide }),
      gold: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.35, metalness: 0.85 }),
    }),
    [],
  )
  const now = useNow()
  return (
    <group>
      <mesh geometry={parts.stone} material={now ? GHOST : mats.stone} castShadow={!now} receiveShadow={!now} />
      <mesh geometry={parts.gold} material={now ? GHOST : mats.gold} castShadow={!now} />
      {!now && <Crowd items={parts.crowd} />}
    </group>
  )
}

export { along }
