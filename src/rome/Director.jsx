// Runs once per frame: moves the journey on, places the camera, keeps one
// Mediterranean morning sun, sky and haze, and works out where the markers are.
import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { atmos } from '../design/glsl'
import { advance, cameraAt, journey, ORBIT_FROM } from './journey'
import { attachRig, applyOrbit, picking, framing, walk } from './rig'
import { groundAt, heightAt } from './world/terrain'
import { MARKERS } from './content/rome'
import { PLACES } from './world/layout'
import { getState } from './state'

const DEG = Math.PI / 180
const SKY = {
  early: { zenith: '#3A6496', horizon: '#C9C3B4', glow: '#EFCB98', sun: '#FFD9AA', sunI: 2.9, amb: 0.9 },
  day: { zenith: '#4A7CB3', horizon: '#CDD0CB', glow: '#F1DDB6', sun: '#FFEDD2', sunI: 3.3, amb: 1.05 },
}
const SUN_AZ = 38 // degrees south of east: a late-morning sun over the Alban Hills

// Marker world positions, worked out once.
export const markerPos = MARKERS.map((m) => {
  const [x, z] = PLACES[m.place].at
  return new THREE.Vector3(x, heightAt(x, z) + m.y, z)
})

const v3 = new THREE.Vector3()
const fwd = new THREE.Vector3()
const WHITE = new THREE.Color('#ffffff')
const JOURNEY_MARKERS = new Set(['colosseum', 'forum', 'capitolium', 'palace'])

function projectMarkers(camera, size, t, orbiting) {
  camera.getWorldDirection(fwd)
  const now = getState().now
  MARKERS.forEach((m, i) => {
    const slot = journey.hot[i] || (journey.hot[i] = { x: 0, y: 0, on: false, wanted: false })
    if ((m.era === 'now') !== now) {
      slot.on = slot.wanted = false
      return
    }
    const dist = camera.position.distanceTo(markerPos[i])
    // standing in a street, only what is near (or the street's own places) is labelled
    const wanted = orbiting ? dist < (walk.path ? Math.min(m.range, 240) : m.range) : JOURNEY_MARKERS.has(m.id) && t > 2.95 && t < ORBIT_FROM + 0.05
    slot.wanted = orbiting || wanted
    if (!wanted) {
      slot.on = false
      return
    }
    v3.copy(markerPos[i]).sub(camera.position)
    const ahead = v3.dot(fwd) > 1
    v3.copy(markerPos[i]).project(camera)
    slot.x = ((v3.x + 1) / 2) * size.width
    slot.y = ((1 - v3.y) / 2) * size.height
    slot.on = ahead && v3.x > -0.95 && v3.x < 0.95 && v3.y > -0.85 && v3.y < 0.8
    slot.d = dist
  })
}

export function Director() {
  const { camera, scene, gl, size } = useThree()
  const sun = useRef()
  const hemi = useRef()
  const k = useMemo(() => ({ pos: new THREE.Vector3(), look: new THREE.Vector3(), focus: new THREE.Vector3(), sunFlat: new THREE.Vector2() }), [])
  const pal = useMemo(() => {
    const c = (o) => Object.fromEntries(Object.entries(o).map(([n, v]) => [n, typeof v === 'string' ? new THREE.Color(v) : v]))
    return { early: c(SKY.early), day: c(SKY.day) }
  }, [])

  useLayoutEffect(() => {
    scene.fog = new THREE.FogExp2('#D7BFA0', 0.00015)
    gl.toneMappingExposure = 1.08
    camera.near = 2
    camera.far = 60000
    camera.updateProjectionMatrix()
    scene.add(sun.current.target)
    picking.camera = camera
    return attachRig()
  }, [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    advance(dt)
    atmos.uTime.value += dt
    const { t, v } = journey
    const { pos, look, focus } = k

    cameraAt(t, pos, look)
    // On a tall phone screen the camera stands a little further back.
    const aspect = size.width / size.height
    if (aspect < 1) pos.addScaledVector(v3.copy(pos).sub(look).normalize(), 160 * (1 - aspect))
    applyOrbit(dt, v.orbit, pos, look)
    // never below the roofs, except when standing in a street
    pos.y = Math.max(pos.y, groundAt(pos.x, pos.z) + (walk.path ? 1.2 : 8))
    camera.position.copy(pos)
    camera.lookAt(look)
    const widen = aspect < 1.2 ? Math.min(1.7, Math.pow(1.2 / aspect, 0.55)) : 1
    const fov = (2 * Math.atan(Math.tan((v.fov * DEG) / 2) * widen)) / DEG
    // at street level a wall can be a metre away: bring the near plane in
    const near = walk.path && pos.y - groundAt(pos.x, pos.z) < 6 ? 0.5 : 2
    if (Math.abs(camera.fov - fov) > 0.01 || camera.near !== near) {
      camera.fov = fov
      camera.near = near
      camera.updateProjectionMatrix()
    }
    // Slide the picture away from an open card.
    const ease = 1 - Math.exp(-4 * dt)
    framing.x += (framing.wantX - framing.x) * ease
    framing.y += (framing.wantY - framing.y) * ease
    if (Math.abs(framing.x) > 0.001 || Math.abs(framing.y) > 0.001) {
      camera.setViewOffset(size.width, size.height, size.width * framing.x, size.height * framing.y, size.width, size.height)
    } else if (camera.view?.enabled) camera.clearViewOffset()
    camera.updateMatrixWorld()
    projectMarkers(camera, size, t, v.orbit > 0.5)
    window.__camera = camera

    // Sun, sky and haze.
    const el = v.sunEl * DEG, az = SUN_AZ * DEG
    atmos.uSunDir.value.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az))
    const d = v.day
    atmos.uZenith.value.lerpColors(pal.early.zenith, pal.day.zenith, d)
    atmos.uHorizon.value.lerpColors(pal.early.horizon, pal.day.horizon, d)
    atmos.uGlow.value.lerpColors(pal.early.glow, pal.day.glow, d)
    atmos.uSunColor.value.lerpColors(pal.early.sun, pal.day.sun, d)
    camera.getWorldDirection(fwd)
    k.sunFlat.set(atmos.uSunDir.value.x, atmos.uSunDir.value.z).normalize()
    const flat = Math.hypot(fwd.x, fwd.z) || 1
    const toSun = Math.max((fwd.x * k.sunFlat.x + fwd.z * k.sunFlat.y) / flat, 0)
    atmos.uFogColor.value.copy(atmos.uHorizon.value).lerp(atmos.uGlow.value, Math.pow(toSun, 4) * 0.7)
    // Less haze when close to the ground, so the streets stay crisp.
    const fog = v.fog * THREE.MathUtils.lerp(0.75, 1, THREE.MathUtils.smoothstep(pos.y, 80, 700))
    atmos.uFogDensity.value = fog
    scene.fog.color.copy(atmos.uFogColor.value)
    scene.fog.density = fog

    sun.current.color.copy(atmos.uSunColor.value)
    sun.current.intensity = THREE.MathUtils.lerp(pal.early.sunI, pal.day.sunI, d)
    hemi.current.intensity = THREE.MathUtils.lerp(pal.early.amb, pal.day.amb, d)
    hemi.current.color.copy(atmos.uZenith.value).lerp(WHITE, 0.5)

    // Shadows follow what the camera looks at: wide from high up, sharp near the ground.
    focus.copy(look)
    const height = Math.max(40, pos.y - groundAt(pos.x, pos.z))
    let s = THREE.MathUtils.clamp(height * 1.6, 160, 1500)
    if (walk.path && pos.y - groundAt(pos.x, pos.z) < 6) {
      // in the street: sharp shadows round the visitor
      focus.lerpVectors(pos, look, 0.5)
      s = 70
    }
    focus.y = 0
    sun.current.position.copy(focus).addScaledVector(atmos.uSunDir.value, 3000)
    sun.current.target.position.copy(focus)
    sun.current.target.updateMatrixWorld()
    const sc = sun.current.shadow.camera
    sc.left = -s; sc.right = s; sc.top = s; sc.bottom = -s
    sc.near = 100; sc.far = 6500
    sc.updateProjectionMatrix()
    sun.current.shadow.normalBias = 1.5 * ((2 * s) / sun.current.shadow.mapSize.x)
  })

  return (
    <>
      <hemisphereLight ref={hemi} groundColor="#9C8A6C" />
      <directionalLight ref={sun} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} />
    </>
  )
}
