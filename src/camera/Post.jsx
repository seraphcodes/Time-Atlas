// The cinematic finish, for devices with power to spare: a soft glow on the
// brightest light, darker corners, a little film grain, and colour that
// drains slightly while the centuries rush past. Phones skip all of this.
import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { atmos } from '../design/glsl'
import { journey } from '../journey/journey'

const GradeShader = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uSaturation: { value: 1 }, uVignette: { value: 0.3 }, uGrain: { value: 0.03 } },
  vertexShader: /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
uniform sampler2D tDiffuse;
uniform float uTime, uSaturation, uVignette, uGrain;
varying vec2 vUv;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
void main(){
  vec3 col = texture2D(tDiffuse, vUv).rgb;
  float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(vec3(luma), col, uSaturation);
  vec2 q = vUv - 0.5;
  col *= 1.0 - uVignette * smoothstep(0.25, 0.95, dot(q, q) * 2.4);
  col *= 1.0 + uGrain * (hash(vUv * 917.0 + fract(uTime) * 61.0) - 0.5) * 2.0;
  gl_FragColor = vec4(col, 1.0);
}`,
}

export function Post() {
  const { gl, scene, camera, size } = useThree()
  const { composer, bloom, grade } = useMemo(() => {
    const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 })
    const composer = new EffectComposer(gl, target)
    composer.addPass(new RenderPass(scene, camera))
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.3, 0.55, 1.0)
    composer.addPass(bloom)
    const grade = new ShaderPass(GradeShader)
    composer.addPass(grade)
    composer.addPass(new OutputPass())
    return { composer, bloom, grade }
  }, [gl, scene, camera])

  useEffect(() => {
    composer.setPixelRatio(gl.getPixelRatio())
    composer.setSize(size.width, size.height)
  }, [composer, gl, size, gl.getPixelRatio()])

  useEffect(() => () => composer.dispose(), [composer])

  // Priority 1 means this replaces the normal draw call.
  useFrame(() => {
    const { inside = 0, warp = 0, now = 0 } = journey.v
    bloom.strength = 0.28 + 0.5 * inside // the flame glows in the dark
    bloom.threshold = 1.0 - 0.6 * inside
    grade.uniforms.uTime.value = atmos.uTime.value
    grade.uniforms.uSaturation.value = 1 - 0.3 * warp - 0.06 * now
    grade.uniforms.uVignette.value = 0.3 + 0.25 * inside + 0.12 * warp
    composer.render()
  }, 1)
  return null
}
