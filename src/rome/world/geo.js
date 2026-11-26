// Shape generators for Roman architecture. A Builder collects coloured parts
// in a local frame (x right, y up, z towards the front) and merges them into
// one geometry, so a whole district of monuments is a single draw call.
import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

const tmpM = new THREE.Matrix4()
const tmpQ = new THREE.Quaternion()
const tmpS = new THREE.Vector3()
const tmpP = new THREE.Vector3()
const UP = new THREE.Vector3(0, 1, 0)
const col = new THREE.Color()

function colourise(g, hex, shade = 1) {
  const geo = g.index ? g.toNonIndexed() : g.clone()
  const n = geo.attributes.position.count
  col.set(hex).multiplyScalar(shade)
  const c = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    c[i * 3] = col.r
    c[i * 3 + 1] = col.g
    c[i * 3 + 2] = col.b
  }
  geo.setAttribute('color', new THREE.BufferAttribute(c, 3))
  geo.deleteAttribute('uv')
  if (!geo.attributes.normal) geo.computeVertexNormals()
  return geo
}

// A triangular prism: a gable roof with closed ends (the pediments).
// Width w across, depth d along z, height h; ridge along z.
function gableGeometry(w, h, d) {
  const x = w / 2, z = d / 2
  const v = [
    // two roof slopes
    -x, 0, z, 0, h, z, 0, h, -z, -x, 0, z, 0, h, -z, -x, 0, -z,
    x, 0, z, x, 0, -z, 0, h, -z, x, 0, z, 0, h, -z, 0, h, z,
    // front and back triangles
    -x, 0, z, x, 0, z, 0, h, z,
    x, 0, -z, -x, 0, -z, 0, h, -z,
  ]
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3))
  g.computeVertexNormals()
  return g
}

// A hipped roof over a w × d rectangle, ridge along the longer side.
export function hipGeometry() {
  // unit footprint 1 × 1, height 1, ridge along x from -0.25 to 0.25
  const r = 0.25
  const v = [
    -0.5, 0, 0.5, 0.5, 0, 0.5, r, 1, 0, -0.5, 0, 0.5, r, 1, 0, -r, 1, 0, // south slope
    0.5, 0, -0.5, -0.5, 0, -0.5, -r, 1, 0, 0.5, 0, -0.5, -r, 1, 0, r, 1, 0, // north slope
    0.5, 0, 0.5, 0.5, 0, -0.5, r, 1, 0, // east hip
    -0.5, 0, -0.5, -0.5, 0, 0.5, -r, 1, 0, // west hip
  ]
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3))
  g.computeVertexNormals()
  return g
}

// A wedge seat bank: a ring sector that rises from the inner to the outer edge.
// Used for the cavea of amphitheatres, theatres and circuses.
function ellipseRingGeometry(a0, b0, a1, b1, y0, y1, seg, from = 0, to = Math.PI * 2) {
  const pos = []
  for (let i = 0; i < seg; i++) {
    const t0 = from + ((to - from) * i) / seg, t1 = from + ((to - from) * (i + 1)) / seg
    const p = (a, b, t, y) => [a * Math.cos(t), y, b * Math.sin(t)]
    const A = p(a0, b0, t0, y0), B = p(a0, b0, t1, y0), C = p(a1, b1, t1, y1), D = p(a1, b1, t0, y1)
    pos.push(...A, ...C, ...B, ...A, ...D, ...C)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.computeVertexNormals()
  return g
}

// A wall panel w wide and h high with an arched opening (ow wide, oh high to
// the crown), d deep. Cached by size; the Builder clones it per use.
const archCache = new Map()
export function archPanelGeometry(w, h, ow, oh, d) {
  const key = [w, h, ow, oh, d].join('|')
  if (archCache.has(key)) return archCache.get(key)
  const s = new THREE.Shape()
  s.moveTo(-w / 2, 0)
  s.lineTo(w / 2, 0)
  s.lineTo(w / 2, h)
  s.lineTo(-w / 2, h)
  s.lineTo(-w / 2, 0)
  const r = ow / 2
  const hole = new THREE.Path()
  hole.moveTo(-r, 0)
  hole.lineTo(-r, oh - r)
  hole.absarc(0, oh - r, r, Math.PI, 0, true)
  hole.lineTo(r, 0)
  hole.lineTo(-r, 0)
  s.holes.push(hole)
  const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 6 })
  g.translate(0, 0, -d / 2)
  archCache.set(key, g)
  return g
}

export class Builder {
  constructor() {
    this.parts = []
    this.frame = new THREE.Matrix4()
  }
  // Place following parts at (x, y, z), turned so local +z faces `face` radians
  // (0 = towards +z, south). Every monument starts with at().
  at(x, y, z, face = 0) {
    this._at = [x, y, z, face]
    this.frame.compose(tmpP.set(x, y, z), tmpQ.setFromAxisAngle(UP, face), tmpS.set(1, 1, 1))
    return this
  }
  push(g, hex, local, shade) {
    const geo = colourise(g, hex, shade)
    geo.applyMatrix4(tmpM.multiplyMatrices(this.frame, local))
    this.parts.push(geo)
    return this
  }
  local(x, y, z, ry = 0, sx = 1, sy = 1, sz = 1) {
    return new THREE.Matrix4().compose(tmpP.set(x, y, z), tmpQ.setFromAxisAngle(UP, ry), tmpS.set(sx, sy, sz))
  }
  // A box standing on y (its base), centred on x, z.
  box(x, y, z, w, h, d, hex, ry = 0, shade) {
    return this.push(new THREE.BoxGeometry(w, h, d), hex, this.local(x, y + h / 2, z, ry), shade)
  }
  arched(x, y, z, w, h, d, ow, oh, hex, ry = 0, shade) {
    return this.push(archPanelGeometry(w, h, ow, oh, d), hex, this.local(x, y, z, ry), shade)
  }
  // Stepped seating round an ellipse: rows of risers and treads.
  steps(a0, b0, y0, rows, rise, tread, hex, seg = 96, altHex) {
    const pos = []
    const col = []
    const c1 = new THREE.Color(hex), c2 = new THREE.Color(altHex || hex).multiplyScalar(0.93)
    const P = (a, b, t, y) => [a * Math.cos(t), y, b * Math.sin(t)]
    for (let k = 0; k < rows; k++) {
      const a = a0 + k * tread, b = b0 + k * tread, y = y0 + k * rise
      const cc = k % 2 ? c2 : c1
      for (let i = 0; i < seg; i++) {
        const t0 = (i / seg) * Math.PI * 2, t1 = ((i + 1) / seg) * Math.PI * 2
        // riser
        const r0 = P(a, b, t0, y), r1 = P(a, b, t1, y), R1 = P(a, b, t1, y + rise), R0 = P(a, b, t0, y + rise)
        // tread
        const T0 = P(a + tread, b + tread, t0, y + rise), T1 = P(a + tread, b + tread, t1, y + rise)
        pos.push(...r0, ...R1, ...r1, ...r0, ...R0, ...R1, ...R0, ...T1, ...R1, ...R0, ...T0, ...T1)
        for (let v = 0; v < 6; v++) col.push(cc.r * 0.82, cc.g * 0.82, cc.b * 0.82)
        for (let v = 0; v < 6; v++) col.push(cc.r, cc.g, cc.b)
      }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
    g.computeVertexNormals()
    g.applyMatrix4(this.frame)
    this.parts.push(g)
    return this
  }
  cyl(x, y, z, r0, r1, h, hex, seg = 8, shade) {
    return this.push(new THREE.CylinderGeometry(r1, r0, h, seg, 1, false), hex, this.local(x, y + h / 2, z), shade)
  }
  cone(x, y, z, r, h, hex, seg = 12) {
    return this.push(new THREE.ConeGeometry(r, h, seg), hex, this.local(x, y + h / 2, z))
  }
  gable(x, y, z, w, h, d, hex, ry = 0) {
    return this.push(gableGeometry(w, h, d), hex, this.local(x, y, z, ry))
  }
  hip(x, y, z, w, h, d, hex, ry = 0) {
    const turn = d > w ? Math.PI / 2 : 0
    const [W, D] = d > w ? [d, w] : [w, d]
    return this.push(hipGeometry(), hex, this.local(x, y, z, ry + turn, W, h, D))
  }
  bank(a0, b0, a1, b1, y0, y1, hex, seg = 64, from, to) {
    return this.push(ellipseRingGeometry(a0, b0, a1, b1, y0, y1, seg, from, to), hex, this.local(0, 0, 0))
  }
  // A vertical elliptical wall band from y0 to y1, thickness t (outwards).
  band(a, b, y0, y1, t, hex, seg = 96, shade) {
    const pos = []
    const P = (A, B, ang, y) => [A * Math.cos(ang), y, B * Math.sin(ang)]
    for (let i = 0; i < seg; i++) {
      const t0 = (i / seg) * Math.PI * 2, t1 = ((i + 1) / seg) * Math.PI * 2
      const o0 = P(a, b, t0, y0), o1 = P(a, b, t1, y0), O1 = P(a, b, t1, y1), O0 = P(a, b, t0, y1)
      const i0 = P(a - t, b - t, t0, y0), i1 = P(a - t, b - t, t1, y0), I1 = P(a - t, b - t, t1, y1), I0 = P(a - t, b - t, t0, y1)
      pos.push(...o0, ...O1, ...o1, ...o0, ...O0, ...O1) // outer face
      pos.push(...i0, ...i1, ...I1, ...i0, ...I1, ...I0) // inner face
      pos.push(...O0, ...I1, ...O1, ...O0, ...I0, ...I1) // top
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.computeVertexNormals()
    return this.push(g, hex, this.local(0, 0, 0), shade)
  }
  disc(a, b, y, hex, seg = 48) {
    const g = new THREE.CircleGeometry(1, seg).rotateX(-Math.PI / 2)
    return this.push(g, hex, this.local(0, y, 0, 0, a, 1, b))
  }
  merge() {
    const g = mergeGeometries(this.parts)
    this.parts = []
    return g
  }
}

// ---------- building types ----------
// Each takes a builder already placed with at(); measurements in metres.

// A columned temple on a podium. Front (steps, portico) faces local +z.
// cols: columns across the front; side: true for columns down the flanks too.
export function temple(b, o) {
  const {
    w, d, podium = 3, colH = 12, cols = 6, depthCols = 3, side = false, stone = '#E8DDC8', podiumCol = '#CFC2A8',
    roof = '#A9573C', cella = stone, accent = '#B0473A', gilt,
  } = o
  const r = Math.min(0.75, (w / cols) * 0.17)
  b.box(0, 0, 0, w, podium, d, podiumCol)
  // front steps, filling the space in front of the podium face
  b.box(0, 0, d / 2 + podium * 0.6, w * 0.7, podium * 0.5, podium * 1.2, podiumCol, 0, 0.95)
  b.box(0, podium * 0.5, d / 2 + podium * 0.3, w * 0.7, podium * 0.5, podium * 0.6, podiumCol, 0, 0.97)
  const top = podium
  const inset = r * 1.6
  const xs = []
  for (let i = 0; i < cols; i++) xs.push(-w / 2 + inset + ((w - 2 * inset) * i) / (cols - 1))
  const porch = Math.min(d * 0.42, (depthCols * (w - 2 * inset)) / (cols - 1))
  const zFront = d / 2 - inset
  // front columns, several rows deep (the pronaos)
  for (let row = 0; row < depthCols; row++) {
    const z = zFront - (row * porch) / Math.max(1, depthCols)
    for (const x of xs) b.cyl(x, top, z, r * 1.08, r * 0.9, colH, stone, 8)
  }
  if (side) {
    const nSide = Math.round((d - 2 * inset) / ((w - 2 * inset) / (cols - 1)))
    for (let i = depthCols; i <= nSide; i++) {
      const z = zFront - ((d - 2 * inset) * i) / nSide
      b.cyl(xs[0], top, z, r * 1.08, r * 0.9, colH, stone, 8)
      b.cyl(xs[cols - 1], top, z, r * 1.08, r * 0.9, colH, stone, 8)
    }
  }
  // the cella behind the porch
  const cw = side ? w - inset * 4 : w - inset * 0.4
  const cd = d - porch - inset * 1.5
  b.box(0, top, -d / 2 + cd / 2 + inset * 0.2, cw, colH, cd, cella, 0, 0.92)
  // entablature: architrave and a painted frieze band
  const ent = colH * 0.2
  b.box(0, top + colH, 0, w, ent * 0.55, d, stone)
  b.box(0, top + colH + ent * 0.55, 0, w * 1.01, ent * 0.45, d * 1.005, accent, 0, 0.9)
  // roof and pediments
  const ph = w * 0.22
  b.gable(0, top + colH + ent, 0, w * 1.04, ph, d * 1.02, roof)
  if (gilt) {
    gilt.frame.copy(b.frame)
    gilt.gable(0, top + colH + ent + 0.05, 0, w * 1.045, ph, d * 1.025, '#D8B25A')
  }
  return top + colH + ent + ph
}

// A round temple (Vesta): ring of columns round a cylindrical cella, cone roof.
export function roundTemple(b, { r, podium = 3, colH = 8, n = 20, stone = '#EEE6D6', roof = '#B98A55' }) {
  b.cyl(0, 0, 0, r + 1, r + 1, podium, '#D8CCB4', 24)
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    b.cyl(Math.cos(a) * r, podium, Math.sin(a) * r, 0.4, 0.34, colH, stone, 6)
  }
  b.cyl(0, podium, 0, r - 1.6, r - 1.6, colH, stone, 24, 0.92)
  b.cyl(0, podium + colH, 0, r + 0.5, r + 0.5, 1.2, stone, 24)
  b.cone(0, podium + colH + 1.2, 0, r + 0.7, r * 0.55, roof, 24)
}

// A basilica: two storeys of arcades round a tall central hall with a
// clerestory. Long side along local x.
export function basilica(b, { w, d, h = 20, stone = '#E6DAC2', roof = '#A9573C', inner = '#7A5A45' }) {
  const aisle = d * 0.22
  const storey = h * 0.42
  // outer arcade: piers along the long front and back, two storeys
  const bays = Math.max(6, Math.round(w / 6))
  for (let s = 0; s < 2; s++) {
    const y = s * storey
    for (let i = 0; i <= bays; i++) {
      const x = -w / 2 + (w * i) / bays
      b.box(x, y, d / 2 - 0.9, 1.6, storey * 0.82, 1.8, stone)
      b.box(x, y, -d / 2 + 0.9, 1.6, storey * 0.82, 1.8, stone)
    }
    b.box(0, y + storey * 0.82, d / 2 - 0.9, w + 1.6, storey * 0.18, 1.8, stone, 0, 0.96)
    b.box(0, y + storey * 0.82, -d / 2 + 0.9, w + 1.6, storey * 0.18, 1.8, stone, 0, 0.96)
  }
  // shadowy interior behind the arcades
  b.box(0, 0, 0, w - 2, storey * 2 - 0.5, d - 5, inner)
  // side walls
  b.box(-w / 2, 0, 0, 1.8, storey * 2, d, stone)
  b.box(w / 2, 0, 0, 1.8, storey * 2, d, stone)
  // aisle roofs
  b.hip(0, storey * 2, d / 2 - aisle / 2, w + 2, 2.2, aisle, roof)
  b.hip(0, storey * 2, -d / 2 + aisle / 2, w + 2, 2.2, aisle, roof)
  // clerestory over the nave
  const nave = d - aisle * 2
  b.box(0, storey * 2, 0, w - 2, h - storey * 2, nave, stone, 0, 0.95)
  for (let i = 1; i < bays; i += 1) {
    const x = -w / 2 + (w * i) / bays
    b.box(x, storey * 2 + 1.5, nave / 2 + 0.05, 2.2, (h - storey * 2) * 0.55, 0.2, '#3E342D')
    b.box(x, storey * 2 + 1.5, -nave / 2 - 0.05, 2.2, (h - storey * 2) * 0.55, 0.2, '#3E342D')
  }
  b.gable(0, h, 0, nave + 1, nave * 0.2, w + 1, roof, Math.PI / 2)
}

// A colonnade (portico): a single row of columns with a lean-to roof.
// From (x0, z0) to (x1, z1) in local coordinates; roof on the left side.
export function portico(b, x0, z0, x1, z1, { h = 8, depth = 6, stone = '#E3D7C0', roof = '#A9573C', spacing = 4 }) {
  const len = Math.hypot(x1 - x0, z1 - z0)
  const n = Math.max(2, Math.round(len / spacing))
  const ang = Math.atan2(x1 - x0, z1 - z0)
  const nx = Math.cos(ang), nz = -Math.sin(ang) // to the left of the line
  for (let i = 0; i <= n; i++) {
    const f = i / n
    b.cyl(x0 + (x1 - x0) * f, 0, z0 + (z1 - z0) * f, 0.42, 0.36, h, stone, 6)
  }
  const mx = (x0 + x1) / 2 + (nx * depth) / 2, mz = (z0 + z1) / 2 + (nz * depth) / 2
  b.box(mx, h, mz, depth + 1, 0.9, len + 1, stone, ang)
  b.hip(mx, h + 0.9, mz, depth + 1.5, 1.6, len + 1.5, roof, ang)
}

// An arch: one bay, attic on top. Width along local x.
export function arch(b, { w, d, h, open = 0.5, stone = '#E9DFCB' }) {
  const ow = w * open
  const pier = (w - ow) / 2
  b.box(-w / 2 + pier / 2, 0, 0, pier, h * 0.72, d, stone)
  b.box(w / 2 - pier / 2, 0, 0, pier, h * 0.72, d, stone)
  b.box(0, h * 0.72 - ow * 0.25, 0, ow, ow * 0.25, d, stone, 0, 0.96)
  b.box(0, h * 0.72, 0, w, h * 0.28, d, stone)
}

// A semicircular theatre facing local +z, with its stage building.
export function theatre(b, { r, h, stone = '#D9CBAE', seats = '#CBBEA4' }) {
  b.bank(r * 0.3, r * 0.3, r, r, 1.5, h - 2, seats, 32, Math.PI, Math.PI * 2)
  // outer arcaded wall
  const n = 36
  for (let i = 0; i <= n; i++) {
    const a = Math.PI + (Math.PI * i) / n
    b.box(Math.cos(a) * r, 0, Math.sin(a) * r, 2.2, h, 2.2, stone, -a)
  }
  b.bank(r, r, r + 0.5, r + 0.5, h, h, stone, 32, Math.PI, Math.PI * 2)
  // stage building
  b.box(0, 0, r * 0.12, r * 2.05, h * 0.95, r * 0.18, stone, 0, 0.95)
  b.disc(r * 0.3, r * 0.3, 0.3, '#B8A88A', 24)
}
