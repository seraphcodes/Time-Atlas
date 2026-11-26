// The ordinary city: apartment blocks (insulae), houses (domus) and
// warehouses (horrea), laid out street by street in each district, plus
// trees and people. Every individual building is invented; the type, height
// and density follow what is known (HISTORY.md: Strabo, the Epitome, Ostia).
// Walls and roofs are one instanced mesh each; a small shader paints windows,
// shop fronts and weathering from the world position, so no textures load.
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useNow } from './era'
import { CLEARINGS, DISTRICTS, GARDENS, PLACES, STREETS, inPark } from './layout'
import { heightAt, riverDist, RIVER_HALF, rng, noise, smoothstep, HILLS, WATER_Y } from './terrain'
import { hipGeometry } from './geo'
import { setObstacles, setStreetOpen } from './obstacles'
import { patchStandard } from '../../design/patch'

const COARSE = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
const FORCED = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('q')
const LITE = FORCED === 'low' || (COARSE && FORCED !== 'high')

const PAL = {
  insula: ['#D9B98C', '#CFA376', '#E2CBA4', '#C48A5E', '#B96E4C', '#D8C3A0', '#BE7F57', '#E6D5B5', '#C99A6E', '#A86246'],
  domus: ['#E8DAC0', '#E3CFAE', '#D9B48A', '#EDE2CC', '#D5A982', '#E4C9A6'],
  horrea: ['#A9644A', '#B07657', '#9C8466', '#B48A68'],
  roof: ['#A8553A', '#B3603F', '#9A4C34', '#B86A48', '#8F4733', '#A75E45', '#B46448', '#9E5A40'],
}

// ---------- where building is not allowed ----------
const KEEP_OUT = Object.entries(PLACES)
  .filter(([k]) => !['subura', 'saddle'].includes(k))
  .map(([, p]) => ({ x: p.at[0], z: p.at[1], c: Math.cos(p.rot), s: Math.sin(p.rot), hw: p.pick[0] / 2 + 10, hd: p.pick[2] / 2 + 10 }))
  .concat(CLEARINGS.map((k) => ({ x: k.at[0], z: k.at[1], c: Math.cos(k.rot), s: Math.sin(k.rot), hw: k.w / 2, hd: k.d / 2 })))
const RESERVED_HILLS = HILLS.filter((h) => h.name === 'Palatine' || h.name === 'Capitoline')

function blocked(x, z) {
  for (const k of KEEP_OUT) {
    const dx = x - k.x, dz = z - k.z
    const lx = dx * k.c - dz * k.s, lz = dx * k.s + dz * k.c
    if (Math.abs(lx) < k.hw && Math.abs(lz) < k.hd) return true
  }
  for (const h of RESERVED_HILLS) {
    const dx = x - h.x, dz = z - h.z
    const u = (dx * h.c + dz * h.s) / h.a, v = (-dx * h.s + dz * h.c) / h.b
    if (u * u + v * v < 1.05) return true
  }
  if (riverDist(x, z) < RIVER_HALF + 16) return true
  for (const st of STREETS) {
    for (let i = 0; i < st.pts.length - 1; i++) {
      const [ax, az] = st.pts[i], [bx, bz] = st.pts[i + 1]
      const ex = bx - ax, ez = bz - az
      const t = Math.min(1, Math.max(0, ((x - ax) * ex + (z - az) * ez) / (ex * ex + ez * ez)))
      if (Math.hypot(x - ax - ex * t, z - az - ez * t) < st.w / 2 + 3) return true
    }
  }
  return false
}

// ---------- the layout ----------
function layOut() {
  const rand = rng(1900)
  const walls = [] // [x, y, z, w, h, d, rot, colourHex]
  const roofs = []
  const trees = []
  const cell = 9
  const taken = new Set()
  const key = (x, z) => `${Math.round(x / cell)},${Math.round(z / cell)}`
  const occupied = (x, z, w, d, c, s) => {
    for (const [fx, fz] of [[0, 0], [-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]]) {
      const lx = fx * w, lz = fz * d
      if (taken.has(key(x + lx * c + lz * s, z - lx * s + lz * c))) return true
    }
    return false
  }
  const mark = (x, z, w, d, c, s) => {
    for (let a = -0.5; a <= 0.5; a += cell / Math.max(w, cell) / 1.5) {
      for (let b = -0.5; b <= 0.5; b += cell / Math.max(d, cell) / 1.5) {
        const lx = a * w, lz = b * d
        taken.add(key(x + lx * c + lz * s, z - lx * s + lz * c))
      }
    }
  }
  const pick = (arr) => arr[Math.floor(rand() * arr.length)]

  // One building: a box from below the lowest ground to its eaves, and a roof.
  const building = (x, z, w, d, rot, h, palette, roofed = true) => {
    const c = Math.cos(rot), s = Math.sin(rot)
    let lo = Infinity, hi = -Infinity
    for (const [fx, fz] of [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]]) {
      const g = heightAt(x + fx * w * c + fz * d * s, z - fx * w * s + fz * d * c)
      lo = Math.min(lo, g)
      hi = Math.max(hi, g)
    }
    if (hi - lo > 10 || lo < WATER_Y + 1) return false
    const top = hi + h
    walls.push([x, lo - 1.5, z, w, top - lo + 1.5, d, rot, pick(palette)])
    const long = w >= d
    if (roofed) roofs.push([x, top, z, (long ? w : d) + 0.9, Math.min(w, d) * (0.18 + rand() * 0.06), (long ? d : w) + 0.9, long ? rot : rot + Math.PI / 2, pick(PAL.roof)])
    else roofs.push([x, top, z, w, 0.4, d, rot, '#B9A385']) // flat terrace
    return true
  }

  // A courtyard block: four ranges round an open court.
  const court = (x, z, w, d, rot, h, palette, t) => {
    const c = Math.cos(rot), s = Math.sin(rot)
    const at = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c]
    let ok = building(...at(0, -d / 2 + t / 2), w, t, rot, h, palette)
    ok = building(...at(0, d / 2 - t / 2), w, t, rot, h, palette) || ok
    building(...at(-w / 2 + t / 2, 0), t, d - 2 * t, rot, h, palette)
    building(...at(w / 2 - t / 2, 0), t, d - 2 * t, rot, h, palette)
    if (palette === PAL.domus && rand() < 0.7) trees.push([...at(0, 0), rand() < 0.5 ? 0 : 1, 0.6 + rand() * 0.4])
    return ok
  }

  const maxBuildings = LITE ? 11000 : 22000
  let count = 0
  for (const dist of DISTRICTS) {
    const A = (dist.angle * Math.PI) / 180
    const rot = -A
    const ca = Math.cos(A), sa = Math.sin(A)
    const px = dist.type === 'horrea' ? 70 : dist.type === 'domus' ? 40 : 44, pz = dist.type === 'domus' ? 36 : 34
    const ni = Math.ceil(dist.r / px), nj = Math.ceil(dist.r / pz)
    for (let i = -ni; i <= ni; i++) {
      for (let j = -nj; j <= nj; j++) {
        if (count > maxBuildings) break
        const lx = i * px + (rand() - 0.5) * 4, lz = j * pz + (rand() - 0.5) * 3
        const x = dist.x + lx * ca - lz * sa, z = dist.z + lx * sa + lz * ca
        const r = Math.hypot(lx, lz) / dist.r
        const edge = 1 - smoothstep(0.7, 1.1, r + (noise(x * 0.01, z * 0.01) - 0.5) * 0.3)
        if (rand() > dist.density * edge) continue
        const bw = px - 5 - rand() * 2, bd = pz - 4.5 - rand() * 2
        const c = Math.cos(rot), s = Math.sin(rot)
        if (blocked(x, z) || occupied(x, z, bw, bd, c, s)) continue
        const type = dist.type === 'mixed' ? (rand() < 0.55 ? 'insula' : 'domus') : dist.type
        const storeys = dist.storeys[0] + Math.floor(rand() * (dist.storeys[1] - dist.storeys[0] + 1))
        let ok = false
        if (type === 'insula') {
          const h = Math.min(18, 4 + (storeys - 1) * 3.3) // Trajan's limit: 60 Roman feet
          if (bw > 30 && rand() < 0.5) ok = court(x, z, bw, bd, rot, h, PAL.insula, 9 + rand() * 2)
          else {
            // split the block into two or three buildings of different heights
            const parts = 2 + Math.floor(rand() * 3)
            for (let k = 0; k < parts; k++) {
              const w = bw / parts
              const ox = -bw / 2 + w * (k + 0.5)
              const hh = Math.max(7, h - Math.floor(rand() * 2) * 3.3)
              ok = building(x + ox * c, z - ox * s, w - 0.2, bd - (k % 2) * rand() * 4, rot, hh, PAL.insula, rand() > 0.08) || ok
            }
          }
        } else if (type === 'domus') {
          const h = 5 + Math.floor(rand() * 2) * 3
          ok = court(x, z, bw, bd, rot, h, PAL.domus, 6.5)
        } else {
          ok = court(x, z, bw, bd, rot, 7 + (storeys - 2) * 3.5, PAL.horrea, 10)
        }
        if (ok) {
          mark(x, z, bw, bd, c, s)
          count++
        }
      }
    }
  }

  // Trees: gardens, planted hillsides and the river banks.
  for (const gdn of GARDENS) {
    const n = Math.round((gdn.r * gdn.r) / (LITE ? 1300 : 700))
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2, rr = Math.sqrt(rand()) * gdn.r
      const x = gdn.x + Math.cos(a) * rr, z = gdn.z + Math.sin(a) * rr
      if (taken.has(key(x, z)) || riverDist(x, z) < RIVER_HALF + 6) continue
      if (blockedForTrees(x, z)) continue
      trees.push([x, z, rand() < 0.35 ? 0 : rand() < 0.6 ? 1 : 2, 0.7 + rand() * 0.6])
    }
  }
  return { walls, roofs, trees }
}

function blockedForTrees(x, z) {
  for (const k of KEEP_OUT) {
    const dx = x - k.x, dz = z - k.z
    const lx = dx * k.c - dz * k.s, lz = dx * k.s + dz * k.c
    if (Math.abs(lx) < k.hw - 6 && Math.abs(lz) < k.hd - 6) return true
  }
  return false
}

// ---------- materials ----------
function wallMaterial() {
  return patchStandard(new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.95 }), {
    vertexPars: 'varying float vUp; varying float vH; varying vec3 vN;',
    vertexMain: `
      float sy = length(vec3(instanceMatrix[1].xyz));
      vUp = (position.y + 0.5) * sy;
      vH = sy;
      vN = normalize(mat3(instanceMatrix) * normal);`,
    fragmentPars: `varying float vUp; varying float vH; varying vec3 vN;
      float hsh(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }`,
    fragmentColor: `
      if (abs(vN.y) < 0.5) {
        float along = abs(vN.x) > abs(vN.z) ? vWPos.z : vWPos.x;
        float fw = fwidth(along) + fwidth(vUp);
        float detail = 1.0 - smoothstep(0.25, 0.7, fw); // fades out far away
        float shade = 1.0;
        // ground floor: shop openings (tabernae), some shuttered
        float g = vUp - 1.5;
        if (g < 4.0) {
          vec2 cellId = vec2(floor(along / 4.6), floor(vWPos.y / 50.0));
          float cx = fract(along / 4.6);
          float open = step(0.14, cx) * step(cx, 0.8) * step(0.05, g) * step(g, 3.1);
          float shut = step(0.6, hsh(cellId));
          shade = mix(1.0, mix(0.16, 0.55, shut), open);
        } else if (vUp < vH - 1.2) {
          float f = (g - 4.0) / 3.3;
          float fy = fract(f);
          float cx = fract(along / 3.4 + 0.5 * floor(f) * 0.0);
          float win = step(0.38, cx) * step(cx, 0.62) * step(0.32, fy) * step(fy, 0.74);
          float lit = hsh(vec2(floor(along / 3.4), floor(f)));
          win *= step(0.25, lit);
          shade = mix(1.0, 0.22, win);
          // a line of balcony or string-course shadow at each floor
          shade *= 1.0 - 0.12 * step(fy, 0.05);
        }
        // eaves shadow and rising damp
        shade *= 1.0 - 0.35 * smoothstep(vH - 1.6, vH - 0.2, vUp);
        shade *= 0.86 + 0.14 * smoothstep(0.0, 3.0, g);
        diffuseColor.rgb *= mix(0.86, shade, detail);
      }
      // weathered plaster
      float w = fract(sin(dot(floor(vWPos.xz * 0.35 + vWPos.y * 0.2), vec2(12.9898, 78.233))) * 43758.5453);
      diffuseColor.rgb *= 0.93 + 0.1 * w;`,
  })
}

function roofMaterial() {
  return patchStandard(new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.82 }), {
    fragmentPars: '',
    fragmentColor: `
      float rows = abs(fract(vWPos.y * 2.2) - 0.5);
      float fw = fwidth(vWPos.y * 2.2);
      diffuseColor.rgb *= mix(1.0, 0.86 + 0.28 * rows, 1.0 - smoothstep(0.3, 0.8, fw));
      diffuseColor.rgb *= 0.9 + 0.2 * fract(sin(dot(floor(vWPos.xz * 0.5), vec2(12.9898, 78.233))) * 43758.5453);`,
  })
}

const unitBox = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0)

function Instances({ items, geometry, material, shadows = true }) {
  const ref = useRef()
  useLayoutEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(), col = new THREE.Color()
    const Y = new THREE.Vector3(0, 1, 0)
    items.forEach((it, i) => {
      const [x, y, z, w, h, d, rot, hex] = it
      m.compose(p.set(x, y, z), q.setFromAxisAngle(Y, rot), s.set(w, h, d))
      ref.current.setMatrixAt(i, m)
      ref.current.setColorAt(i, col.set(hex))
    })
    ref.current.instanceMatrix.needsUpdate = true
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true
    ref.current.computeBoundingSphere()
  }, [items])
  return <instancedMesh ref={ref} args={[geometry, material, items.length]} castShadow={shadows} receiveShadow frustumCulled={false} />
}

// ---------- trees ----------
function treeGeometries() {
  const tint = (g, hex) => {
    const geo = g.toNonIndexed()
    const c = new THREE.Color(hex)
    const arr = new Float32Array(geo.attributes.position.count * 3)
    for (let i = 0; i < arr.length; i += 3) arr.set([c.r, c.g, c.b], i)
    geo.setAttribute('color', new THREE.BufferAttribute(arr, 3))
    geo.deleteAttribute('uv')
    return geo
  }
  const merge = (parts) => {
    const g = new THREE.BufferGeometry()
    const pos = [], nrm = [], colr = []
    for (const p of parts) {
      pos.push(...p.attributes.position.array)
      nrm.push(...p.attributes.normal.array)
      colr.push(...p.attributes.color.array)
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3))
    g.setAttribute('color', new THREE.Float32BufferAttribute(colr, 3))
    return g
  }
  const trunk = (h) => tint(new THREE.CylinderGeometry(0.25, 0.35, h, 5).translate(0, h / 2, 0), '#6B5440')
  return [
    // cypress
    merge([trunk(2), tint(new THREE.ConeGeometry(1.6, 15, 7).translate(0, 9, 0), '#3E5230')]),
    // umbrella pine
    merge([trunk(11), tint(new THREE.SphereGeometry(5.5, 8, 5).scale(1, 0.42, 1).translate(0, 12, 0), '#56693B')]),
    // broadleaf (laurel, plane, fruit trees)
    merge([trunk(3), tint(new THREE.IcosahedronGeometry(3.8, 0).translate(0, 6, 0), '#64784A')]),
  ]
}

export function Fabric() {
  const data = useMemo(() => {
    const t0 = performance.now()
    const d = layOut()
    d.ms = Math.round(performance.now() - t0)
    return d
  }, [])
  const mats = useMemo(() => ({ wall: wallMaterial(), roof: roofMaterial(), tree: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true }) }), [])
  const roofGeo = useMemo(() => hipGeometry(), [])
  const trees = useMemo(() => {
    const geos = treeGeometries()
    const lists = [[], [], []]
    const r = rng(77)
    for (const [x, z, kind, s] of data.trees) {
      const y = heightAt(x, z)
      lists[kind].push([x, y - 0.3, z, s, s * (kind === 0 ? 0.8 + r() * 0.5 : 1), s, r() * 6.28, '#ffffff'])
    }
    return lists.map((items, i) => ({ items, geometry: geos[i] }))
  }, [data])
  // Today: inside the archaeological park the houses are gone; outside it the
  // same blocks, in grey, stand in for the modern city (not its real shapes).
  const now = useNow()
  const modern = useMemo(() => (now ? data.walls.filter(([x, , z]) => !inPark(x, z)).map((w) => [...w.slice(0, 7), '#9A9894']) : null), [now, data])
  const grey = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.95 }), [])
  useLayoutEffect(() => {
    setObstacles(now ? modern : data.walls)
    setStreetOpen(now)
  }, [now, modern, data])
  if (typeof window !== 'undefined') window.__fabric = { buildings: data.walls.length, trees: data.trees.length, layoutMs: data.ms }
  return (
    <group>
      {now ? (
        <Instances key="modern" items={modern} geometry={unitBox} material={grey} shadows={!LITE} />
      ) : (
        <>
          <Instances key="walls" items={data.walls} geometry={unitBox} material={mats.wall} shadows={!LITE} />
          <Instances key="roofs" items={data.roofs} geometry={roofGeo} material={mats.roof} shadows={!LITE} />
        </>
      )}
      {trees.map((t, i) => (t.items.length ? <Instances key={i} items={t.items} geometry={t.geometry} material={mats.tree} shadows={!LITE} /> : null))}
    </group>
  )
}
