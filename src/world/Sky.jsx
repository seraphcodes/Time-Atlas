// Sky dome with the sun, a warm horizon and thin high cloud.
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { atmos, NOISE_GLSL, SKY_GLSL, OUTPUT_GLSL } from '../design/glsl'

export function Sky() {
  const ref = useRef()
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        depthTest: false,
        fog: false,
        uniforms: {
          uSunDir: atmos.uSunDir,
          uSunColor: atmos.uSunColor,
          uZenith: atmos.uZenith,
          uHorizon: atmos.uHorizon,
          uGlow: atmos.uGlow,
          uTime: atmos.uTime,
        },
        vertexShader: /* glsl */ `
varying vec3 vDir;
void main(){
  vDir = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,
        fragmentShader: /* glsl */ `
${NOISE_GLSL}
${SKY_GLSL}
uniform float uTime;
varying vec3 vDir;
void main(){
  vec3 d = normalize(vDir);
  vec3 col = skyColor(d);

  // Thin streaks of high cloud, lit from the sun side.
  vec2 cp = d.xz / max(d.y, 0.06);
  float cl = fbm(cp * vec2(0.5, 1.5) + vec2(uTime * 0.003, 0.0));
  cl = smoothstep(0.5, 0.85, cl) * smoothstep(0.03, 0.3, d.y);
  float sd = max(dot(d, uSunDir), 0.0);
  col = mix(col, mix(uHorizon, uGlow, 0.4 + 0.6 * sd) * 1.08, cl * 0.4);

  // The sun: a small bright disc with a soft halo.
  col += uSunColor * smoothstep(0.99975, 0.99992, sd) * 5.0;
  col += uSunColor * pow(sd, 900.0) * 0.9;
  gl_FragColor = vec4(col, 1.0);
  ${OUTPUT_GLSL}
}`,
      }),
    [],
  )
  useFrame(({ camera }) => ref.current.position.copy(camera.position))
  return (
    <mesh ref={ref} material={material} frustumCulled={false} renderOrder={-10}>
      <sphereGeometry args={[20000, 48, 24]} />
    </mesh>
  )
}
