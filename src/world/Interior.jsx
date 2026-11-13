// The inside of the Great Pyramid: passages, the Grand Gallery and the two
// upper chambers, plus the flat face of stone you see when the pyramid is
// cut open. Nothing here uses the sun; it has its own lamps.
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { GIZA, PALETTE, TONES } from '../design/tokens'
import { atmos, inner, NOISE_GLSL, OUTPUT_GLSL } from '../design/glsl'
import { calm } from '../design/calm'
import { patchStandard } from '../design/patch'
import { journey } from '../journey/journey'
import { ROOMS, GABLE, SARCOPHAGUS, INTERIOR_GLSL, room, floorAt } from './interiorPlan'

// Collects flat faces into one mesh. `towards` decides which way a face looks:
// rooms face inwards (you stand inside them), objects face outwards.
function builder() {
  const pos = [], nrm = [], lift = [], stone = []
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3(), mid = new THREE.Vector3()
  const face = (pts, centre, inward, lifts, kind) => {
    a.set(...pts[0]); b.set(...pts[1]); c.set(...pts[2])
    n.crossVectors(b.clone().sub(a), c.clone().sub(a)).normalize()
    mid.set(...centre).sub(a)
    const flip = n.dot(mid) > 0 !== inward
    if (flip) n.negate()
    const order = pts.length === 4 ? [0, 1, 2, 0, 2, 3] : [0, 1, 2]
    if (flip) order.reverse()
    for (const i of order) {
      pos.push(...pts[i])
      nrm.push(n.x, n.y, n.z)
      lift.push(lifts[i])
      stone.push(kind)
    }
  }
  // A box whose floor may slope along z.
  const prism = ({ x, w, z0, z1, y0, y1, h, stone: kind = 0 }, inward) => {
    const xl = x - w / 2, xr = x + w / 2
    const A = [[xl, y0, z0], [xr, y0, z0], [xr, y0 + h, z0], [xl, y0 + h, z0]]
    const B = [[xl, y1, z1], [xr, y1, z1], [xr, y1 + h, z1], [xl, y1 + h, z1]]
    const centre = [x, (y0 + y1 + h) / 2, (z0 + z1) / 2]
    const L = [y0, y0, y0, y0], R = [y1, y1, y1, y1], M = [y0, y0, y1, y1]
    face(A, centre, inward, L, kind)
    face(B, centre, inward, R, kind)
    face([A[0], A[1], B[1], B[0]], centre, inward, M, kind) // floor
    face([A[3], A[2], B[2], B[3]], centre, inward, M, kind) // ceiling
    face([A[0], A[3], B[3], B[0]], centre, inward, M, kind) // west wall
    face([A[1], A[2], B[2], B[1]], centre, inward, M, kind) // east wall
  }
  const geometry = () => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3))
    g.setAttribute('aLift', new THREE.Float32BufferAttribute(lift, 1))
    g.setAttribute('aStone', new THREE.Float32BufferAttribute(stone, 1))
    return g
  }
  return { face, prism, geometry }
}

function roomsGeometry() {
  const b = builder()
  for (const r of ROOMS) b.prism(r, true)
  // Pointed roof of the Queen's Chamber.
  const { x, w, hz, yb, rise } = GABLE
  const xl = x - w / 2, xr = x + w / 2, floor = room('queenChamber').y0
  const centre = [x, yb, 0], lifts = [floor, floor, floor, floor]
  b.face([[xl, yb, -hz], [xr, yb, -hz], [xr, yb + rise, 0], [xl, yb + rise, 0]], centre, true, lifts, 0)
  b.face([[xl, yb, hz], [xr, yb, hz], [xr, yb + rise, 0], [xl, yb + rise, 0]], centre, true, lifts, 0)
  b.face([[xl, yb, -hz], [xl, yb, hz], [xl, yb + rise, 0]], centre, true, lifts, 0)
  b.face([[xr, yb, -hz], [xr, yb, hz], [xr, yb + rise, 0]], centre, true, lifts, 0)
  return b.geometry()
}

function fittingsGeometry() {
  const b = builder()
  const g = room('gallery')
  const slope = (g.y1 - g.y0) / (g.z1 - g.z0)
  const z0 = g.z0 + 0.02, z1 = g.z1 - 0.02
  const along = (lift, extra) => ({ z0, z1, y0: floorAt(g, z0) + lift, y1: floorAt(g, z1) + lift, ...extra })
  for (const side of [-1, 1]) {
    const wall = g.x + (side * g.w) / 2
    // Stone benches along both walls.
    b.prism(along(0, { x: wall - side * 0.255, w: 0.51, h: 0.52 }), false)
    // Seven courses, each stepping 7.5 cm inwards: the corbelled roof.
    for (let j = 1; j <= 7; j++) {
      const out = j * 0.075
      const from = 2.3 + (j - 1) * 0.88
      b.prism(along(from, { x: wall - (side * out) / 2, w: out, h: g.h - from - 0.01 }), false)
    }
  }
  // The Great Step at the top of the gallery.
  b.prism({ x: g.x, w: g.w - 0.02, z0: -1.02, z1: g.z1 - 0.01, y0: floorAt(g, -1.02) - 0.3, y1: floorAt(g, -1.02) - 0.3, h: 43.0 - floorAt(g, -1.02) + 0.3 + slope * 0 }, false)

  // Sarcophagus: four walls and a floor of dark granite, open at the top.
  const [sx0, sy0, sz0] = SARCOPHAGUS.min, [sx1, sy1, sz1] = SARCOPHAGUS.max
  const sh = sy1 - sy0, t = 0.15
  const slab = (xa, xb, za, zb, h) => b.prism({ x: (xa + xb) / 2, w: xb - xa, z0: za, z1: zb, y0: sy0, y1: sy0, h, stone: 2 }, false)
  slab(sx0, sx0 + t, sz0, sz1, sh)
  slab(sx1 - t, sx1, sz0, sz1, sh)
  slab(sx0, sx1, sz0, sz0 + t, sh)
  slab(sx0, sx1, sz1 - t, sz1, sh)
  slab(sx0, sx1, sz0, sz1, 0.22)

  // A small block for the lamp to stand on.
  const lamp = inner.uLampB.value
  b.prism({ x: lamp.x, w: 0.26, z0: lamp.z - 0.13, z1: lamp.z + 0.13, y0: 43.0, y1: 43.0, h: 0.14 }, false)
  return b.geometry()
}

function interiorMaterial(shell) {
  return new THREE.ShaderMaterial({
    defines: { ...(shell ? { SHELL: 1 } : {}), ...(calm ? { CALM: 1 } : {}) },
    uniforms: {
      uCutX: atmos.uCutX,
      uTime: atmos.uTime,
      uSunDir: atmos.uSunDir,
      uSunColor: atmos.uSunColor,
      uZenith: atmos.uZenith,
      uHorizon: atmos.uHorizon,
      ...inner,
      uLime: { value: new THREE.Color(TONES.core).multiplyScalar(0.92) },
      uGranite: { value: new THREE.Color(TONES.granite) },
      uBoxMin: { value: new THREE.Vector3(...SARCOPHAGUS.min) },
      uBoxMax: { value: new THREE.Vector3(...SARCOPHAGUS.max) },
    },
    vertexShader: /* glsl */ `
attribute float aLift;
attribute float aStone;
varying vec3 vW;
varying vec3 vN;
varying float vLift;
varying float vStone;
void main(){
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  vN = normal;
  vLift = aLift;
  vStone = aStone;
  gl_Position = projectionMatrix * viewMatrix * w;
}`,
    fragmentShader: /* glsl */ `
${NOISE_GLSL}
${INTERIOR_GLSL}
uniform float uCutX, uTime, uLampAI, uLampBI, uOpen;
uniform vec3 uSunDir, uSunColor, uZenith, uHorizon, uLampA, uLampB, uLime, uGranite, uBoxMin, uBoxMax;
varying vec3 vW;
varying vec3 vN;
varying float vLift;
varying float vStone;

// Does the sarcophagus stand between this point and the lamp?
float boxShadow(vec3 ro, vec3 rd){
  vec3 inv = 1.0 / rd;
  vec3 t0 = (uBoxMin - ro) * inv, t1 = (uBoxMax - ro) * inv;
  vec3 lo = min(t0, t1), hi = max(t0, t1);
  float near = max(max(lo.x, lo.y), lo.z), far = min(min(hi.x, hi.y), hi.z);
  return (near < far && far > 0.02 && near < 0.98) ? 0.0 : 1.0;
}

void main(){
  if (vW.x > uCutX) discard;
  #ifdef SHELL
    // Where two rooms meet, their shared wall is an opening.
    if (interiorSdf(vW) < -0.02) discard;
  #endif
  vec3 n = normalize(vN);
  vec3 an = abs(n);

  // Blocks: large polished granite, smaller limestone.
  float granite = step(0.5, vStone);
  vec2 size = mix(vec2(1.5, 0.87), vec2(2.4, 1.166), granite);
  float h = vW.y - vLift;
  vec2 bc = an.y > 0.7 ? vW.xz / size.x : vec2((an.x > an.z ? vW.z : vW.x) / size.x, h / size.y);
  bc.x += floor(bc.y) * 0.43;
  float id = hash21(floor(bc) + 11.0);
  vec2 f = fract(bc);
  float fw = fwidth(bc.x) + fwidth(bc.y);
  float fade = 1.0 - smoothstep(0.08, 0.5, fw);
  float joint = smoothstep(0.0, 0.02, f.x) * smoothstep(1.0, 0.98, f.x) * smoothstep(0.0, 0.03, f.y) * smoothstep(1.0, 0.97, f.y);
  vec3 albedo = mix(uLime, uGranite, granite);
  if (vStone > 1.5) albedo *= 0.62;
  float grain = vnoise(vW.xz * 7.0 + vW.y * 5.0);
  albedo *= 1.0 + (id - 0.5) * 0.2 * fade;
  albedo *= mix(0.94, 1.06, grain) * mix(1.0, mix(0.55, 1.0, joint), fade);
  albedo *= mix(1.0, 0.8 + 0.4 * vnoise(vW.zy * 0.8 + vW.x), granite);

  // Corners gather darkness.
  float ao = clamp(-interiorSdf(vW + n * 0.45) / 0.45, 0.0, 1.0);
  ao = mix(0.35, 1.0, ao);

  vec3 warm = vec3(1.0, 0.66, 0.36);
  vec3 light = vec3(0.008, 0.006, 0.005);

  // The lamp you carry.
  vec3 la = uLampA - vW;
  float da = length(la);
  light += warm * uLampAI * (max(dot(n, la / da), 0.0) * 0.95 + 0.06) / (1.0 + 0.3 * da * da);
  light += warm * uLampAI * 0.012 / (1.0 + 0.012 * da * da);

  // The lamp in the King's Chamber, with a living flame.
  vec3 lb = uLampB - vW;
  float db = length(lb);
  #ifdef CALM
    float flick = 0.95;
  #else
    float flick = 0.9 + 0.1 * vnoise(vec2(uTime * 7.0, 3.0)) + 0.04 * sin(uTime * 23.0);
  #endif
  float lit = boxShadow(vW + n * 0.01, lb);
  float reach = step(0.0, -graniteSdf(vW + n * 0.05) + 0.3); // stays in the granite rooms
  vec3 lampB = warm * uLampBI * flick * reach * 1.9 / (1.0 + 0.55 * db * db);
  light += lampB * (max(dot(n, lb / db), 0.0) * lit + 0.08);

  // Daylight, when the pyramid is cut open.
  float depth = exp(-max(uCutX - vW.x, 0.0) * 0.22);
  light += uOpen * (uSunColor * max(dot(n, uSunDir), 0.0) * 1.5 * depth + mix(uHorizon, uZenith, 0.4) * (0.25 + 0.35 * depth));

  vec3 col = albedo * light * ao;

  // Polished granite catches the flame.
  vec3 V = normalize(cameraPosition - vW);
  float spec = pow(max(dot(n, normalize(lb / db + V)), 0.0), 90.0);
  col += warm * spec * lit * reach * granite * uLampBI * 0.22 / (1.0 + 0.55 * db * db);

  gl_FragColor = vec4(col, 1.0);
  ${OUTPUT_GLSL}
}`,
  })
}

// The cut face: a flat slice through the masonry with the hollow spaces
// left open, like an architect's section drawing made solid.
function sectionMaterial() {
  const half = GIZA.base / 2
  return patchStandard(new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, metalness: 0 }), {
    uniforms: {
      uCourseH: { value: GIZA.height / GIZA.courses },
      uCore: { value: new THREE.Color(TONES.core).multiplyScalar(0.8) },
      uCasing: { value: new THREE.Color(PALETTE.limestone) },
      uGranite: { value: new THREE.Color(TONES.granite) },
      uEdge: { value: new THREE.Color(PALETTE.shadow) },
    },
    fragmentPars: `uniform float uCourseH;\nuniform vec3 uCore, uCasing, uGranite, uEdge;\n${NOISE_GLSL}\n${INTERIOR_GLSL}`,
    fragmentColor: /* glsl */ `
{
  float halfW = ${half.toFixed(2)} * (1.0 - vWPos.y / ${GIZA.height.toFixed(2)});
  if (vWPos.y < -0.4 || abs(vWPos.z) > halfW || vWPos.x > halfW) discard;
  float sd = interiorSdf(vWPos);
  if (sd < 0.0) discard;

  vec2 bc = vec2(vWPos.z / 1.9, vWPos.y / uCourseH);
  bc.x += floor(bc.y) * 0.37;
  float id = hash21(floor(bc) + 5.0);
  vec2 f = fract(bc);
  float fw = fwidth(bc.x) + fwidth(bc.y);
  float fade = 1.0 - smoothstep(0.06, 0.45, fw);
  float joint = smoothstep(0.0, 0.04, f.x) * smoothstep(1.0, 0.96, f.x) * smoothstep(0.0, 0.07, f.y) * smoothstep(1.0, 0.93, f.y);
  vec3 col = uCore * (1.0 + (id - 0.5) * 0.2 * fade) * mix(1.0, mix(0.72, 1.0, joint), fade);

  // The casing shows as a pale skin, the granite as a darker heart.
  float skin = min(halfW - abs(vWPos.z), halfW - vWPos.x);
  col = mix(uCasing, col, smoothstep(1.7, 2.3, skin));
  col = mix(uGranite, col, smoothstep(1.1, 1.5, graniteSdf(vWPos)));
  // A dark line around every hollow space, so the plan reads at a distance.
  float line = 0.1 + 0.0045 * length(cameraPosition - vWPos);
  col = mix(uEdge, col, smoothstep(line * 0.4, line, sd));
  diffuseColor.rgb = col;
}
`,
  })
}

function haloTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,214,150,1)')
  g.addColorStop(0.25, 'rgba(255,170,90,0.45)')
  g.addColorStop(1, 'rgba(255,140,60,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function Interior() {
  const group = useRef()
  const section = useRef()
  const flame = useRef()
  const halo = useRef()
  const rooms = useMemo(roomsGeometry, [])
  const fittings = useMemo(fittingsGeometry, [])
  const shellMat = useMemo(() => interiorMaterial(true), [])
  const propMat = useMemo(() => interiorMaterial(false), [])
  const sectionMat = useMemo(sectionMaterial, [])
  const haloTex = useMemo(haloTexture, [])
  const flameMat = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(5, 2.6, 0.8) }), [])
  const lamp = inner.uLampB.value

  useFrame(() => {
    const { cut } = journey.v
    const open = cut < GIZA.base / 2
    // Nothing inside is drawn until the pyramid is opened.
    group.current.visible = open || journey.v.inside > 0.001
    section.current.visible = open
    section.current.position.x = cut
    const t = atmos.uTime.value
    const k = calm ? 0.95 : 0.9 + 0.1 * Math.sin(t * 9.0) + 0.06 * Math.sin(t * 23.0)
    flame.current.scale.set(0.8 + 0.1 * k, 1.5 * k, 0.8 + 0.1 * k)
    halo.current.scale.setScalar(0.85 * k)
  })

  return (
    <>
      <group ref={group}>
        <mesh geometry={rooms} material={shellMat} frustumCulled={false} />
        <mesh geometry={fittings} material={propMat} frustumCulled={false} />
        <mesh ref={flame} material={flameMat} position={[lamp.x, lamp.y - 0.05, lamp.z]}>
          <sphereGeometry args={[0.04, 10, 8]} />
        </mesh>
        <sprite ref={halo} position={[lamp.x, lamp.y, lamp.z]}>
          <spriteMaterial map={haloTex} blending={THREE.AdditiveBlending} depthWrite={false} transparent opacity={0.55} />
        </sprite>
      </group>
      <mesh ref={section} material={sectionMat} position={[0, 75, 0]} rotation-y={Math.PI / 2} frustumCulled={false}>
        <planeGeometry args={[240, 152]} />
      </mesh>
    </>
  )
}
