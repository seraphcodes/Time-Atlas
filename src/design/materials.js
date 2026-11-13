// Design system, part 3: the reusable materials. Limestone, core stone,
// mudbrick, wood and linen are defined once and shared by every scene.
import * as THREE from 'three'
import { PALETTE, TONES, GIZA, NEIGHBOURS } from './tokens'
import { NOISE_GLSL, atmos } from './glsl'
import { patchStandard } from './patch'

const courseH = { value: GIZA.height / GIZA.courses }

// Shared masonry pattern: staggered blocks with joints that fade out in the
// distance so the surface never shimmers. Options:
//   cut:   the cutaway can remove everything east of atmos.uCutX
//   strip: 'all' = every casing block is carried away over time, lowest first;
//          'keepTop' = the same, but the top third survives (Khafre's pyramid)
const masonry = ({ len, joint, tone, cut, strip }) => /* glsl */ `
{
  vec3 an = abs(vNrmW);
  // The flat top of each course only matters while building; once the
  // pyramid is opened those faces would float inside the chambers.
  ${cut ? 'if (vWPos.x > uCutX || (an.y > 0.9 && uCutX < 200.0)) discard;' : ''}
  float along = an.x > an.z ? vWPos.z : vWPos.x;
  vec2 bc = vec2(along / ${len.toFixed(2)}, vWPos.y / uCourseH - 0.001);
  if (an.y > 0.9) bc = vWPos.xz / ${len.toFixed(2)};
  bc.x += floor(bc.y) * 0.41;
  float id = hash21(floor(bc) + 3.0);
  ${
    strip
      ? `if (uStrip > 0.0) {
    float up = clamp(vWPos.y / uH, 0.0, 1.0);
    float gone = ${strip === 'all' ? 'uStrip * 1.08' : 'uStrip * 0.74'};
    if (gone > up * 0.72 + (an.y > 0.9 ? 0.0 : id * 0.28) + 0.03) discard;
  }`
      : ''
  }
  vec2 f = fract(bc);
  float fw = fwidth(bc.x) + fwidth(bc.y);
  float fade = 1.0 - smoothstep(0.06, 0.45, fw);
  float jx = smoothstep(0.0, 0.035, f.x) * smoothstep(1.0, 0.965, f.x);
  float jy = smoothstep(0.0, 0.06, f.y) * smoothstep(1.0, 0.94, f.y);
  diffuseColor.rgb *= mix(1.0, mix(${joint.toFixed(2)}, 1.0, jx * jy), fade);
  diffuseColor.rgb *= 1.0 + (id - 0.5) * ${tone.toFixed(2)} * fade;
  diffuseColor.rgb *= 0.96 + 0.08 * vnoise(vec2(along, vWPos.y) * 0.06);
  // Weathering: forty-six centuries of sun, wind and sand.
  vec3 worn = uWorn * (0.8 + 0.4 * fbm(vec2(along, vWPos.y) * 0.035)) * mix(1.0, 0.72 + 0.56 * id, fade);
  diffuseColor.rgb = mix(diffuseColor.rgb, worn, uNow * 0.85);
}
`

function stone({ color, roughness, height = GIZA.height, ...pattern }) {
  return patchStandard(new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 }), {
    uniforms: {
      uCourseH: courseH,
      uCutX: atmos.uCutX,
      uStrip: atmos.uStrip,
      uNow: atmos.uNow,
      uH: { value: height },
      uWorn: { value: new THREE.Color(TONES.weathered) },
    },
    fragmentPars: `uniform float uCourseH, uCutX, uStrip, uNow, uH;\nuniform vec3 uWorn;\n${NOISE_GLSL}`,
    fragmentColor: masonry(pattern),
  })
}

const casing = { color: PALETTE.limestone, roughness: 0.5, len: 2.6, joint: 0.9, tone: 0.05 }
const core = { color: TONES.core, roughness: 0.95, len: 1.7, joint: 0.7, tone: 0.22 }

// Fine white Tura limestone: the smooth outer casing of the Great Pyramid.
export const casingMaterial = stone({ ...casing, cut: true, strip: 'all' })
// Local core limestone: the stepped inner structure.
export const coreMaterial = stone({ ...core, cut: true })
// Dressed limestone for the temple, causeway, wall and queens' pyramids.
export const ashlarMaterial = stone({ ...casing })
// The pyramids of Khafre and Menkaure.
export const neighbourCoreMaterial = stone({ ...core })
export const khafreCasingMaterial = stone({ ...casing, strip: 'keepTop', height: NEIGHBOURS.khafre.height })
export const menkaureCasingMaterial = stone({ ...casing, strip: 'all', height: NEIGHBOURS.menkaure.height })

// Ramp: rubble and mudbrick sides, timber sleepers across the hauling surface.
export const rampMaterial = patchStandard(
  new THREE.MeshStandardMaterial({ color: TONES.mudbrick, roughness: 1, metalness: 0 }),
  {
    vertexPars: 'attribute float aAlong;\nvarying float vAlong;',
    vertexMain: 'vAlong = aAlong;',
    fragmentPars: `varying float vAlong;\n${NOISE_GLSL}`,
    fragmentColor: /* glsl */ `
{
  float n = fbm(vWPos.xz * 0.12 + vWPos.y * 0.2);
  diffuseColor.rgb *= 0.86 + 0.26 * n;
  if (vNrmW.y > 0.8) {
    float fw = fwidth(vAlong / 1.6);
    float sleeper = smoothstep(0.72, 0.8, fract(vAlong / 1.6)) * (1.0 - smoothstep(0.1, 0.5, fw));
    diffuseColor.rgb = mix(diffuseColor.rgb * 1.14, vec3(0.19, 0.12, 0.07), sleeper * 0.7);
  } else {
    float fw = fwidth(vWPos.y / 0.5);
    float course = smoothstep(0.0, 0.12, fract(vWPos.y / 0.5)) * 0.14 * (1.0 - smoothstep(0.1, 0.5, fw));
    diffuseColor.rgb *= 0.9 + course;
  }
}
`,
  },
)

// Loose blocks, sledges, boats, sails and houses use plain shared materials.
export const blockMaterial = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9 })
export const woodMaterial = new THREE.MeshStandardMaterial({ color: TONES.wood, roughness: 0.9 })
export const linenMaterial = new THREE.MeshStandardMaterial({ color: TONES.linen, roughness: 0.95, side: THREE.DoubleSide })
export const mudbrickMaterial = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1 })
export const vertexColorMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 })
export const foliageMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, side: THREE.DoubleSide })
