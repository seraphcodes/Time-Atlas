// The Great Pyramid, built course by course. The same model serves the
// construction scene and the finished monument: `build` and `casing` say how
// many metres of core and casing are in place.
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { GIZA, NEIGHBOURS } from '../design/tokens'
import { casingMaterial, coreMaterial, ashlarMaterial, neighbourCoreMaterial, khafreCasingMaterial, menkaureCasingMaterial } from '../design/materials'
import { journey } from '../journey/journey'
import { heightAt } from './terrainMath'

const VERTS_PER_COURSE = 30

// A pyramid made of horizontal courses, ordered bottom to top so that drawing
// only the first N courses shows it at any stage of building.
// stepped = true gives the rough inner core; false gives the smooth casing.
export function layeredPyramid({ base, height, courses, inset = 0, stepped = false }) {
  const pos = []
  const nrm = []
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3()
  const quad = (p0, p1, p2, p3) => {
    a.set(...p0); b.set(...p1); c.set(...p2)
    n.crossVectors(b.sub(a), c.sub(a)).normalize()
    for (const p of [p0, p1, p2, p0, p2, p3]) {
      pos.push(...p)
      nrm.push(n.x, n.y, n.z)
    }
  }
  const ch = height / courses
  for (let i = 0; i < courses; i++) {
    const y0 = i * ch
    const y1 = y0 + ch
    const top = Math.max((base / 2) * (1 - y1 / height) - inset, 0.001)
    const bot = stepped ? top : Math.max((base / 2) * (1 - y0 / height) - inset, 0.001)
    const [B, T] = [bot, top]
    quad([B, y0, B], [B, y0, -B], [T, y1, -T], [T, y1, T]) // east
    quad([-B, y0, -B], [-B, y0, B], [-T, y1, T], [-T, y1, -T]) // west
    quad([-B, y0, B], [B, y0, B], [T, y1, T], [-T, y1, T]) // south
    quad([B, y0, -B], [-B, y0, -B], [-T, y1, -T], [T, y1, -T]) // north
    quad([-T, y1, T], [T, y1, T], [T, y1, -T], [-T, y1, -T]) // top
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3))
  return g
}

export function Pyramid() {
  const core = useRef()
  const casing = useRef()
  const coreGeo = useMemo(() => layeredPyramid({ ...GIZA, inset: GIZA.coreInset, stepped: true }), [])
  const casingGeo = useMemo(() => layeredPyramid({ ...GIZA }), [])
  const ch = GIZA.height / GIZA.courses

  useFrame(() => {
    const { build, casing: cased, coreTop, strip } = journey.v
    // Today the top eight metres are missing.
    const nCore = THREE.MathUtils.clamp(Math.round(Math.min(build, coreTop) / ch), 0, GIZA.courses)
    const nCasing = THREE.MathUtils.clamp(Math.round(cased / ch), 0, GIZA.courses)
    coreGeo.setDrawRange(0, nCore * VERTS_PER_COURSE)
    casingGeo.setDrawRange(0, nCasing * VERTS_PER_COURSE)
    // While the casing is complete the core is hidden inside it.
    core.current.visible = nCasing < GIZA.courses || strip > 0
    casing.current.visible = strip < 0.999
  })

  return (
    <group>
      <mesh ref={core} geometry={coreGeo} material={coreMaterial} castShadow receiveShadow frustumCulled={false} />
      <mesh ref={casing} geometry={casingGeo} material={casingMaterial} castShadow receiveShadow frustumCulled={false} />
    </group>
  )
}

// What stood beside the finished pyramid: three queens' pyramids, the temple
// on the east face, the causeway down to the valley and the enclosure wall.
// They rise during the time-lapse in scene 3.
export function Complex() {
  const group = useRef()
  const queenGeo = useMemo(() => layeredPyramid({ base: 47, height: 30, courses: 30 }), [])
  const causeway = useMemo(() => {
    const parts = []
    const from = new THREE.Vector2(172, -8)
    const to = new THREE.Vector2(800, -130)
    const steps = 26
    const dir = to.clone().sub(from)
    const len = dir.length() / steps
    const yaw = Math.atan2(-dir.y, dir.x)
    for (let i = 0; i < steps; i++) {
      const p0 = from.clone().lerp(to, i / steps)
      const p1 = from.clone().lerp(to, (i + 1) / steps)
      const h0 = heightAt(p0.x, p0.y)
      const h1 = heightAt(p1.x, p1.y)
      parts.push({ pos: [(p0.x + p1.x) / 2, (h0 + h1) / 2 + 0.5, (p0.y + p1.y) / 2], rot: [0, yaw, Math.atan2(h1 - h0, len)], len: len + 1 })
    }
    return parts
  }, [])

  const road = useRef()
  const queens = useRef()
  useFrame(() => {
    const { complete, ruin } = journey.v
    // Built during the time-lapse; over the centuries the temple, wall and
    // causeway are quarried away and the queens' pyramids wear down.
    const k = complete * (1 - ruin)
    group.current.visible = road.current.visible = k > 0.002
    group.current.scale.y = Math.max(k, 0.002)
    for (const m of road.current.children) m.scale.y = Math.max(k, 0.002)
    queens.current.visible = complete > 0.002
    queens.current.scale.y = Math.max(complete * (1 - 0.35 * ruin), 0.002)
  })

  const wall = GIZA.base / 2 + 12
  return (
    <>
    <group ref={road}>
      {causeway.map((s, i) => (
        <mesh key={i} material={ashlarMaterial} position={s.pos} rotation={s.rot} castShadow receiveShadow>
          <boxGeometry args={[s.len, 4, 9]} />
        </mesh>
      ))}
    </group>
    <group ref={queens}>
      {[20, 80, 140].map((z) => (
        <mesh key={z} geometry={queenGeo} material={ashlarMaterial} position={[190, 0, z]} castShadow receiveShadow />
      ))}
    </group>
    <group ref={group}>
      {/* Temple against the east face */}
      <mesh material={ashlarMaterial} position={[143, 4, 0]} castShadow receiveShadow>
        <boxGeometry args={[46, 8, 52]} />
      </mesh>
      {/* Enclosure wall */}
      {[
        [0, -wall, wall * 2, 2],
        [0, wall, wall * 2, 2],
        [-wall, 0, 2, wall * 2],
        [wall, 0, 2, wall * 2],
      ].map(([x, z, w, d], i) => (
        <mesh key={i} material={ashlarMaterial} position={[x, 2, z]} castShadow receiveShadow>
          <boxGeometry args={[w, 4, d]} />
        </mesh>
      ))}
    </group>
    </>
  )
}

// The pyramids of Khafre and Menkaure, built by the next two generations.
// They rise course by course early in the journey through time.
function Neighbour({ spec, track, casingMaterial }) {
  const core = useRef()
  const casing = useRef()
  const coreGeo = useMemo(() => layeredPyramid({ ...spec, inset: GIZA.coreInset, stepped: true }), [spec])
  const casingGeo = useMemo(() => layeredPyramid({ ...spec }), [spec])
  const ch = spec.height / spec.courses
  const y = useMemo(() => heightAt(spec.x, spec.z) - 4, [spec])

  useFrame(() => {
    const built = journey.v[track]
    const n = Math.round(built / ch)
    core.current.visible = casing.current.visible = n > 0
    coreGeo.setDrawRange(0, n * VERTS_PER_COURSE)
    casingGeo.setDrawRange(0, Math.max(0, n - 6) * VERTS_PER_COURSE)
  })

  return (
    <group position={[spec.x, y, spec.z]}>
      <mesh ref={core} geometry={coreGeo} material={neighbourCoreMaterial} castShadow receiveShadow frustumCulled={false} />
      <mesh ref={casing} geometry={casingGeo} material={casingMaterial} castShadow receiveShadow frustumCulled={false} />
    </group>
  )
}

export function Neighbours() {
  return (
    <>
      <Neighbour spec={NEIGHBOURS.khafre} track="khafre" casingMaterial={khafreCasingMaterial} />
      <Neighbour spec={NEIGHBOURS.menkaure} track="menkaure" casingMaterial={menkaureCasingMaterial} />
    </>
  )
}
