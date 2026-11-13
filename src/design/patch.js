// Adds small pieces of shader code to a standard three.js material, so custom
// surfaces keep the shared lighting, shadows and fog.
let patchId = 0

export function patchStandard(material, { uniforms = {}, vertexPars = '', vertexMain = '', fragmentPars = '', fragmentColor = '', fragmentNormal = '' }) {
  const id = `timeatlas-${patchId++}`
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vWPos;
varying vec3 vNrmW;
${vertexPars}`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
vNrmW = normal;
${vertexMain}
{
  vec4 wp_ = vec4(transformed, 1.0);
  #ifdef USE_INSTANCING
    wp_ = instanceMatrix * wp_;
  #endif
  vWPos = (modelMatrix * wp_).xyz;
}`,
      )
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vWPos;
varying vec3 vNrmW;
${fragmentPars}`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
${fragmentColor}`,
      )
      .replace(
        '#include <normal_fragment_maps>',
        `#include <normal_fragment_maps>
${fragmentNormal}`,
      )
  }
  material.customProgramCacheKey = () => id
  return material
}
