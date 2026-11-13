// Design system, part 2: shader building blocks and the shared atmosphere.
// The same sky, sun and haze feed every custom surface.
import * as THREE from 'three'

// One set of live values. The Director updates them every frame.
export const atmos = {
  uTime: { value: 0 },
  uSunDir: { value: new THREE.Vector3(0.96, 0.1, 0.24).normalize() },
  uSunColor: { value: new THREE.Color('#FFB974') },
  uZenith: { value: new THREE.Color('#2F4868') },
  uHorizon: { value: new THREE.Color('#C99F7C') },
  uGlow: { value: new THREE.Color('#F0B46A') },
  uFogColor: { value: new THREE.Color('#C99F7C') },
  uFogDensity: { value: 0.00018 },
  uMist: { value: 1 },
  uDust: { value: 0 },
  uPx: { value: 1000 }, // pixels per metre at 1 m distance
  uCutX: { value: 1000 }, // the cutaway: everything east of this line is removed
  uStrip: { value: 0 }, // how much of the casing has been carried away
  uSilt: { value: 0 }, // how far the harbour and its canal have filled in
  uRiverShift: { value: 0 }, // how far east the river has moved, in metres
  uCity: { value: 0 }, // how much of the floodplain is built over
  uNow: { value: 0 }, // weathering: 0 = freshly built, 1 = today
  uWarp: { value: 0 }, // how fast time is passing
}

// Light inside the pyramid: a lamp carried by the visitor (A), a lamp standing
// in the King's Chamber (B), and daylight when the cutaway is open.
export const inner = {
  uLampA: { value: new THREE.Vector3() },
  uLampAI: { value: 0 },
  uLampB: { value: new THREE.Vector3(1.8, 43.3, 10.0) },
  uLampBI: { value: 1 },
  uOpen: { value: 0 },
}

export const NOISE_GLSL = /* glsl */ `
float hash21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i), b = hash21(i + vec2(1.0, 0.0)), c = hash21(i + vec2(0.0, 1.0)), d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p){
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return s;
}
`

// The river, harbour canal and basin. Mirrors world/terrainMath.js, except
// that here the river can shift east (uRiverShift), as it has since 2560 BC.
export const CHANNEL_GLSL = /* glsl */ `
uniform float uRiverShift;
float riverX(float z){ return 1650.0 + uRiverShift + 170.0 * sin(z * 0.0011 + 0.4) + 80.0 * sin(z * 0.0027 + 1.3); }
float canalZ(float x){ return 40.0 * sin(x * 0.004); }
float riverDist(vec2 p){ return abs(p.x - riverX(p.y)) - 200.0; }
float harbourDist(vec2 p){
  float cx = clamp(p.x, 880.0, 4000.0);
  float dC = length(vec2(p.x - cx, p.y - canalZ(cx))) - 28.0;
  if (p.x > riverX(p.y)) dC = 1.0e5;
  float dB = (length(vec2((p.x - 900.0) / 95.0, p.y / 70.0)) - 1.0) * 70.0;
  return min(dC, dB);
}
float channelDist(vec2 p){ return min(riverDist(p), harbourDist(p)); }
`

export const SKY_GLSL = /* glsl */ `
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform vec3 uGlow;
vec3 skyColor(vec3 d){
  d = normalize(d);
  float e = max(d.y, 0.0);
  float t = pow(e, 0.42);
  vec3 col = mix(uHorizon, uZenith, t);
  float sd = max(dot(d, uSunDir), 0.0);
  float az = max(dot(normalize(d.xz + 1.0e-5), normalize(uSunDir.xz)), 0.0);
  col = mix(col, uGlow, pow(az, 4.0) * (1.0 - t) * 0.8);
  col += uGlow * pow(sd, 24.0) * 0.45;
  return col;
}
`

export const FOG_GLSL = /* glsl */ `
uniform vec3 uFogColor;
uniform float uFogDensity;
vec3 applyFog(vec3 col, float dist){
  float f = 1.0 - exp(-uFogDensity * uFogDensity * dist * dist);
  return mix(col, uFogColor, f);
}
`

// Custom shaders must end with this to get the same tone mapping as the rest.
export const OUTPUT_GLSL = /* glsl */ `
#include <tonemapping_fragment>
#include <colorspace_fragment>
`
