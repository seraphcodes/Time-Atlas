// Sound, made on the spot with the browser's audio engine: no audio files.
// Wind over the desert, a low hum and the odd crackle inside the pyramid, and
// a rising rush while the centuries pass. It is off until the visitor asks.
let ctx = null
let master, windGain, windFilter, droneGain, rushGain, crackleGain
let wanted = false
let noise, analyser

function makeNoise(c) {
  const length = c.sampleRate * 4
  const buffer = c.createBuffer(1, length, c.sampleRate)
  const data = buffer.getChannelData(0)
  // Brown-ish noise: softer and lower than white, closer to wind.
  let last = 0
  for (let i = 0; i < length; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02
    data[i] = last
  }
  // Bring it to a known loudness (RMS 0.3), so the levels below mean something.
  let sum = 0
  for (let i = 0; i < length; i++) sum += data[i] * data[i]
  const k = 0.3 / Math.sqrt(sum / length)
  for (let i = 0; i < length; i++) data[i] *= k
  return buffer
}
const looped = (c, buffer) => {
  const s = c.createBufferSource()
  s.buffer = buffer
  s.loop = true
  s.start()
  return s
}

function build() {
  const Ctx = window.AudioContext || window.webkitAudioContext
  if (!Ctx) return false
  ctx = new Ctx()
  noise = makeNoise(ctx)
  master = ctx.createGain()
  master.gain.value = 0
  // A gentle limiter, so loud moments never clip the speakers.
  const limiter = ctx.createDynamicsCompressor()
  limiter.threshold.value = -10
  limiter.ratio.value = 8
  master.connect(limiter).connect(ctx.destination)
  analyser = ctx.createAnalyser()
  limiter.connect(analyser)
  if (typeof window !== 'undefined') window.__audio = { ctx, analyser }

  // Wind: noise through a slowly wandering band-pass filter.
  windFilter = ctx.createBiquadFilter()
  windFilter.type = 'bandpass'
  windFilter.frequency.value = 500
  windFilter.Q.value = 0.8
  windGain = ctx.createGain()
  windGain.gain.value = 0
  looped(ctx, noise).connect(windFilter).connect(windGain).connect(master)
  const lfo = ctx.createOscillator()
  const lfoDepth = ctx.createGain()
  lfo.frequency.value = 0.09
  lfoDepth.gain.value = 220
  lfo.connect(lfoDepth).connect(windFilter.frequency)
  lfo.start()

  // Inside the stone: two low tones a fifth apart, with a slow tremor.
  droneGain = ctx.createGain()
  droneGain.gain.value = 0
  // The upper tones matter: laptop and phone speakers cannot play 55 Hz.
  for (const [f, a] of [[55, 0.5], [82.5, 0.4], [110, 0.5], [165, 0.35], [220, 0.2]]) {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.value = f
    g.gain.value = a
    o.connect(g).connect(droneGain)
    o.start()
  }
  const trem = ctx.createOscillator()
  const tremDepth = ctx.createGain()
  trem.frequency.value = 0.21
  tremDepth.gain.value = 0.05
  trem.connect(tremDepth).connect(droneGain.gain)
  trem.start()
  droneGain.connect(master)

  // Time passing: a high, airy rush.
  const rushFilter = ctx.createBiquadFilter()
  rushFilter.type = 'highpass'
  rushFilter.frequency.value = 1200
  rushGain = ctx.createGain()
  rushGain.gain.value = 0
  looped(ctx, noise).connect(rushFilter).connect(rushGain).connect(master)

  // The lamp: soft clicks and pops.
  const crackleFilter = ctx.createBiquadFilter()
  crackleFilter.type = 'highpass'
  crackleFilter.frequency.value = 2500
  crackleGain = ctx.createGain()
  crackleGain.gain.value = 0
  looped(ctx, noise).connect(crackleFilter).connect(crackleGain).connect(master)

  document.addEventListener('visibilitychange', () => {
    if (!ctx) return
    if (document.hidden) ctx.suspend()
    else if (wanted) ctx.resume()
  })
  return true
}

// A soft two-note chime when sound is switched on, so you know it is working
// even before the scene has much to say.
function chime() {
  const t0 = ctx.currentTime + 0.05
  ;[[392, 0], [587, 0.16]].forEach(([f, d]) => {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.value = f
    g.gain.setValueAtTime(0.0001, t0 + d)
    g.gain.exponentialRampToValueAtTime(0.35, t0 + d + 0.03)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + d + 1.1)
    o.connect(g).connect(master)
    o.start(t0 + d)
    o.stop(t0 + d + 1.2)
  })
}

export const soundSupported = typeof window !== 'undefined' && !!(window.AudioContext || window.webkitAudioContext)

export function setSound(on) {
  wanted = on
  if (on && !ctx && !build()) return false
  if (!ctx) return false
  if (on) ctx.resume()
  master.gain.setTargetAtTime(on ? 1 : 0, ctx.currentTime, 0.25)
  if (on) chime()
  return true
}

// Called every frame with the journey's values.
export function updateSound(v) {
  if (!ctx || !wanted || ctx.state !== 'running') return
  const now = ctx.currentTime
  const inside = v.inside ?? 0
  const warp = v.warp ?? 0
  windGain.gain.setTargetAtTime(0.5 * (1 - inside) * (1 + 0.6 * warp), now, 0.4)
  windFilter.frequency.setTargetAtTime(380 + 420 * warp, now, 0.5)
  droneGain.gain.setTargetAtTime(0.28 * inside, now, 0.5)
  rushGain.gain.setTargetAtTime(0.25 * warp, now, 0.3)
  // A crackle now and then, only in the dark.
  if (inside > 0.5 && Math.random() < 0.025) {
    const peak = 0.25 + Math.random() * 0.35
    crackleGain.gain.cancelScheduledValues(now)
    crackleGain.gain.setValueAtTime(peak, now)
    crackleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07)
  }
}
