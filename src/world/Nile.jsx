// The Nile, the harbour canal and the dawn mist that lies over the valley.
import { useMemo } from 'react'
import * as THREE from 'three'
import { PALETTE, LAND } from '../design/tokens'
import { atmos, NOISE_GLSL, CHANNEL_GLSL, SKY_GLSL, FOG_GLSL, OUTPUT_GLSL } from '../design/glsl'

const worldVertex = /* glsl */ `
varying vec3 vW;
void main(){
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`

function waterMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      ...atmos,
      // A quiet blue-green, never turquoise: the palette's Nile Blue, deepened.
      uDeep: { value: new THREE.Color(PALETTE.nile).multiplyScalar(0.5) },
    },
    vertexShader: worldVertex,
    fragmentShader: /* glsl */ `
${NOISE_GLSL}
${CHANNEL_GLSL}
${SKY_GLSL}
${FOG_GLSL}
uniform float uTime;
uniform vec3 uDeep;
varying vec3 vW;
void main(){
  vec2 P = vW.xz;
  float d = channelDist(P);
  float a = smoothstep(-9.0, -20.0, d);
  if (a < 0.004) discard;

  vec3 V = normalize(cameraPosition - vW);
  float dist = length(cameraPosition - vW);
  float calm = mix(1.0, 0.4, smoothstep(150.0, 1500.0, dist));
  vec2 w1 = vec2(vnoise(P * 0.11 + vec2(uTime * 0.35, uTime * 0.12)), vnoise(P * 0.11 + vec2(4.7 - uTime * 0.2, 9.1 + uTime * 0.3))) - 0.5;
  vec2 w2 = vec2(vnoise(P * 0.47 + vec2(-uTime * 0.6, 2.0)), vnoise(P * 0.47 + vec2(7.3, uTime * 0.55))) - 0.5;
  vec2 rip = (w1 * 0.2 + w2 * 0.1) * calm;
  vec3 n = normalize(vec3(rip.x, 1.0, rip.y));

  float fres = 0.04 + 0.96 * pow(1.0 - max(dot(n, V), 0.0), 5.0);
  vec3 R = reflect(-V, n);
  R.y = abs(R.y);
  vec3 col = mix(uDeep, skyColor(R), fres);

  // Sunlight breaking on the ripples.
  float sr = max(dot(R, uSunDir), 0.0);
  col += uSunColor * (pow(sr, 700.0) * 5.0 + pow(sr, 70.0) * 0.35);

  col = applyFog(col, dist);
  gl_FragColor = vec4(col, a);
  ${OUTPUT_GLSL}
}`,
  })
}

function mistMaterial(seed) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: { ...atmos, uSeed: { value: seed } },
    vertexShader: worldVertex,
    fragmentShader: /* glsl */ `
${NOISE_GLSL}
${SKY_GLSL}
uniform float uTime;
uniform float uMist;
uniform float uSeed;
uniform vec3 uFogColor;
varying vec3 vW;
void main(){
  vec2 P = vW.xz;
  float n = fbm(P * 0.0016 + vec2(uTime * 0.004 + uSeed * 7.0, uSeed * 3.0));
  float a = smoothstep(0.38, 0.7, n);
  // Mist stays over the low valley: none on the plateau or in the far desert.
  a *= smoothstep(760.0, 1050.0, P.x) * (1.0 - smoothstep(3300.0, 4100.0, P.x));
  a *= 1.0 - smoothstep(3500.0, 6500.0, abs(P.y));
  float dist = length(cameraPosition - vW);
  a *= smoothstep(40.0, 260.0, dist);
  vec3 V = normalize(vW - cameraPosition);
  float sd = max(dot(V, uSunDir), 0.0);
  vec3 col = mix(uFogColor * 1.06, uGlow * 1.15, pow(sd, 6.0) * 0.7);
  gl_FragColor = vec4(col, a * uMist * 0.5);
  ${OUTPUT_GLSL}
}`,
  })
}

export function Nile() {
  const water = useMemo(waterMaterial, [])
  const mist = useMemo(() => [mistMaterial(0.13), mistMaterial(0.57), mistMaterial(0.91)], [])
  return (
    <>
      <mesh material={water} position={[2600, LAND.waterY, 0]} rotation-x={-Math.PI / 2} renderOrder={2} frustumCulled={false}>
        <planeGeometry args={[6400, 20000]} />
      </mesh>
      {mist.map((m, i) => (
        <mesh key={i} material={m} position={[2450, LAND.floodY + 5 + i * 5, 0]} rotation-x={-Math.PI / 2} renderOrder={3 + i} frustumCulled={false}>
          <planeGeometry args={[3600, 14000]} />
        </mesh>
      ))}
    </>
  )
}
