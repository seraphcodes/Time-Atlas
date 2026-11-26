// The land of Rome, its paved streets and the Tiber.
import { useMemo } from 'react'
import * as THREE from 'three'
import { NOISE_GLSL, atmos } from '../../design/glsl'
import { patchStandard } from '../../design/patch'
import { heightAt, WATER_Y } from './terrain'
import { STREETS, GARDENS } from './layout'

const COARSE = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
const N = COARSE ? 260 : 380
const CX = 150, CZ = 0, HALF = 30000
// Fine grid over the city, coarse towards the horizon.
const warp = (u, a) => Math.sign(u) * (a * Math.abs(u) + (1 - a) * Math.abs(u) ** 3)

function groundGeometry() {
  const pos = new Float32Array((N + 1) * (N + 1) * 3)
  let p = 0
  for (let j = 0; j <= N; j++) {
    const z = CZ + warp((j / N) * 2 - 1, 0.12) * HALF
    for (let i = 0; i <= N; i++) {
      const x = CX + warp((i / N) * 2 - 1, 0.12) * HALF
      pos[p++] = x
      pos[p++] = heightAt(x, z)
      pos[p++] = z
    }
  }
  const idx = new Uint32Array(N * N * 6)
  let k = 0
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const a = j * (N + 1) + i, b = a + 1, c = a + N + 1, d = c + 1
      idx[k++] = a; idx[k++] = c; idx[k++] = b
      idx[k++] = b; idx[k++] = c; idx[k++] = d
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setIndex(new THREE.BufferAttribute(idx, 1))
  g.computeVertexNormals()
  return g
}

function groundMaterial() {
  const c = (hex) => ({ value: new THREE.Color(hex) })
  const gardens = GARDENS.map((g) => new THREE.Vector3(g.x, g.z, g.r))
  return patchStandard(new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1 }), {
    uniforms: {
      uTown: c('#9C8F7B'), uGrass: c('#6F7A45'), uDry: c('#9E9460'), uField: c('#7C8648'), uBank: c('#7E735F'), uFar: c('#6E7A5A'),
      uGardens: { value: gardens },
    },
    fragmentPars: `uniform vec3 uTown, uGrass, uDry, uField, uBank, uFar;\nuniform vec3 uGardens[${gardens.length}];\n${NOISE_GLSL}`,
    fragmentColor: `
      vec2 P = vWPos.xz;
      float r = length(P - vec2(300.0, -100.0));
      float city = 1.0 - smoothstep(1700.0, 3400.0, r + 400.0 * (vnoise(P * 0.0015) - 0.5));
      float slope = 1.0 - clamp(vNrmW.y, 0.0, 1.0);
      float n = fbm(P * 0.004);
      // the Campagna: fields, pasture and dry grass
      vec3 country = mix(uField, uDry, smoothstep(0.35, 0.65, fbm(P * 0.0011 + 3.0)));
      country = mix(country, uGrass, smoothstep(0.5, 0.72, n));
      country *= 0.9 + 0.14 * step(0.5, fract(dot(P, vec2(0.0067, 0.0021)) + vnoise(P * 0.003)));
      country = mix(country, uFar, smoothstep(6000.0, 16000.0, r));
      // the town: trodden earth and paving, with green on steep slopes
      vec3 town = mix(uTown, uGrass, smoothstep(0.18, 0.5, slope) * 0.8);
      float green = 0.0;
      for (int i = 0; i < ${gardens.length}; i++) {
        green = max(green, 1.0 - smoothstep(0.6, 1.05, length(P - uGardens[i].xy) / uGardens[i].z));
      }
      town = mix(town, mix(uGrass, uDry, 0.35) * (0.9 + 0.2 * n), green * 0.7);
      vec3 col = mix(country, town, city);
      col = mix(col, uBank, smoothstep(-1.0, -5.0, vWPos.y));
      col *= 0.88 + 0.2 * vnoise(P * 0.08);
      diffuseColor.rgb = col;`,
  })
}

// Streets as ribbons laid on the ground: basalt paving (silex).
function streetGeometry() {
  const pos = []
  for (const st of STREETS) {
    const pts = []
    for (let i = 0; i < st.pts.length - 1; i++) {
      const [ax, az] = st.pts[i], [bx, bz] = st.pts[i + 1]
      const n = Math.max(1, Math.round(Math.hypot(bx - ax, bz - az) / 8))
      for (let k = 0; k < n; k++) pts.push([ax + ((bx - ax) * k) / n, az + ((bz - az) * k) / n])
    }
    pts.push(st.pts[st.pts.length - 1])
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, az] = pts[i], [bx, bz] = pts[i + 1]
      const l = Math.hypot(bx - ax, bz - az) || 1
      const nx = (-(bz - az) / l) * (st.w / 2), nz = ((bx - ax) / l) * (st.w / 2)
      const y = (x, z) => Math.max(heightAt(x, z), WATER_Y + 9) + 0.25
      const A = [ax + nx, y(ax + nx, az + nz), az + nz], B = [ax - nx, y(ax - nx, az - nz), az - nz]
      const Cc = [bx + nx, y(bx + nx, bz + nz), bz + nz], D = [bx - nx, y(bx - nx, bz - nz), bz - nz]
      pos.push(...A, ...B, ...Cc, ...B, ...D, ...Cc)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.computeVertexNormals()
  return g
}

function waterMaterial() {
  return new THREE.ShaderMaterial({
    transparent: false,
    fog: true,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uDeep: { value: new THREE.Color('#4E6A5E') }, uShallow: { value: new THREE.Color('#7E8F74') } }]),
    vertexShader: /* glsl */ `
#include <fog_pars_vertex>
varying vec3 vW;
void main(){
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  vec4 mvPosition = viewMatrix * w;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`,
    fragmentShader: /* glsl */ `
#include <fog_pars_fragment>
uniform vec3 uDeep, uShallow, uSunDir, uSunColor, uHorizon, uZenith;
uniform float uTime;
varying vec3 vW;
${NOISE_GLSL}
void main(){
  vec3 v = normalize(cameraPosition - vW);
  vec2 p = vW.xz;
  float t = uTime;
  vec2 g = vec2(vnoise(p * 0.08 + vec2(0.0, t * 0.25)) - vnoise(p * 0.08 + vec2(3.0, t * 0.25)),
                vnoise(p * 0.11 - vec2(t * 0.2, 0.0)) - vnoise(p * 0.11 + vec2(7.0, -t * 0.2)));
  vec3 n = normalize(vec3(g.x * 0.25, 1.0, g.y * 0.25));
  float fres = pow(1.0 - max(dot(n, v), 0.0), 4.0);
  vec3 sky = mix(uHorizon, uZenith, 0.35);
  vec3 col = mix(uDeep, uShallow, 0.4 + 0.3 * vnoise(p * 0.01));
  col = mix(col, sky, 0.25 + 0.55 * fres);
  vec3 h = normalize(uSunDir + v);
  col += uSunColor * pow(max(dot(n, h), 0.0), 180.0) * 1.4;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}`,
  })
}

export function Ground() {
  const geo = useMemo(groundGeometry, [])
  const mat = useMemo(groundMaterial, [])
  const streets = useMemo(streetGeometry, [])
  const water = useMemo(() => {
    const m = waterMaterial()
    Object.assign(m.uniforms, { uSunDir: atmos.uSunDir, uSunColor: atmos.uSunColor, uHorizon: atmos.uHorizon, uZenith: atmos.uZenith, uTime: atmos.uTime })
    return m
  }, [])
  return (
    <group>
      <mesh geometry={geo} material={mat} receiveShadow />
      <mesh geometry={streets} receiveShadow>
        <meshStandardMaterial color="#77716A" roughness={0.9} polygonOffset polygonOffsetFactor={-2} />
      </mesh>
      <mesh position={[-900, WATER_Y, 400]} rotation-x={-Math.PI / 2} material={water}>
        <planeGeometry args={[4000, 9000]} />
      </mesh>
    </group>
  )
}
