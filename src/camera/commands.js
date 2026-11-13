// The buttons and markers ask the camera for things here. The camera code
// (rig.js, which carries three.js) picks the requests up on its next frame,
// so the interface itself never has to load the 3D library.
export const commands = { queue: [] }
export const flyTo = (view) => commands.queue.push({ kind: 'fly', view })
export const orbitHome = () => commands.queue.push({ kind: 'home' })
export const orbitZoom = (factor) => commands.queue.push({ kind: 'zoom', factor })
