// The shape of Rome's land, as plain functions: the hills, the valleys between
// them and the Tiber. Everything that stands on the ground asks heightAt().
// Frame: x east, y up, z south, metres; origin at the centre of the Forum
// square. Heights relative to the Forum floor (about 12 m above sea level).
// See WORLD.md for how the positions were measured.

export const lerp = (a, b, t) => a + (b - a) * t
export const clamp = (x, a, b) => Math.min(b, Math.max(a, x))
export const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}
const DEG = Math.PI / 180

// Repeatable random numbers, so the city is identical on every visit.
export function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function hash2(ix, iz) {
  let n = Math.imul(ix, 374761393) + Math.imul(iz, 668265263)
  n = Math.imul(n ^ (n >>> 13), 1274126177)
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295
}
export function noise(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z)
  let fx = x - ix, fz = z - iz
  fx = fx * fx * (3 - 2 * fx)
  fz = fz * fz * (3 - 2 * fz)
  return lerp(lerp(hash2(ix, iz), hash2(ix + 1, iz), fx), lerp(hash2(ix, iz + 1), hash2(ix + 1, iz + 1), fx), fz)
}
export function fbm(x, z, oct = 3) {
  let s = 0, a = 0.5
  for (let i = 0; i < oct; i++) {
    s += a * noise(x, z)
    x = x * 2.03 + 17.1
    z = z * 2.03 + 5.3
    a *= 0.5
  }
  return s
}

// The hills: centre, half-lengths along and across the ridge, ridge direction
// (degrees, 0 = east, positive turns towards south) and height of the top.
export const HILLS = [
  { name: 'Capitoline', x: -245, z: -60, a: 205, b: 105, rot: -63, h: 36 },
  { name: 'Saddle', x: -95, z: -235, a: 150, b: 85, rot: -30, h: 30 }, // removed for Trajan's Forum after 106
  { name: 'Quirinal', x: 470, z: -1010, a: 780, b: 200, rot: -48, h: 46 },
  { name: 'Viminal', x: 960, z: -800, a: 450, b: 140, rot: -45, h: 44 },
  { name: 'Esquiline', x: 1450, z: -430, a: 560, b: 330, rot: -10, h: 44 },
  { name: 'Esquiline plateau', x: 2350, z: -150, a: 950, b: 720, rot: 10, h: 40 },
  { name: 'Oppian', x: 860, z: -40, a: 330, b: 200, rot: -20, h: 40 },
  { name: 'Velia', x: 330, z: 175, a: 130, b: 70, rot: 30, h: 16 },
  { name: 'Palatine', x: 135, z: 405, a: 235, b: 205, rot: -25, h: 38 },
  { name: 'Caelian', x: 950, z: 690, a: 480, b: 210, rot: -12, h: 36 },
  { name: 'Aventine', x: -420, z: 1020, a: 380, b: 310, rot: -30, h: 33 },
  { name: 'Lesser Aventine', x: 220, z: 1250, a: 260, b: 200, rot: -30, h: 28 },
  { name: 'Pincian', x: 250, z: -2150, a: 620, b: 320, rot: -10, h: 45 },
  { name: 'Janiculum', x: -1950, z: 300, a: 1500, b: 330, rot: 85, h: 70 },
  { name: 'Vatican', x: -2350, z: -1450, a: 560, b: 480, rot: 0, h: 40 },
]
for (const h of HILLS) {
  h.c = Math.cos(h.rot * DEG)
  h.s = Math.sin(h.rot * DEG)
}

// The Tiber's centre line (from the north, past the Campus Martius bend and the
// Tiber Island, south past the Aventine), from modern bridge positions.
export const TIBER = [
  [-1500, -3600], [-1268, -2608], [-1036, -2076], [-936, -1554], [-1180, -1230], [-1520, -1060],
  [-1640, -700], [-1560, -280], [-1218, 22], [-900, 160], [-646, 211], [-539, 355],
  [-610, 700], [-771, 1054], [-1102, 1942], [-1250, 2800], [-1300, 3800],
]
export const RIVER_HALF = 52
export const WATER_Y = -7

// Distance from the river's centre line.
export function riverDist(x, z) {
  let best = 1e9
  for (let i = 0; i < TIBER.length - 1; i++) {
    const [ax, az] = TIBER[i], [bx, bz] = TIBER[i + 1]
    const dx = bx - ax, dz = bz - az
    const t = clamp(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz), 0, 1)
    const ex = x - ax - dx * t, ez = z - az - dz * t
    const d = ex * ex + ez * ez
    if (d < best) best = d
  }
  return Math.sqrt(best)
}

// The Tiber Island: a boat-shaped island, about 270 by 70 m.
export const ISLAND = { x: -650, z: 215, a: 135, b: 36, rot: -25 }
export function islandDist(x, z) {
  const c = Math.cos(ISLAND.rot * DEG), s = Math.sin(ISLAND.rot * DEG)
  const dx = x - ISLAND.x, dz = z - ISLAND.z
  const u = (dx * c + dz * s) / ISLAND.a, v = (-dx * s + dz * c) / ISLAND.b
  return (Math.hypot(u, v) - 1) * ISLAND.b
}

function hillsAt(x, z) {
  let h = 0
  for (const hill of HILLS) {
    const dx = x - hill.x, dz = z - hill.z
    const u = (dx * hill.c + dz * hill.s) / hill.a
    const v = (-dx * hill.s + dz * hill.c) / hill.b
    const d = Math.hypot(u, v)
    if (d > 1.35) continue
    // Flat tops and steep tufa sides, as Rome's hills have.
    const k = 1 - smoothstep(0.55, 1.25, d + (noise(x * 0.004 + hill.x, z * 0.004) - 0.5) * 0.25)
    h = Math.max(h, hill.h * k)
  }
  return h
}

// Places levelled by the Romans: the Forum valley, the Colosseum valley and
// the floor of the Circus. Ellipses blend the land to a set height.
export const FLATS = [
  { x: 40, z: 30, a: 210, b: 105, rot: 25, y: 0 },
  { x: 572, z: 248, a: 175, b: 150, rot: 20, y: 1 },
  { x: 44, z: 729, a: 340, b: 80, rot: 35, y: 0 },
  // the Subura street (session 5): the valley floor, levelled for the paving
  { x: 214, z: -311, a: 125, b: 38, rot: -38.66, y: 2.4 },
]
for (const f of FLATS) {
  f.c = Math.cos(f.rot * DEG)
  f.s = Math.sin(f.rot * DEG)
}

// Ground height without the river cut.
function landAt(x, z) {
  let h = rawLandAt(x, z)
  for (const f of FLATS) {
    const dx = x - f.x, dz = z - f.z
    const d = Math.hypot((dx * f.c + dz * f.s) / f.a, (-dx * f.s + dz * f.c) / f.b)
    if (d < 1.4) h = lerp(f.y, h, smoothstep(0.85, 1.4, d))
  }
  return h
}
// Mountains on the horizon: the Alban Hills to the south-east (Monte Cavo,
// 949 m, about 20 km away), the Sabine and Tiburtine hills to the north-east,
// the Prenestini to the east and Monte Mario to the north-west.
const RANGES = [
  { x: 15500, z: 15500, r: 9000, h: 900 },
  { x: 24000, z: -16000, r: 11000, h: 1150 },
  { x: 33000, z: 2500, r: 9000, h: 1050 },
  { x: -3300, z: -3600, r: 1500, h: 120 },
]
function mountains(x, z) {
  let h = 0
  for (const m of RANGES) {
    const d = Math.hypot(x - m.x, z - m.z) / m.r
    if (d > 1.6) continue
    const k = Math.exp(-d * d * 2.2) * (0.75 + 0.5 * fbm(x * 0.0004 + m.x, z * 0.0004))
    h = Math.max(h, m.h * k)
  }
  return h
}

function rawLandAt(x, z) {
  // The Campus Martius and Trastevere plains sit a little above the Forum valley.
  const plain = 2 + 2 * smoothstep(600, 1400, -x)
  const r = Math.hypot(x - 400, z)
  const far = 25 * smoothstep(2600, 5200, r) + (r > 4000 ? 30 * (fbm(x * 0.0007, z * 0.0007) - 0.4) * smoothstep(4000, 9000, r) : 0)
  return plain + far + hillsAt(x, z) + mountains(x, z) + (fbm(x * 0.006, z * 0.006) - 0.5) * 3
}

// The hypogeum: the ground under the arena floor is dug out about 6 m
// (Platner & Ashby: substructure walls 5.50–6.08 m high).
export const PIT = { x: 572, z: 248, a: 45, b: 28, rot: 20, y: -6 }
const pitC = Math.cos(PIT.rot * DEG), pitS = Math.sin(PIT.rot * DEG)

export function heightAt(x, z) {
  {
    const dx = x - PIT.x, dz = z - PIT.z
    const u = (dx * pitC + dz * pitS) / PIT.a, v = (-dx * pitS + dz * pitC) / PIT.b
    if (u * u + v * v < 1) return PIT.y
  }
  const land = landAt(x, z)
  const r = riverDist(x, z)
  if (r > RIVER_HALF + 70) return land
  const isl = islandDist(x, z)
  // Embanked river: a short bank down to the water, a bed below it.
  let h = lerp(WATER_Y - 4, land, smoothstep(RIVER_HALF - 6, RIVER_HALF + 40, r))
  if (isl < 10) h = Math.max(h, lerp(WATER_Y + 4, WATER_Y - 4, smoothstep(-10, 10, isl)))
  return h
}

// Height of the land the camera may fly over (never below the water).
export const groundAt = (x, z) => Math.max(heightAt(x, z), WATER_Y)
