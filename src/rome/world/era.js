// Then and now (session 8). In "today" mode every AD 100 building is drawn as
// a faint ghost; what survives is drawn solid in weathered stone; what was
// built after AD 100 is drawn in blue-grey. See Today.jsx and HISTORY.md.
import { useSyncExternalStore } from 'react'
import * as THREE from 'three'
import { getState, subscribeState } from '../state'

// The ghost is brighter where a surface turns away from the eye (its outline)
// and faint where it faces you, so layers of walls do not fog the view.
export const GHOST = new THREE.ShaderMaterial({
  uniforms: { uColor: { value: new THREE.Color('#F8F4EC') }, uOpacity: { value: 0.07 } },
  vertexShader: `varying vec3 vN; varying vec3 vV;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vN = normalize(normalMatrix * normal);
      vV = -mv.xyz;
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: `uniform vec3 uColor; uniform float uOpacity; varying vec3 vN; varying vec3 vV;
    void main() {
      float d = length(vV);
      float f = 1.0 - abs(dot(normalize(vN), vV / d));
      float a = uOpacity * (0.25 + 2.2 * f * f * f) * smoothstep(1.0, 10.0, d);
      gl_FragColor = vec4(uColor, min(a, 0.35));
    }`,
  transparent: true,
  depthWrite: false,
  side: THREE.DoubleSide,
})
export const T = {
  ruin: '#C8B08C', // travertine and tuff, weathered
  ruinDark: '#B09676', // concrete cores of podiums
  marble: '#E2D9C6', // surviving marble
  brick: '#A9735A', // brick-faced concrete
  later: '#A6B8CA', // built after AD 100
  laterDark: '#8CA0B4',
  laterLight: '#C9D5E0', // later, white marble (the Vittoriano)
  road: '#4C4D50',
  grass: '#7F9563',
  wood: '#8C6A4A',
  water: '#6A8C98',
  paving: '#E4DCCB',
}

GHOST.polygonOffset = true // drawn just behind a ruin that shares its surface
GHOST.polygonOffsetFactor = 1
GHOST.polygonOffsetUnits = 4

// true while the visitor is looking at Rome today
export const useNow = () => useSyncExternalStore(subscribeState, () => getState().now)
