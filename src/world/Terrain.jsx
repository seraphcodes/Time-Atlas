// The land: plateau, escarpment, floodplain with fields, riverbed, dunes.
import { useMemo } from 'react'
import * as THREE from 'three'
import { PALETTE, TONES } from '../design/tokens'
import { NOISE_GLSL, CHANNEL_GLSL, atmos } from '../design/glsl'
import { patchStandard } from '../design/patch'
import { groundAt } from './terrainMath'

const NX = 448
const NZ = 224
const CENTER_X = 600
const HALF = 11000

// Fine grid near the site and the river, coarse grid far away.
const warp = (u, a) => Math.sign(u) * (a * Math.abs(u) + (1 - a) * Math.abs(u) ** 3)

function buildGeometry() {
  const pos = new Float32Array((NX + 1) * (NZ + 1) * 3)
  let p = 0
  for (let iz = 0; iz <= NZ; iz++) {
    const z = warp((iz / NZ) * 2 - 1, 0.1) * HALF
    for (let ix = 0; ix <= NX; ix++) {
      const x = CENTER_X + warp((ix / NX) * 2 - 1, 0.12) * HALF
      pos[p++] = x
      pos[p++] = groundAt(x, z)
      pos[p++] = z
    }
  }
  const idx = new Uint32Array(NX * NZ * 6)
  let i = 0
  for (let iz = 0; iz < NZ; iz++) {
    for (let ix = 0; ix < NX; ix++) {
      const a = iz * (NX + 1) + ix
      const b = a + 1
      const c = a + NX + 1
      const d = c + 1
      idx[i++] = a; idx[i++] = c; idx[i++] = b
      idx[i++] = b; idx[i++] = c; idx[i++] = d
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setIndex(new THREE.BufferAttribute(idx, 1))
  g.computeVertexNormals()
  return g
}

function buildMaterial() {
  const col = (hex) => ({ value: new THREE.Color(hex) })
  return patchStandard(new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, metalness: 0 }), {
    uniforms: {
      uSandA: col(PALETTE.sand),
      uSandB: col('#D8BB8E'),
      uChip: col(TONES.chips),
      uRock: col(PALETTE.sandstone),
      uCropA: col(TONES.cropA),
      uCropB: col(TONES.cropB),
      uFallow: col(TONES.fallow),
      uSoil: col(TONES.soil),
      uMud: col(TONES.mud),
      uCityCol: col(TONES.city),
      uSilt: atmos.uSilt,
      uRiverShift: atmos.uRiverShift,
      uCity: atmos.uCity,
    },
    // The water channels are cut here, not in the mesh, because they change:
    // the harbour and its canal silt up, and the river wanders east.
    vertexPars: `uniform float uSilt;\n${CHANNEL_GLSL}
float cutDepth(vec2 p){
  return max(smoothstep(20.0, -40.0, riverDist(p)), smoothstep(20.0, -40.0, harbourDist(p)) * (1.0 - uSilt));
}`,
    vertexMain: /* glsl */ `
{
  float low = smoothstep(-20.0, -38.0, transformed.y);
  if (low > 0.0) {
    vec2 P = transformed.xz;
    float drop = (transformed.y + 50.0) * low;
    float c0 = cutDepth(P), cx = cutDepth(P + vec2(14.0, 0.0)), cz = cutDepth(P + vec2(0.0, 14.0));
    transformed.y -= drop * c0;
    vNrmW = normalize(normal + vec3(cx - c0, 0.0, cz - c0) * drop / 14.0);
  }
}`,
    fragmentPars: /* glsl */ `
uniform vec3 uSandA, uSandB, uChip, uRock, uCropA, uCropB, uFallow, uSoil, uMud, uCityCol;
uniform float uSilt, uCity;
${NOISE_GLSL}
${CHANNEL_GLSL}
float duneH(vec2 p){
  return 8.0 * (1.0 - abs(2.0 * vnoise(p * vec2(0.013, 0.005)) - 1.0)) + 1.1 * vnoise(p * 0.07);
}
`,
    fragmentNormal: /* glsl */ `
{
  // Wind-shaped relief in the sand, so the low sun has something to catch.
  vec2 P = vWPos.xz;
  float dist = length(cameraPosition - vWPos);
  float e = 1.5 + dist * 0.004;
  float h0 = duneH(P), hx = duneH(P + vec2(e, 0.0)), hz = duneH(P + vec2(0.0, e));
  vec2 g = vec2(hx - h0, hz - h0) / e;
  float desert = smoothstep(-36.0, -24.0, vWPos.y);
  float site = smoothstep(200.0, 560.0, length(P - vec2(20.0, 220.0)));
  vec3 nW = normalize(normalize(vNrmW) + vec3(-g.x, 0.0, -g.y) * (0.2 + 0.8 * site) * desert);
  normal = normalize((viewMatrix * vec4(nW, 0.0)).xyz);
}
`,
    fragmentColor: /* glsl */ `
{
  vec2 P = vWPos.xz;
  float h = vWPos.y;
  float n1 = fbm(P * 0.004);
  float n2 = fbm(P * 0.035);
  float n3 = vnoise(P * 0.9);

  // Desert: two sand tones, wind streaks, bare rock on steep ground.
  vec3 sand = mix(uSandA, uSandB, smoothstep(0.3, 0.7, n1));
  sand *= 0.9 + 0.2 * n2;
  sand *= 0.96 + 0.08 * n3;
  float site = 1.0 - smoothstep(240.0, 560.0, length(P - vec2(20.0, 190.0)));
  sand = mix(sand, uChip, site * (0.35 + 0.4 * n2));
  float slope = 1.0 - normalize(vNrmW).y;
  sand = mix(sand, uRock * (0.8 + 0.5 * n2), smoothstep(0.05, 0.3, slope) * 0.75);

  // Floodplain: a patchwork of fields, greenest near the water.
  float d = channelDist(P);
  vec2 fp = P / vec2(64.0, 104.0) + vec2(fbm(P * 0.0021), fbm(P * 0.0017 + 5.0)) * 1.6;
  float r = hash21(floor(fp));
  vec3 crop = r < 0.42 ? uCropA : (r < 0.7 ? uCropB : (r < 0.88 ? uFallow : uSoil));
  crop *= 0.88 + 0.24 * vnoise(P * 0.5 + r * 40.0);
  vec2 ff = fract(fp);
  float fwp = fwidth(fp.x) + fwidth(fp.y);
  float dyke = min(min(ff.x, 1.0 - ff.x), min(ff.y, 1.0 - ff.y));
  crop = mix(uSoil, crop, mix(1.0, smoothstep(0.0, 0.07, dyke), 1.0 - smoothstep(0.05, 0.4, fwp)));
  float fertile = smoothstep(1300.0, 250.0, d) * smoothstep(0.25, 0.5, fbm(P * 0.0015 + 2.0) + 0.25);
  vec3 plain = mix(mix(uFallow, uSandA, n1), crop, fertile);
  float bank = max(smoothstep(34.0, 6.0, riverDist(P)), smoothstep(34.0, 6.0, harbourDist(P)) * (1.0 - uSilt));
  plain = mix(plain, uMud * (0.85 + 0.3 * n2), bank);

  // Today: streets and flat roofs where the fields were.
  if (uCity > 0.0) {
    vec2 cp = P / vec2(34.0, 44.0) + vec2(fbm(P * 0.0031), fbm(P * 0.0027 + 9.0)) * 1.2;
    float cr = hash21(floor(cp) + 7.0);
    vec2 cf = fract(cp);
    float cw = fwidth(cp.x) + fwidth(cp.y);
    float street = smoothstep(0.0, 0.14, min(min(cf.x, 1.0 - cf.x), min(cf.y, 1.0 - cf.y)));
    vec3 town = uCityCol * (0.82 + 0.26 * cr) * (0.9 + 0.2 * vnoise(P * 0.35));
    town = mix(town, mix(uCityCol, uCropA, 0.45), step(0.93, cr));
    town = mix(uCityCol * 0.72, town, mix(1.0, street, 1.0 - smoothstep(0.05, 0.5, cw)));
    float built = smoothstep(0.0, 1.0, uCity * 1.6 - 0.6 * fbm(P * 0.0012 + 3.0));
    plain = mix(plain, town, built);
  }

  float flood = smoothstep(-28.0, -39.0, h) * (1.0 - smoothstep(3900.0, 4700.0, P.x));
  diffuseColor.rgb = mix(sand, plain, flood);
}
`,
  })
}

export function Terrain() {
  const geometry = useMemo(buildGeometry, [])
  const material = useMemo(buildMaterial, [])
  return <mesh geometry={geometry} material={material} receiveShadow frustumCulled={false} />
}
