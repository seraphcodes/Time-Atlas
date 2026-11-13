// Modern Cairo, as seen from the plateau today: a sketch, not a survey.
// Thousands of plain blocks on the old floodplain and a line of towers along
// the river, all drawn in one call. They rise at the very end of scene 5.
import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { LAND, TONES } from '../design/tokens'
import { NOISE_GLSL } from '../design/glsl'
import { patchStandard } from '../design/patch'
import { journey } from '../journey/journey'
import { groundAt, riverX, rng, fbm } from './terrainMath'

const RIVER_TODAY = 1400 // matches riverShift at era = 1 in journey.js

function plan() {
  const rand = rng(2026)
  const list = []
  const cell = 46
  for (let x = 780; x < 4100; x += cell) {
    for (let z = -3600; z < 3600; z += cell) {
      const px = x + (rand() - 0.5) * 16, pz = z + (rand() - 0.5) * 16
      if (groundAt(px, pz) > LAND.floodY + 1.5) continue // only on the flat valley floor
      const toRiver = Math.abs(px - (riverX(pz) + RIVER_TODAY))
      if (toRiver < 235) continue
      // Denser near the plateau and the river, thinner far up and down the valley.
      const dense = 0.35 + 0.75 * fbm(px * 0.0016, pz * 0.0016 + 30) - 0.25 * Math.max(0, Math.abs(pz) - 2200) / 1400
      if (rand() > dense) continue
      const tower = toRiver < 520 && rand() < 0.2
      const w = tower ? 24 + rand() * 14 : 22 + rand() * 16
      const d = tower ? 24 + rand() * 14 : 20 + rand() * 18
      const h = tower ? 55 + rand() * rand() * 110 : 11 + rand() * rand() * 30
      list.push({ x: px, z: pz, w, d, h, yaw: (rand() - 0.5) * 0.3, tone: rand(), tower })
    }
  }
  return list
}

export function City() {
  const group = useRef()
  const mesh = useRef()
  const buildings = useMemo(plan, [])
  const material = useMemo(
    () =>
      patchStandard(new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.95, metalness: 0 }), {
        fragmentPars: NOISE_GLSL,
        // Rows of windows, fading out with distance so they never shimmer.
        fragmentColor: /* glsl */ `
{
  vec3 an = abs(vNrmW);
  if (an.y < 0.5) {
    vec2 w = vec2((an.x > an.z ? vWPos.z : vWPos.x) / 3.4, vWPos.y / 3.2);
    vec2 f = fract(w);
    float fw = fwidth(w.x) + fwidth(w.y);
    float win = step(0.28, f.x) * step(f.x, 0.74) * step(0.34, f.y) * step(f.y, 0.8);
    diffuseColor.rgb *= mix(1.0, 0.7, win * (1.0 - smoothstep(0.12, 0.55, fw)));
  }
}
`,
      }),
    [],
  )

  useLayoutEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3()
    const up = new THREE.Vector3(0, 1, 0), c = new THREE.Color()
    const base = new THREE.Color(TONES.city), warm = new THREE.Color('#A98F76'), pale = new THREE.Color('#D6CFC0')
    buildings.forEach((b, i) => {
      q.setFromAxisAngle(up, b.yaw)
      m.compose(p.set(b.x, b.h / 2, b.z), q, s.set(b.w, b.h, b.d))
      mesh.current.setMatrixAt(i, m)
      c.copy(base).lerp(b.tone < 0.5 ? warm : pale, Math.abs(b.tone - 0.5) * 1.2).multiplyScalar(b.tower ? 1.02 : 0.9 + 0.2 * b.tone)
      mesh.current.setColorAt(i, c)
    })
    mesh.current.instanceMatrix.needsUpdate = true
    mesh.current.instanceColor.needsUpdate = true
  }, [buildings])

  useFrame(() => {
    const k = journey.v.city
    group.current.visible = k > 0.004
    group.current.scale.y = Math.max(k, 0.004)
  })

  return (
    <group ref={group} position={[0, LAND.floodY - 0.5, 0]}>
      <instancedMesh ref={mesh} args={[null, null, buildings.length]} material={material} frustumCulled={false} receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
    </group>
  )
}
