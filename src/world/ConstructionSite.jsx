// Scene 2: the ramp, the hauling teams, the stockpiles and the dust.
// A plausible reconstruction: how the ramps were laid out is still debated.
import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { PALETTE, TONES, GIZA } from '../design/tokens'
import { rampMaterial, blockMaterial, vertexColorMaterial } from '../design/materials'
import { atmos, OUTPUT_GLSL, FOG_GLSL } from '../design/glsl'
import { patchStandard } from '../design/patch'
import { journey } from '../journey/journey'
import { rng, smoothstep } from './terrainMath'
import { rampGeometry, routePoint, ROUTE, START_TOP } from './rampPath'

const TOP = START_TOP
const HALF_TOP = (GIZA.base / 2) * (1 - TOP / GIZA.height) - 2
const TEAMS = 16
const ROWS = 10
const ROW_GAP = 1.25
const SPEED = 0.75 // metres per second

// ---------- geometry helpers ----------

function colored(geometry, hex, part = 0) {
  const g = geometry.index ? geometry.toNonIndexed() : geometry
  const n = g.attributes.position.count
  const c = new THREE.Color(hex)
  const col = new Float32Array(n * 3)
  const prt = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b
    prt[i] = part
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3))
  g.setAttribute('aPart', new THREE.BufferAttribute(prt, 1))
  g.deleteAttribute('uv')
  return g
}
const box = (w, h, d, x, y, z) => new THREE.BoxGeometry(w, h, d).translate(x, y, z)

// A stylised worker, about 1.75 m tall, facing north (-z). Parts are tagged so
// the shader can swing legs and arms: 1/2 = legs, 3/4 = arms, 0 = the rest.
function figureGeometry() {
  return mergeGeometries([
    colored(box(0.15, 0.86, 0.17, -0.1, 0.43, 0), TONES.skin, 1),
    colored(box(0.15, 0.86, 0.17, 0.1, 0.43, 0), TONES.skin, 2),
    colored(box(0.42, 0.4, 0.27, 0, 0.92, 0), TONES.linen, 0),
    colored(box(0.4, 0.46, 0.22, 0, 1.33, 0), TONES.skin, 0),
    colored(box(0.2, 0.22, 0.21, 0, 1.68, 0), TONES.skin, 0),
    colored(box(0.22, 0.08, 0.23, 0, 1.81, 0.01), TONES.hair, 0),
    colored(box(0.11, 0.6, 0.12, -0.27, 1.22, 0), TONES.skin, 3),
    colored(box(0.11, 0.6, 0.12, 0.27, 1.22, 0), TONES.skin, 4),
  ])
}

function sledgeGeometry() {
  return mergeGeometries([
    colored(box(0.16, 0.2, 3.4, -0.5, 0.1, 0), TONES.wood),
    colored(box(0.16, 0.2, 3.4, 0.5, 0.1, 0), TONES.wood),
    colored(box(1.3, 0.1, 0.18, 0, 0.25, -1.1), TONES.wood),
    colored(box(1.3, 0.1, 0.18, 0, 0.25, 0), TONES.wood),
    colored(box(1.3, 0.1, 0.18, 0, 0.25, 1.1), TONES.wood),
    colored(box(1.25, 1.0, 2.1, 0, 0.8, 0), PALETTE.limestone),
  ])
}

// ---------- materials ----------

const workerMaterial = patchStandard(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 }), {
  uniforms: { uTime: atmos.uTime },
  vertexPars: /* glsl */ `
attribute float aPart;
attribute float aPhase;
attribute vec3 aPose; // x: walking 0-1, y: forward lean, z: arm angle
uniform float uTime;
mat2 rot2(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
`,
  vertexMain: /* glsl */ `
{
  float ph = uTime * 4.6 + aPhase;
  float sw = sin(ph) * aPose.x;
  if (aPart > 0.5 && aPart < 2.5) {
    float dir = aPart < 1.5 ? 1.0 : -1.0;
    transformed.yz = rot2(sw * 0.5 * dir) * (transformed.yz - vec2(0.86, 0.0)) + vec2(0.86, 0.0);
  } else if (aPart > 2.5) {
    float dir = aPart < 3.5 ? -1.0 : 1.0;
    transformed.yz = rot2(aPose.z + sw * 0.22 * dir) * (transformed.yz - vec2(1.5, 0.0)) + vec2(1.5, 0.0);
  }
  if (aPart < 0.5 || aPart > 2.5) {
    transformed.yz = rot2(aPose.y) * (transformed.yz - vec2(0.9, 0.0)) + vec2(0.9, 0.0);
  }
  transformed.y += abs(cos(ph)) * 0.035 * aPose.x;
}
`,
})

function puffMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { ...atmos, uSand: { value: new THREE.Color(TONES.chips) }, uCrew: { value: 1 } },
    vertexShader: /* glsl */ `
uniform float uTime;
uniform float uPx;
attribute float aSeed;
varying float vA;
varying float vDist;
float h1(float n){ return fract(sin(n * 91.345) * 47453.5453); }
void main(){
  float life = fract(uTime * 0.22 + aSeed);
  vec3 p = position;
  p.x += (h1(aSeed * 7.0) - 0.5) * 3.2 + life * (h1(aSeed * 3.0) - 0.5) * 2.0;
  p.y += 0.2 + life * 1.7;
  p.z += (h1(aSeed * 13.0) - 0.3) * 16.0 + life * 2.5;
  vec4 mv = viewMatrix * vec4(p, 1.0);
  vDist = -mv.z;
  vA = (1.0 - life) * smoothstep(0.0, 0.2, life);
  gl_PointSize = min((1.2 + life * 2.6) * uPx / max(vDist, 1.0), 220.0);
  gl_Position = projectionMatrix * mv;
}`,
    fragmentShader: /* glsl */ `
${FOG_GLSL}
uniform vec3 uSand;
uniform vec3 uSunColor;
uniform float uCrew;
varying float vA;
varying float vDist;
void main(){
  float r = length(gl_PointCoord - 0.5) * 2.0;
  float a = smoothstep(1.0, 0.1, r) * vA * 0.2 * uCrew;
  vec3 col = applyFog(uSand * (0.55 + 0.5 * uSunColor), vDist);
  gl_FragColor = vec4(col, a);
  ${OUTPUT_GLSL}
}`,
  })
}

// Fine dust hanging in the sunlight around the camera.
function moteMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { ...atmos },
    vertexShader: /* glsl */ `
uniform float uTime;
uniform float uPx;
attribute float aSeed;
varying float vA;
void main(){
  vec3 size = vec3(64.0, 24.0, 64.0);
  vec3 p = position * size;
  p += vec3(uTime * 0.5, sin(uTime * 0.25 + aSeed * 6.28) * 0.5, uTime * 0.2);
  p = mod(p - cameraPosition, size) - size * 0.5;
  vec4 mv = viewMatrix * vec4(cameraPosition + p, 1.0);
  float dist = -mv.z;
  vA = smoothstep(32.0, 10.0, dist) * smoothstep(0.8, 3.5, dist) * (0.4 + 0.6 * aSeed);
  gl_PointSize = clamp(0.04 * (0.5 + aSeed) * uPx / max(dist, 0.5), 1.0, 7.0);
  gl_Position = projectionMatrix * mv;
}`,
    fragmentShader: /* glsl */ `
uniform vec3 uSunColor;
uniform float uDust;
varying float vA;
void main(){
  float r = length(gl_PointCoord - 0.5) * 2.0;
  float a = smoothstep(1.0, 0.0, r) * vA * uDust * 0.22;
  gl_FragColor = vec4(uSunColor * a, a);
  ${OUTPUT_GLSL}
}`,
  })
}

// ---------- the crew ----------

// One hauling team, described relative to its sledge.
// s = metres ahead of the sledge, lat = metres to the side.
function teamLayout() {
  const m = []
  for (let r = 0; r < ROWS; r++) {
    for (const side of [-1, 1]) m.push({ s: 3.4 + r * ROW_GAP, lat: side * 0.85, pose: [1, 0.42, 0.55] })
  }
  m.push({ s: 2.0, lat: 0, pose: [1, 0.5, -0.9] }) // pours water on the track
  m.push({ s: 6.0, lat: -2.6, pose: [1, 0.04, 0.1] }) // overseer, on the inner side
  m.push({ s: -2.3, lat: -0.42, pose: [1, 0.5, -1.25] }) // pushing from behind
  m.push({ s: -2.3, lat: 0.42, pose: [1, 0.5, -1.25] })
  return m
}

export function ConstructionSite() {
  const root = useRef()
  const ramp = useRef()
  const figures = useRef()
  const sledges = useRef()
  const ropes = useRef()
  const blocks = useRef()

  const layout = useMemo(teamLayout, [])
  const figureGeo = useMemo(figureGeometry, [])
  const sledgeGeo = useMemo(sledgeGeometry, [])
  const rampModel = useMemo(rampGeometry, [])
  const puffMat = useMemo(puffMaterial, [])
  const moteMat = useMemo(moteMaterial, [])

  // People who stay in one place: setters on the platform, crews at the
  // stockpiles, masons dressing blocks.
  const idle = useMemo(() => {
    const rand = rng(7)
    const list = []
    const add = (x, y, z, yaw) => list.push({ x, y, z, yaw, pose: [0.12 * rand(), 0.1 + 0.5 * rand(), -1.2 * rand()] })
    for (let i = 0; i < 46; i++) add((rand() * 2 - 1) * (HALF_TOP - 6), TOP, (rand() * 2 - 1) * (HALF_TOP - 6), rand() * 6.28)
    for (let i = 0; i < 44; i++) add(-250 + rand() * 110, 0, 190 + rand() * 150, rand() * 6.28)
    for (let i = 0; i < 14; i++) add(150 + rand() * 60, 0, 150 + rand() * 90, rand() * 6.28)
    return list
  }, [])

  // Blocks: a half-laid course on the platform, stockpiles at the ramp foot.
  const blockList = useMemo(() => {
    const rand = rng(21)
    const list = []
    const ch = GIZA.height / GIZA.courses
    const cols = Math.floor(HALF_TOP / 1.72)
    for (let ix = 0; ix < cols; ix++) {
      const depth = 12 + Math.floor(rand() * 9)
      for (let iz = 0; iz < depth; iz++) {
        if (rand() < 0.04) continue
        list.push({ x: -HALF_TOP + 0.9 + ix * 1.72, y: TOP + ch / 2, z: -HALF_TOP + 0.7 + iz * 1.32, s: [1.66, ch, 1.26], yaw: 0, tone: 0.86 + rand() * 0.2, onTop: 1 })
      }
    }
    for (let i = 0; i < 60; i++) {
      list.push({ x: (rand() * 2 - 1) * (HALF_TOP - 8), y: TOP + 0.5, z: -HALF_TOP + 30 + rand() * (HALF_TOP * 2 - 40), s: [1.9, 1.0, 1.2], yaw: rand() * 3.1, tone: 0.9 + rand() * 0.16, onTop: 1 })
    }
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 11; j++) {
        if (rand() < 0.25) continue
        const stacked = rand() < 0.3 ? 2 : 1
        for (let k = 0; k < stacked; k++) {
          list.push({ x: -240 + i * 3.4 + rand() * 0.5, y: 0.5 + k, z: 200 + j * 2.6, s: [2.0, 1.0, 1.25], yaw: (rand() - 0.5) * 0.12, tone: 0.9 + rand() * 0.16, onTop: 0 })
        }
      }
    }
    return list
  }, [])

  const dynamicCount = TEAMS * layout.length
  const figureCount = dynamicCount + idle.length

  // Per-figure animation data.
  useLayoutEffect(() => {
    const rand = rng(3)
    const phase = new Float32Array(figureCount)
    const pose = new Float32Array(figureCount * 3)
    const color = new THREE.Color()
    for (let i = 0; i < figureCount; i++) {
      phase[i] = rand() * 6.28
      const p = i < dynamicCount ? layout[i % layout.length].pose : idle[i - dynamicCount].pose
      pose.set(p, i * 3)
      figures.current.setColorAt(i, color.setScalar(0.78 + rand() * 0.3))
    }
    figureGeo.setAttribute('aPhase', new THREE.InstancedBufferAttribute(phase, 1))
    figureGeo.setAttribute('aPose', new THREE.InstancedBufferAttribute(pose, 3))
    figures.current.instanceColor.needsUpdate = true

    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3()
    blockList.forEach((b, i) => {
      m.compose(v.set(b.x, b.y, b.z), q.setFromEuler(e.set(0, b.yaw, 0)), s.set(...b.s))
      blocks.current.setMatrixAt(i, m)
      blocks.current.setColorAt(i, color.set(b.onTop ? TONES.core : PALETTE.limestone).multiplyScalar(b.tone))
    })
    blocks.current.instanceMatrix.needsUpdate = true
    blocks.current.instanceColor.needsUpdate = true
  }, [])

  const puffGeo = useMemo(() => {
    const n = TEAMS * 16
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
    const seed = new Float32Array(n)
    const rand = rng(5)
    for (let i = 0; i < n; i++) seed[i] = rand()
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    return g
  }, [])

  const moteGeo = useMemo(() => {
    const n = 700
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(n * 3), seed = new Float32Array(n)
    const rand = rng(9)
    for (let i = 0; i < n; i++) {
      pos[i * 3] = rand(); pos[i * 3 + 1] = rand(); pos[i * 3 + 2] = rand()
      seed[i] = rand()
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    return g
  }, [])

  const tmp = useMemo(() => ({
    m: new THREE.Matrix4(), q: new THREE.Quaternion(), e: new THREE.Euler(0, 0, 0, 'YXZ'), v: new THREE.Vector3(),
    s: new THREE.Vector3(), a: new THREE.Vector3(), b: new THREE.Vector3(), d: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0),
  }), [])

  useFrame(() => {
    const { crew, rampTop, complete } = journey.v
    const time = atmos.uTime.value
    const { m, q, e, v, s, a, b, d, up } = tmp

    // Draw the ramp only up to its current height.
    let count = 0
    for (const step of rampModel.steps) {
      if (step.height > rampTop + 0.05) break
      count = step.count
    }
    rampModel.geometry.setDrawRange(0, count)
    ramp.current.visible = count > 0

    figures.current.visible = sledges.current.visible = ropes.current.visible = crew > 0.004
    puffMat.uniforms.uCrew.value = crew
    blocks.current.visible = complete < 0.5
    if (crew <= 0.004) return

    const yawOf = (dir) => Math.atan2(-dir.x, -dir.z)
    const puffPos = puffGeo.attributes.position
    const L = ROUTE.length - 22
    for (let k = 0; k < TEAMS; k++) {
      const D = (time * SPEED + (k * L) / TEAMS) % L
      const fade = smoothstep(0, 16, D) * smoothstep(0, 12, L - D) * crew

      // sledge and its block
      routePoint(D, 0, v, d)
      const pitch = Math.atan2(d.y, Math.hypot(d.x, d.z))
      m.compose(v, q.setFromEuler(e.set(pitch, yawOf(d), 0)), s.setScalar(fade))
      sledges.current.setMatrixAt(k, m)
      for (let j = 0; j < 16; j++) puffPos.setXYZ(k * 16 + j, v.x, v.y, v.z)

      // the people
      layout.forEach((p, j) => {
        routePoint(D + p.s, p.lat, v, d)
        m.compose(v, q.setFromEuler(e.set(0, yawOf(d), 0)), s.setScalar(fade))
        figures.current.setMatrixAt(k * layout.length + j, m)
      })

      // ropes, in short lengths so they follow the team around corners
      for (const side of [-1, 1]) {
        routePoint(D + 1.7, side * 0.5, a, d)
        a.y += 0.45
        for (let r = 0; r < ROWS; r++) {
          routePoint(D + 3.4 + r * ROW_GAP, side * 0.85, b, d)
          b.y += 1.26
          m.lookAt(a, b, up)
          q.setFromRotationMatrix(m)
          m.compose(v.copy(a).add(b).multiplyScalar(0.5), q, s.set(fade, fade, a.distanceTo(b)))
          ropes.current.setMatrixAt((k * 2 + (side > 0 ? 1 : 0)) * ROWS + r, m)
          a.copy(b)
        }
      }
    }
    // people who stay in place
    idle.forEach((p, i) => {
      m.compose(v.set(p.x, p.y, p.z), q.setFromEuler(e.set(0, p.yaw, 0)), s.setScalar(crew))
      figures.current.setMatrixAt(dynamicCount + i, m)
    })
    figures.current.instanceMatrix.needsUpdate = true
    sledges.current.instanceMatrix.needsUpdate = true
    ropes.current.instanceMatrix.needsUpdate = true
    puffPos.needsUpdate = true
  })

  return (
    <group ref={root}>
      <mesh ref={ramp} geometry={rampModel.geometry} material={rampMaterial} castShadow receiveShadow frustumCulled={false} />
      <instancedMesh ref={figures} args={[figureGeo, workerMaterial, figureCount]} castShadow frustumCulled={false} />
      <instancedMesh ref={sledges} args={[sledgeGeo, vertexColorMaterial, TEAMS]} castShadow frustumCulled={false} />
      <instancedMesh ref={ropes} args={[undefined, undefined, TEAMS * 2 * ROWS]} frustumCulled={false}>
        <boxGeometry args={[0.06, 0.06, 1]} />
        <meshStandardMaterial color="#B49A6A" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={blocks} args={[undefined, blockMaterial, blockList.length]} castShadow receiveShadow frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
      <points geometry={puffGeo} material={puffMat} frustumCulled={false} renderOrder={6} />
      <points geometry={moteGeo} material={moteMat} frustumCulled={false} renderOrder={7} />
    </group>
  )
}
