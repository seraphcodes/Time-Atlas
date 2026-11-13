// Usage: node tools/make-home-images.mjs <hero-source> <second-source>
// Writes web sizes (WebP + JPEG) into src/home/img. Run again with the real
// paintings and the page picks them up; nothing else changes.
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const [heroSrc, secondSrc] = process.argv.slice(2)
if (!heroSrc || !secondSrc) {
  console.error('Give two image paths: hero first, second page after.')
  process.exit(1)
}
const out = new URL('../src/home/img/', import.meta.url).pathname
mkdirSync(out, { recursive: true })

// Wide = desktop. Narrow = phones: a portrait crop, positioned on the focal point.
const jobs = [
  { src: heroSrc, name: 'hero', wide: 2400, narrow: 1100, focusX: 0.66 },
  { src: secondSrc, name: 'second', wide: 2400, narrow: 1100, focusX: 0.42 },
]
for (const j of jobs) {
  const meta = await sharp(j.src).metadata()
  const wide = sharp(j.src).resize({ width: j.wide, withoutEnlargement: true })
  await wide.clone().webp({ quality: 78 }).toFile(`${out}${j.name}-wide.webp`)
  await wide.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(`${out}${j.name}-wide.jpg`)
  // portrait 3:4 crop around the focal point
  const h = meta.height
  const w = Math.min(meta.width, Math.round(h * 0.75))
  const left = Math.max(0, Math.min(meta.width - w, Math.round(meta.width * j.focusX - w / 2)))
  const narrow = sharp(j.src).extract({ left, top: 0, width: w, height: h }).resize({ width: j.narrow, withoutEnlargement: true })
  await narrow.clone().webp({ quality: 76 }).toFile(`${out}${j.name}-narrow.webp`)
  await narrow.clone().jpeg({ quality: 78, mozjpeg: true }).toFile(`${out}${j.name}-narrow.jpg`)
  console.log(j.name, 'ok')
}
