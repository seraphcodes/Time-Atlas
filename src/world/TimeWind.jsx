// Dust carried across the lens while the centuries pass. One flat sheet in
// front of the camera, so it costs almost nothing on any device.
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { atmos, NOISE_GLSL, OUTPUT_GLSL } from '../design/glsl'

export function TimeWind() {
  const ref = useRef()
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthTest: false,
        depthWrite: false,
        uniforms: { uTime: atmos.uTime, uWarp: atmos.uWarp, uFogColor: atmos.uFogColor },
        vertexShader: /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`,
        fragmentShader: /* glsl */ `
${NOISE_GLSL}
uniform float uTime, uWarp;
uniform vec3 uFogColor;
varying vec2 vUv;
void main(){
  // Long thin streaks, slightly tilted, running fast from right to left.
  vec2 p = vec2(vUv.x * 1.6 + uTime * 1.9 + vUv.y * 0.35, vUv.y * 46.0);
  float streak = fbm(p) * vnoise(vec2(vUv.x * 0.7 + uTime * 0.9, vUv.y * 7.0 + 3.0));
  streak = smoothstep(0.2, 0.52, streak);
  float veil = 0.5 + 0.5 * vnoise(vUv * 2.2 + vec2(uTime * 0.5, 0.0));
  float a = uWarp * (streak * 0.2 + veil * 0.1);
  gl_FragColor = vec4(uFogColor * 1.08, a);
  ${OUTPUT_GLSL}
}`,
      }),
    [],
  )
  useFrame(() => {
    ref.current.visible = atmos.uWarp.value > 0.01
  })
  return (
    <mesh ref={ref} material={material} frustumCulled={false} renderOrder={50}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  )
}
