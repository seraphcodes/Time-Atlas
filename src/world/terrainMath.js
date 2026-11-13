// The shape of the land, as plain functions. Everything that stands on the
// ground (palms, houses, the camera) asks these functions for its height.
import { LAND } from '../design/tokens'

export const lerp = (a, b, t) => a + (b - a) * t
export const clamp = (x, a, b) => Math.min(b, Math.max(a, x))
export const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

// Repeatable random numbers, so the world is identical on every visit.
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
  const a = hash2(ix, iz), b = hash2(ix + 1, iz), c = hash2(ix, iz + 1), d = hash2(ix + 1, iz + 1)
  return lerp(lerp(a, b, fx), lerp(c, d, fx), fz)
}

export function fbm(x, z, octaves = 4) {
  let s = 0, a = 0.5
  for (let i = 0; i < octaves; i++) {
    s += a * noise(x, z)
    x = x * 2.03 + 17.1
    z = z * 2.03 + 17.1
    a *= 0.5
  }
  return s
}

// River, harbour canal and basin. Mirrors CHANNEL_GLSL in design/glsl.js.
export const riverX = (z) => 1650 + 170 * Math.sin(z * 0.0011 + 0.4) + 80 * Math.sin(z * 0.0027 + 1.3)
export const canalZ = (x) => 40 * Math.sin(x * 0.004)
export const RIVER_HALF = 200

// Distance to the nearest water channel. Negative means inside the channel.
export function channelDist(x, z) {
  const rx = riverX(z)
  const dR = Math.abs(x - rx) - RIVER_HALF
  const cx = clamp(x, 880, 4000)
  let dC = Math.hypot(x - cx, z - canalZ(cx)) - 28
  if (x > rx) dC = 1e5
  const dB = (Math.hypot((x - 900) / 95, z / 70) - 1) * 70
  return Math.min(dR, dC, dB)
}

// Ground height in metres before any water channel is cut into it.
// x points east, z points south, the pyramid stands at the origin (height 0).
export function groundAt(x, z) {
  // The plateau drops to the Nile floodplain along a wandering escarpment.
  const edge = 560 + 70 * Math.sin(z * 0.0016) + 45 * Math.sin(z * 0.0041 + 2.0)
  const esc = smoothstep(edge - 190, edge + 190, x)
  let h = lerp(0, LAND.floodY, esc)

  // Flat building site, gentle plateau, dunes growing towards the west.
  const calm = smoothstep(420, 950, Math.hypot(x, z - 150))
  const west = smoothstep(-300, -2600, x)
  const dune = fbm(x * 0.0012, z * 0.0008)
  const ridge = 1 - Math.abs(2 * noise(x * 0.004, z * 0.0016) - 1)
  h += (1 - esc) * calm * (1.6 * (fbm(x * 0.01, z * 0.01) - 0.5) + 46 * west * (dune - 0.35) + 11 * smoothstep(-200, -1100, x) * (ridge - 0.4))
  h += smoothstep(-3500, -9000, x) * 160 * fbm(x * 0.0004 + 9.0, z * 0.0004)

  // Eastern desert hills beyond the valley.
  const east = smoothstep(4200, 6800, x)
  h += east * (60 + 150 * fbm(x * 0.0005, z * 0.0005 + 4.0))
  return h
}

// Ground height in 2560 BC, with the river, canal and harbour basin cut in.
// (The terrain itself cuts its channels in its shader, because they move
// over the centuries; see Terrain.jsx.)
export function heightAt(x, z) {
  const h = groundAt(x, z)
  return lerp(h, LAND.bedY, smoothstep(20, -40, channelDist(x, z)) * smoothstep(-20, -38, h))
}
