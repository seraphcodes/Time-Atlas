# TimeAtlas: Rome, AD 100 — world plan

## Frame
- 1 unit = 1 metre. x = east, y = up, z = south (same as Giza).
- Origin: the centre of the Roman Forum square (about 41.8924° N, 12.4853° E).
- Positions come from modern coordinates: dx = Δlon × 82,870 m, dz = −Δlat × 111,000 m. Accurate to about 20 m, enough for the city scale; the Forum and Colosseum get surveyed plans in sessions 2–3.
- Heights are relative to the Forum floor (about 12 m above sea level in antiquity). Hills: Palatine +38, Capitoline +36, Aventine +33, Caelian +36, Esquiline/Oppian +42, Viminal +44, Quirinal +46, Velia +16 (before Hadrian flattened it), Janiculum +70. Tiber water −7.

The single source of truth for positions is `src/rome/world/layout.js`.

## Districts
| District | Character in AD 100 | Built as |
|---|---|---|
| Forum valley | Monuments, basilicas, temples | Deliberate buildings |
| Imperial fora | Walled squares with temples | Deliberate (massing in session 1) |
| Subura (between Esquiline and Viminal) | Dense insulae, shops, noise | Instanced insulae, 4–5 storeys, narrow streets |
| Velia / Colosseum valley | Colosseum, Meta Sudans, Domus Aurea vestibule, Ludus | Deliberate |
| Palatine | Imperial palace | Deliberate massing |
| Circus valley | Circus Maximus | Deliberate |
| Aventine, Caelian | Wealthier houses with gardens, some insulae | Instanced domus and insulae, lower, trees |
| Esquiline east | Gardens (horti) | Trees, scattered villas |
| Campus Martius | Theatres, porticoes, temples, a few insulae | Deliberate massing plus fabric |
| Trastevere (across the Tiber) | Working district, warehouses | Instanced, lower |
| Capitoline–Quirinal saddle | Still a ridge in AD 100 | Terrain, not Trajan's Forum |

## Level of detail
- Near and important: deliberate geometry (Colosseum, Forum buildings).
- Middle: generated temples, basilicas, colonnades from shared generators (`world/arch.js`).
- Far: one instanced mesh for walls, one for roofs, wall shader draws windows and shop fronts from world position (no textures).
- Phone tier: fewer fabric instances, no post-processing, lower pixel ratio.

## Journey (session 1)
Guided scroll in four moments: high above the city at morning → over the Tiber towards the centre → descending past the Capitol → standing above the Forum with the Colosseum ahead. Then free exploration: drag to orbit, pinch to zoom, tap a landmark to fly there and read about it, double tap or "Overview" to return.
