// Life in the valley: palms on the banks, boats on the water, mudbrick
// villages. Everything is instanced to stay lightweight.
import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { PALETTE, TONES, LAND } from '../design/tokens'
import { foliageMaterial, mudbrickMaterial, woodMaterial, linenMaterial } from '../design/materials'
import { atmos } from '../design/glsl'
import { journey } from '../journey/journey'
import { heightAt, channelDist, riverX, canalZ, rng, RIVER_HALF } from './terrainMath'

function tint(geometry, hex, shade = 1) {
  const g = geometry.index ? geometry.toNonIndexed() : geometry
  const n = g.attributes.position.count
  const c = new THREE.Color(hex).multiplyScalar(shade)
  const col = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) col.set([c.r, c.g, c.b], i * 3)
  g.setAttribute('color', new THREE.BufferAttribute(col, 3))
  g.deleteAttribute('uv')
  return g
}

// ---------- palms ----------

function palmGeometry() {
  const H = 9
  const parts = [tint(new THREE.CylinderGeometry(0.15, 0.27, H, 5).translate(0, H / 2, 0), TONES.trunk)]
  const frond = (yaw, tilt, length, shade) => {
    const g = new THREE.PlaneGeometry(1.15, length, 1, 5).translate(0, length / 2, 0)
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++) {
      const t = p.getY(i) / length
      p.setX(i, p.getX(i) * (1 - 0.75 * t))
    }
    g.rotateX(tilt)
    for (let i = 0; i < p.count; i++) {
      const t = Math.hypot(p.getY(i), p.getZ(i)) / length
      p.setY(i, p.getY(i) - t * t * length * 0.42)
    }
    g.rotateY(yaw).translate(0, H - 0.1, 0)
    g.computeVertexNormals()
    parts.push(tint(g, TONES.frond, shade))
  }
  for (let i = 0; i < 9; i++) frond((i / 9) * Math.PI * 2, 1.05, 4.6, 0.85 + (i % 3) * 0.1)
  for (let i = 0; i < 6; i++) frond((i / 6) * Math.PI * 2 + 0.4, 0.5, 3.6, 1.05)
  return mergeGeometries(parts)
}

function Palms() {
  const ref = useRef()
  const geometry = useMemo(palmGeometry, [])
  const spots = useMemo(() => {
    const rand = rng(11)
    const list = []
    const tryAdd = (x, z) => {
      const d = channelDist(x, z)
      if (d < 16 || d > 190) return
      list.push({ x, z, y: heightAt(x, z), s: 0.8 + rand() * 0.7, yaw: rand() * 6.28 })
    }
    // both banks of the river
    for (let i = 0; i < 300; i++) {
      const z = -3200 + rand() * 6400
      const side = rand() < 0.5 ? -1 : 1
      tryAdd(riverX(z) + side * (RIVER_HALF + 18 + rand() * rand() * 150), z)
    }
    // the canal and the harbour basin
    for (let i = 0; i < 90; i++) {
      const x = 800 + rand() * 650
      tryAdd(x, canalZ(x) + (rand() < 0.5 ? -1 : 1) * (46 + rand() * 60))
    }
    for (let i = 0; i < 40; i++) {
      const a = rand() * 6.28
      tryAdd(900 + Math.cos(a) * (130 + rand() * 50), Math.sin(a) * (105 + rand() * 45))
    }
    // small groves between the fields
    for (let g = 0; g < 14; g++) {
      const gx = 880 + rand() * 520, gz = -1600 + rand() * 3200
      for (let i = 0; i < 7; i++) tryAdd(gx + (rand() - 0.5) * 70, gz + (rand() - 0.5) * 70)
    }
    return list
  }, [])
  useLayoutEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3()
    spots.forEach((p, i) => {
      m.compose(v.set(p.x, p.y - 0.3, p.z), q.setFromEuler(e.set((Math.sin(i) * 0.08), p.yaw, Math.cos(i * 1.7) * 0.08)), s.setScalar(p.s))
      ref.current.setMatrixAt(i, m)
    })
    ref.current.instanceMatrix.needsUpdate = true
  }, [])
  return <instancedMesh ref={ref} args={[geometry, foliageMaterial, spots.length]} castShadow frustumCulled={false} />
}

// ---------- villages ----------

function Villages() {
  const ref = useRef()
  const houses = useMemo(() => {
    const rand = rng(31)
    const list = []
    const cluster = (cx, cz, radius, count) => {
      for (let i = 0; i < count; i++) {
        const a = rand() * 6.28, r = Math.sqrt(rand()) * radius
        const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r
        if (channelDist(x, z) < 40) continue
        const w = 5 + rand() * 6, d = 5 + rand() * 6, h = 2.6 + rand() * 2.2
        list.push({ x, z, y: heightAt(x, z) + h / 2 - 0.3, w, d, h, yaw: rand() * 0.5, tone: 0.82 + rand() * 0.3 })
      }
    }
    cluster(900, 640, 150, 90) // the workers' town below the plateau
    cluster(840, 900, 110, 50)
    cluster(1020, -420, 90, 36)
    cluster(2360, -260, 130, 50) // east bank
    cluster(2480, 980, 110, 40)
    return list
  }, [])
  useLayoutEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3()
    const c = new THREE.Color()
    houses.forEach((h, i) => {
      m.compose(v.set(h.x, h.y, h.z), q.setFromEuler(e.set(0, h.yaw, 0)), s.set(h.w, h.h, h.d))
      ref.current.setMatrixAt(i, m)
      ref.current.setColorAt(i, c.set(TONES.mudbrick).multiplyScalar(h.tone))
    })
    ref.current.instanceMatrix.needsUpdate = true
    ref.current.instanceColor.needsUpdate = true
  }, [])
  return (
    <instancedMesh ref={ref} args={[undefined, mudbrickMaterial, houses.length]} castShadow receiveShadow frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  )
}

// ---------- boats ----------

function hullGeometry() {
  const pos = []
  const N = 14, L = 15, W = 1.7
  const sec = (i) => {
    const s = i / N
    const e = Math.abs(2 * s - 1)
    const hw = W * Math.pow(Math.sin(Math.PI * s), 0.7) + 0.02
    return { x: (s - 0.5) * L, hw, top: 0.75 + 1.9 * e ** 2.6, keel: -0.45 + 1.7 * e ** 3 }
  }
  const tri = (a, b, c) => pos.push(...a, ...b, ...c)
  for (let i = 0; i < N; i++) {
    const a = sec(i), b = sec(i + 1)
    const aL = [a.x, a.top, -a.hw], aR = [a.x, a.top, a.hw], aK = [a.x, a.keel, 0]
    const bL = [b.x, b.top, -b.hw], bR = [b.x, b.top, b.hw], bK = [b.x, b.keel, 0]
    tri(aL, bL, bK); tri(aL, bK, aK)
    tri(aR, bK, bR); tri(aR, aK, bK)
    const dA = a.top - 0.25, dB = b.top - 0.25
    tri([a.x, dA, -a.hw], [a.x, dA, a.hw], [b.x, dB, b.hw]); tri([a.x, dA, -a.hw], [b.x, dB, b.hw], [b.x, dB, -b.hw])
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.computeVertexNormals()
  return g
}

const hullMaterial = new THREE.MeshStandardMaterial({ color: '#8A6A45', roughness: 0.9, side: THREE.DoubleSide })
const cargoMaterial = new THREE.MeshStandardMaterial({ color: PALETTE.limestone, roughness: 0.8 })

function Boats() {
  const group = useRef()
  const hull = useMemo(hullGeometry, [])
  // heading: 1 = sailing south with the north wind (sail up), -1 = drifting north on the current.
  const boats = useMemo(
    () => [
      { z: 180, off: -70, heading: 1, scale: 1, sail: true },
      { z: 420, off: 60, heading: -1, scale: 0.85 },
      { z: -160, off: 20, heading: 1, scale: 1.1, sail: true },
      { z: 900, off: -110, heading: -1, scale: 0.9 },
      { z: -760, off: 90, heading: 1, scale: 1, sail: true },
      { z: 1500, off: 0, heading: 1, scale: 1.05, sail: true },
      { canal: 1230, scale: 1.5, cargo: true }, // stone barge heading for the harbour
      { canal: 1010, scale: 0.8, moored: true },
      { canal: 945, scale: 0.9, moored: true, dz: -30 },
    ],
    [],
  )
  useFrame(() => {
    const t = atmos.uTime.value
    group.current.children.forEach((g, i) => {
      const b = boats[i]
      const bob = Math.sin(t * 0.8 + i * 1.9) * 0.06
      if (b.canal) {
        const x = b.moored ? b.canal : b.canal - ((t * 0.35) % 200)
        g.position.set(x, LAND.waterY + 0.25 + bob, canalZ(x) + (b.dz ?? 0))
        g.rotation.set(Math.sin(t * 0.6 + i) * 0.015, Math.PI, 0)
      } else {
        const z = b.z + b.heading * t * 0.5
        g.position.set(riverX(z) + b.off, LAND.waterY + 0.25 + bob, z)
        g.rotation.set(Math.sin(t * 0.6 + i) * 0.02, b.heading > 0 ? -Math.PI / 2 : Math.PI / 2, 0)
      }
    })
  })
  return (
    <group ref={group}>
      {boats.map((b, i) => (
        <group key={i} scale={b.scale}>
          <mesh geometry={hull} material={hullMaterial} castShadow />
          {b.sail && (
            <>
              <mesh material={woodMaterial} position={[0.6, 4.2, 0]}>
                <cylinderGeometry args={[0.07, 0.1, 7.4, 5]} />
              </mesh>
              <mesh material={linenMaterial} position={[0.75, 5.1, 0]} rotation-y={Math.PI / 2}>
                <planeGeometry args={[5.4, 4.6]} />
              </mesh>
            </>
          )}
          {b.cargo &&
            [-2.6, -0.4, 1.8].map((x) => (
              <mesh key={x} material={cargoMaterial} position={[x, 1.25, 0]} castShadow>
                <boxGeometry args={[1.7, 0.9, 1.5]} />
              </mesh>
            ))}
        </group>
      ))}
    </group>
  )
}

export function Environment() {
  const group = useRef()
  // Palms, villages and boats belong to the old valley; they fade with it.
  useFrame(() => {
    const k = journey.v.env
    group.current.visible = k > 0.004
    group.current.scale.y = Math.max(k, 0.004)
    group.current.position.y = LAND.floodY * (1 - k)
  })
  return (
    <group ref={group}>
      <Palms />
      <Villages />
      <Boats />
    </group>
  )
}
