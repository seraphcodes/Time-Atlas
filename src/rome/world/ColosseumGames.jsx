// A day at the games in the Colosseum (session 7), shown on the sand when the
// visitor asks for it from the "A day at the games" card.
// Morning: the hunt (venatio): animals and hunters among scenery raised from the
// lifts (Martial, On the Spectacles, describes such scenery at the opening games).
// Afternoon: gladiators in matched pairs, each with a referee, to music from a
// water organ and horns (as on the Zliten mosaic, late 1st–2nd century).
// The midday executions are described on the card and not shown.
// No blood, no deaths: the figures stand for the order of events, not for the
// violence. Pairings follow Roman art: thraex against murmillo, retiarius
// against secutor, hoplomachus against murmillo.
// Colosseum frame: x along the long axis, z across (+z the emperor's side),
// the sand at y = 0.4.
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Builder } from './geo'

const SAND = 0.4
const SKIN = '#B98361', BRONZE = '#B08D57', STEEL = '#8E9196', CLOTH = '#ECE4D2', RED = '#8E2E2A'
const REDUCED = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// ---------- people ----------
function body(b, x, z, ry, { tunic = null, greaves = 0, manica = false } = {}) {
  b.at(x, SAND, z, ry)
  for (const lz of [-0.12, 0.12]) b.box(0, 0, lz, 0.15, 0.82, 0.16, SKIN)
  if (greaves) for (const lz of greaves > 1 ? [-0.12, 0.12] : [-0.12]) b.box(0.02, 0.05, lz, 0.19, 0.5, 0.2, BRONZE)
  if (tunic) b.box(0, 0.62, 0, 0.32, 0.72, 0.5, tunic)
  else {
    b.box(0, 0.68, 0, 0.3, 0.3, 0.46, CLOTH) // loincloth
    b.box(0, 0.95, 0, 0.27, 0.12, 0.48, BRONZE) // belt
    b.box(0, 1.0, 0, 0.26, 0.45, 0.44, SKIN)
  }
  b.box(0, 1.1, 0.3, 0.13, 0.42, 0.13, SKIN) // sword arm
  b.box(0, 1.1, -0.3, 0.13, 0.42, 0.13, SKIN)
  if (manica) b.box(0, 1.1, 0.3, 0.17, 0.44, 0.17, CLOTH)
}
function gladiator(b, x, z, ry, type) {
  const helmet = (crest) => {
    b.box(0, 1.5, 0, 0.32, 0.34, 0.32, BRONZE)
    b.box(0, 1.5, 0, 0.5, 0.04, 0.5, BRONZE) // broad brim
    b.box(0.16, 1.58, 0, 0.02, 0.14, 0.22, '#3E3A36') // grille
    if (crest === 'fin') b.box(0, 1.84, 0, 0.36, 0.2, 0.05, BRONZE)
    if (crest === 'griffin') b.box(0.04, 1.86, 0, 0.18, 0.28, 0.06, BRONZE).box(0.12, 2.0, 0, 0.12, 0.08, 0.06, BRONZE)
    if (crest === 'plume') b.box(-0.04, 1.84, 0, 0.3, 0.25, 0.05, '#A63A2E')
  }
  if (type === 'murmillo') {
    body(b, x, z, ry, { greaves: 1, manica: true })
    helmet('fin')
    b.box(0.32, 0.55, -0.32, 0.08, 1.05, 0.66, RED) // tall curved shield (scutum)
    b.box(0.36, 0.95, -0.32, 0.02, 0.18, 0.18, BRONZE)
    b.box(0.45, 1.2, 0.34, 0.5, 0.05, 0.06, STEEL) // short sword
  } else if (type === 'thraex') {
    body(b, x, z, ry, { greaves: 2, manica: true })
    helmet('griffin')
    b.box(0.3, 0.8, -0.32, 0.06, 0.55, 0.5, '#5B6E86') // small square shield
    b.box(0.42, 1.25, 0.34, 0.42, 0.05, 0.05, STEEL, 0.5) // curved sword (sica)
  } else if (type === 'hoplomachus') {
    body(b, x, z, ry, { greaves: 2, manica: true })
    helmet('plume')
    b.push(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 12).rotateZ(Math.PI / 2), BRONZE, b.local(0.32, 1.1, -0.3))
    b.box(0.9, 1.3, 0.34, 1.9, 0.04, 0.04, '#7A5A3C') // spear
  } else if (type === 'secutor') {
    body(b, x, z, ry, { greaves: 1, manica: true })
    b.push(new THREE.SphereGeometry(0.2, 8, 6).scale(1, 1.15, 1), BRONZE, b.local(0, 1.55, 0)) // smooth helmet
    b.box(0.32, 0.55, -0.32, 0.08, 1.0, 0.62, '#6E2B3C')
    b.box(0.45, 1.2, 0.34, 0.5, 0.05, 0.06, STEEL)
  } else if (type === 'retiarius') {
    body(b, x, z, ry, { manica: false })
    b.box(0, 1.1, -0.3, 0.17, 0.44, 0.17, CLOTH) // arm guard on the left
    b.box(0, 1.32, -0.3, 0.2, 0.16, 0.16, BRONZE) // shoulder guard (galerus)
    b.push(new THREE.SphereGeometry(0.17, 8, 6), SKIN, b.local(0, 1.5, 0))
    b.box(0, 1.62, 0, 0.2, 0.06, 0.2, '#3A2A20')
    b.box(0.6, 1.15, 0.36, 2.2, 0.04, 0.04, '#7A5A3C') // trident
    for (const dz of [-0.1, 0, 0.1]) b.box(1.75, 1.15, 0.36 + dz, 0.25, 0.03, 0.03, STEEL)
    b.push(new THREE.CircleGeometry(0.7, 10).rotateX(-Math.PI / 2), '#8C8370', b.local(0.5, 0.05, -0.6)) // net, dropped
  } else if (type === 'referee') {
    body(b, x, z, ry, { tunic: '#F1ECE0' })
    b.box(0, 0.6, 0.24, 0.33, 0.72, 0.03, '#6E2B4A').box(0, 0.6, -0.24, 0.33, 0.72, 0.03, '#6E2B4A') // stripes
    b.push(new THREE.SphereGeometry(0.17, 8, 6), SKIN, b.local(0, 1.5, 0))
    b.box(0.3, 1.0, 0.32, 0.04, 0.04, 1.1, '#7A5A3C', 0.4) // the stick (rudis)
  } else {
    // hunter (venator) with a spear
    body(b, x, z, ry, { tunic: type })
    b.push(new THREE.SphereGeometry(0.17, 8, 6), SKIN, b.local(0, 1.5, 0))
    const m = b.local(0.5, 1.15, 0.3).multiply(new THREE.Matrix4().makeRotationZ(-0.25))
    b.push(new THREE.BoxGeometry(2.2, 0.04, 0.04), '#7A5A3C', m)
  }
}

// ---------- animals ----------
function animal(b, x, z, ry, kind) {
  b.at(x, SAND, z, ry)
  const legs = (h, w, d, col, sx = 0.5, sz = 0.16) => {
    for (const lx of [-sx, sx]) for (const lz of [-sz, sz]) b.box(lx, 0, lz, w, h, d, col)
  }
  if (kind === 'lion') {
    legs(0.5, 0.13, 0.13, '#A87B45')
    b.box(0, 0.5, 0, 1.4, 0.5, 0.45, '#B98B4E')
    b.box(0.62, 0.52, 0, 0.45, 0.62, 0.62, '#7E5229') // mane
    b.box(0.92, 0.66, 0, 0.3, 0.3, 0.3, '#B98B4E')
    b.box(-0.85, 0.75, 0, 0.5, 0.05, 0.05, '#A87B45')
  } else if (kind === 'bear') {
    legs(0.45, 0.2, 0.2, '#3E2B1F', 0.45, 0.2)
    b.box(0, 0.42, 0, 1.3, 0.72, 0.68, '#4A3426')
    b.box(0.78, 0.68, 0, 0.36, 0.34, 0.34, '#4A3426')
  } else if (kind === 'bull') {
    legs(0.6, 0.15, 0.15, '#2E241D', 0.6, 0.2)
    b.box(0, 0.6, 0, 1.6, 0.75, 0.62, '#3E3026')
    b.box(0.95, 0.78, 0, 0.4, 0.42, 0.4, '#3E3026')
    for (const lz of [-0.24, 0.24]) b.box(1.08, 1.02, lz, 0.06, 0.06, 0.22, '#E6DCC4')
  } else {
    // a deer
    legs(0.75, 0.07, 0.07, '#8C5E3A', 0.38, 0.1)
    b.box(0, 0.75, 0, 1.0, 0.38, 0.32, '#A9764C')
    const n = b.local(0.52, 1.1, 0).multiply(new THREE.Matrix4().makeRotationZ(0.9))
    b.push(new THREE.BoxGeometry(0.5, 0.14, 0.14), '#A9764C', n)
    b.box(0.7, 1.3, 0, 0.24, 0.16, 0.16, '#A9764C')
    for (const lz of [-0.08, 0.08]) b.box(0.62, 1.38, lz, 0.04, 0.35, 0.04, '#5E4630')
  }
}

// scenery raised through the trapdoors: trees and rocks
function scenery(b) {
  b.at(0, SAND, 0, 0)
  const trees = [[-30, -9], [-26, 10], [-12, -14], [4, 15], [18, -12], [30, 6], [-2, -3]]
  for (const [x, z] of trees) {
    b.cyl(x, 0, z, 0.25, 0.3, 2.2, '#5B4636', 6)
    b.cone(x, 1.8, z, 1.6, 4.5, '#4F6B3A', 8)
  }
  for (const [x, z, r] of [[-20, 3, 1.6], [10, 9, 1.2], [24, -4, 1.8], [-6, 12, 1.0]]) {
    b.push(new THREE.IcosahedronGeometry(r, 0).scale(1.3, 0.8, 1), '#8E8475', b.local(x, r * 0.5, z))
  }
}

// musicians at the edge of the sand: water organ, two horns, a trumpet
function musicians(b) {
  const x = -36, z = -10
  b.at(x, SAND, z, 0)
  b.cyl(0, 0, 0, 0.7, 0.7, 1.0, '#8C6A4A', 6) // the organ's water tank
  for (let i = 0; i < 12; i++) b.cyl(-0.45 + i * 0.08, 1.0, 0.1, 0.03, 0.03, 0.6 + i * 0.06, BRONZE, 5)
  gladiator(b, x + 0.9, z - 0.1, Math.PI, '#A6402F')
  for (const [dx, dz] of [[1.4, 1.4], [0.2, 1.8]]) {
    gladiator(b, x + dx, z + dz, Math.PI, '#3F5F78')
    b.push(new THREE.TorusGeometry(0.55, 0.04, 4, 14, Math.PI * 1.7), BRONZE, b.local(0, 1.25, 0, Math.PI / 2))
  }
  gladiator(b, x - 1.2, z + 1.6, Math.PI, '#C7953F')
  b.push(new THREE.CylinderGeometry(0.03, 0.12, 1.4, 6).rotateZ(Math.PI / 2.4), BRONZE, b.local(0.6, 1.5, 0.3))
}

function buildGames() {
  // each pair turns about its own centre, so each is its own mesh
  const pairs = [
    { at: [-22, -7], a: 'thraex', b: 'murmillo' },
    { at: [-4, 7], a: 'retiarius', b: 'secutor' },
    { at: [14, -6], a: 'hoplomachus', b: 'murmillo' },
    { at: [28, 7], a: 'thraex', b: 'murmillo' },
  ].map((p) => {
    const b = new Builder()
    gladiator(b, -1.2, 0, 0, p.a)
    gladiator(b, 1.2, 0, Math.PI, p.b)
    gladiator(b, 0.2, 2.6, -Math.PI / 2, 'referee')
    return { at: p.at, geometry: b.merge() }
  })
  const m = new Builder()
  musicians(m)
  const fight = { pairs, band: m.merge() }

  const h = new Builder()
  scenery(h)
  const roam = new Builder() // the animals circle slowly
  ;[['lion', 18, 0], ['lion', 16.5, 2.2], ['bear', -14, 4], ['bull', 6, -12], ['deer', -19, -2], ['deer', -20, 1]].forEach(([k, r, a]) => {
    const t = Math.atan2(a, r)
    animal(roam, Math.cos(t) * Math.hypot(r, a), Math.sin(t) * Math.hypot(r, a) * 0.6, -t - Math.PI / 2, k)
  })
  const hunters = new Builder()
  ;[[12, -4, 2.6, '#9C6B4A'], [20, 6, 3.4, '#7E6A55'], [-8, 8, 0.6, '#A64B3C'], [-18, -7, -0.4, '#5A6670'], [2, -8, 1.6, '#C9A06B'], [-30, 6, -0.2, '#8A7A5E']].forEach(([x, z, ry, c]) => gladiator(hunters, x, z, ry, c))
  const hunt = { stage: h.merge(), roam: roam.merge(), hunters: hunters.merge() }
  return { fight, hunt }
}

export function Games({ hunt, fight }) {
  const g = useMemo(buildGames, [])
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, side: THREE.DoubleSide }), [])
  const pairRefs = useRef([])
  const roam = useRef()
  useFrame((_, dt) => {
    if (REDUCED) return
    const t = performance.now() / 1000
    pairRefs.current.forEach((r, i) => {
      if (!r) return
      r.rotation.y += Math.min(dt, 0.1) * (i % 2 ? -0.35 : 0.3)
      r.position.y = Math.abs(Math.sin(t * 2.2 + i)) * 0.06
    })
    if (roam.current) roam.current.rotation.y += Math.min(dt, 0.1) * 0.08
  })
  return (
    <group>
      <group visible={!!fight}>
        {g.fight.pairs.map((p, i) => (
          <group key={i} position={[p.at[0], 0, p.at[1]]}>
            <mesh ref={(r) => (pairRefs.current[i] = r)} geometry={p.geometry} material={mat} castShadow />
          </group>
        ))}
        <mesh geometry={g.fight.band} material={mat} castShadow />
      </group>
      <group visible={!!hunt}>
        <mesh geometry={g.hunt.stage} material={mat} castShadow />
        <mesh geometry={g.hunt.hunters} material={mat} castShadow />
        <mesh ref={roam} geometry={g.hunt.roam} material={mat} castShadow />
      </group>
    </group>
  )
}
