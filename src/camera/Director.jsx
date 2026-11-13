// The Director runs once per frame: it moves the journey forward, places the
// camera on its path, and keeps one sun, one sky and one haze for all scenes.
import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { SKY, SUN, TONES } from '../design/tokens'
import { atmos, inner } from '../design/glsl'
import { advance, journey } from '../journey/journey'
import { buildPath } from './cameraPath'
import { attachRig, updateRig, applyRig, applyOrbit } from './rig'
import { projectHotspots } from './hotspotProjection'
import { updateSound } from '../audio/sound'
import { heightAt } from '../world/terrainMath'

const DEG = Math.PI / 180

export function Director() {
  const { camera, scene, gl, size } = useThree()
  const sun = useRef()
  const hemi = useRef()
  const path = useMemo(() => buildPath(), [])
  const k = useMemo(
    () => ({
      pos: new THREE.Vector3(), look: new THREE.Vector3(), fwd: new THREE.Vector3(), focus: new THREE.Vector3(),
      sunFlat: new THREE.Vector2(), a3: new THREE.Vector3(), b3: new THREE.Vector3(), a: new THREE.Color(), b: new THREE.Color(),
      dawn: Object.fromEntries(Object.entries(SKY.dawn).map(([n, v]) => [n, typeof v === 'string' ? new THREE.Color(v) : v])),
      day: Object.fromEntries(Object.entries(SKY.day).map(([n, v]) => [n, typeof v === 'string' ? new THREE.Color(v) : v])),
      now: Object.fromEntries(Object.entries(SKY.now).map(([n, v]) => [n, typeof v === 'string' ? new THREE.Color(v) : v])),
    }),
    [],
  )

  useLayoutEffect(() => {
    scene.fog = new THREE.FogExp2('#C99F7C', 0.0002)
    gl.toneMappingExposure = 1.12
    camera.near = 1
    camera.far = 45000
    camera.updateProjectionMatrix()
    scene.add(sun.current.target)
    window.__atmos = atmos // testing aid, see README
    return attachRig()
  }, [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    advance(dt)
    atmos.uTime.value += dt
    const { t, v } = journey
    const { pos, look, fwd, focus, dawn, day, now } = k

    // Camera on its path, never below the ground.
    path(t, pos, look)
    // On a tall phone screen the three pyramids of scene 5 do not fit side by
    // side, so the camera stands further back.
    const aspect = size.width / size.height
    const tall = THREE.MathUtils.clamp((1.25 - aspect) / 0.7, 0, 1) * THREE.MathUtils.smoothstep(t, 4.2, 4.4)
    if (tall > 0) {
      look.z += 170 * tall * THREE.MathUtils.smoothstep(t, 4.6, 4.9)
      pos.addScaledVector(k.a3.copy(pos).sub(look).normalize(), 420 * tall)
    }
    // Scene 6: the visitor takes the camera and orbits.
    applyOrbit(dt, v.orbit, pos, look)
    pos.y = Math.max(pos.y, heightAt(pos.x, pos.z) + 2.2)
    camera.position.copy(pos)
    window.__camera = camera // handy for testing
    camera.lookAt(look)
    // Then whatever the visitor adds by looking around.
    updateRig(dt, v.look)
    applyRig(camera)
    if (camera.near !== v.near) {
      camera.near = v.near
      camera.updateProjectionMatrix()
    }

    camera.updateMatrixWorld()
    projectHotspots(camera, size, t, v, journey)
    updateSound(v)

    // On tall phone screens the lens widens so the subject still fits.
    const widen = aspect < 1.25 ? Math.min(1.8, Math.pow(1.25 / aspect, 0.6)) : 1
    const fov = (2 * Math.atan(Math.tan((v.fov * DEG) / 2) * widen)) / DEG
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }
    atmos.uPx.value = (size.height * gl.getPixelRatio()) / (2 * Math.tan((fov * DEG) / 2))

    // One sun. Its compass direction is fixed; it only climbs.
    // (In the journey through time it wheels round the sky and comes back.)
    const el = (v.sunEl + v.sunLift) * DEG, az = (SUN.azimuthDeg + v.sunAz) * DEG
    atmos.uSunDir.value.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az))

    // Sky and light colours: dawn blending into golden morning.
    const d = v.day
    atmos.uZenith.value.lerpColors(dawn.zenith, day.zenith, d)
    atmos.uHorizon.value.lerpColors(dawn.horizon, day.horizon, d)
    atmos.uGlow.value.lerpColors(dawn.glow, day.glow, d)
    atmos.uSunColor.value.lerpColors(dawn.sun, day.sun, d)
    if (v.now > 0) {
      atmos.uZenith.value.lerp(now.zenith, v.now)
      atmos.uHorizon.value.lerp(now.horizon, v.now)
      atmos.uGlow.value.lerp(now.glow, v.now)
      atmos.uSunColor.value.lerp(now.sun, v.now)
    }
    atmos.uMist.value = v.mist
    atmos.uDust.value = v.dust

    // The cutaway, the lamps inside, and the centuries.
    atmos.uCutX.value = v.cut
    inner.uOpen.value = 1 - THREE.MathUtils.smoothstep(v.cut, 7.25, 9.5)
    inner.uLampAI.value = v.lamp
    inner.uLampA.value.copy(pos).addScaledVector(camera.getWorldDirection(fwd), 0.35)
    inner.uLampA.value.y -= 0.25
    atmos.uStrip.value = v.strip
    atmos.uSilt.value = v.silt
    atmos.uRiverShift.value = v.riverShift
    atmos.uCity.value = v.city
    atmos.uNow.value = v.now
    atmos.uWarp.value = v.warp

    // Haze takes the colour of the sky behind it, warmer towards the sun.
    camera.getWorldDirection(fwd)
    k.sunFlat.set(atmos.uSunDir.value.x, atmos.uSunDir.value.z).normalize()
    const flat = Math.hypot(fwd.x, fwd.z) || 1
    const toSun = Math.max((fwd.x * k.sunFlat.x + fwd.z * k.sunFlat.y) / flat, 0)
    atmos.uFogColor.value.copy(atmos.uHorizon.value).lerp(atmos.uGlow.value, Math.pow(toSun, 4) * 0.8)
    const fog = v.fog * (1 + 0.15 * v.now + 0.5 * v.warp)
    atmos.uFogDensity.value = fog
    scene.fog.color.copy(atmos.uFogColor.value)
    scene.fog.density = fog

    // Lights.
    sun.current.color.copy(atmos.uSunColor.value)
    sun.current.intensity = THREE.MathUtils.lerp(THREE.MathUtils.lerp(dawn.sunIntensity, day.sunIntensity, d), now.sunIntensity, v.now)
    hemi.current.intensity = THREE.MathUtils.lerp(THREE.MathUtils.lerp(dawn.ambient, day.ambient, d), now.ambient, v.now)
    hemi.current.color.copy(atmos.uZenith.value).lerp(k.a.set('#ffffff'), 0.45)

    // Sealed inside the pyramid there is no sun, so no shadows to redraw.
    gl.shadowMap.autoUpdate = v.inside < 0.999

    // Shadows follow what the camera looks at: wide for vistas, tight and
    // sharp when the camera is among the workers.
    focus.copy(look)
    focus.y = 0
    focus.clampLength(0, 520)
    const s = v.shadow
    sun.current.position.copy(focus).addScaledVector(atmos.uSunDir.value, 3200)
    sun.current.target.position.copy(focus)
    sun.current.target.updateMatrixWorld()
    const sc = sun.current.shadow.camera
    sc.left = -s; sc.right = s
    sc.top = s * 0.3 + 70; sc.bottom = -(s * 0.3 + 70)
    sc.near = 100; sc.far = 7000
    sc.updateProjectionMatrix()
    sun.current.shadow.normalBias = 1.7 * ((2 * s) / sun.current.shadow.mapSize.x)
  })

  return (
    <>
      <hemisphereLight ref={hemi} groundColor={TONES.fallow} />
      <directionalLight ref={sun} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0003} />
    </>
  )
}
