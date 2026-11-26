# Handoff — Rome, AD 100

Branch `rome-100-ad`. Giza and the rest of the site are untouched apart from one new entry in `vite.config.js`.
Read with: `ROME-ROADMAP.md` (sessions), `HISTORY.md` (status of every landmark), `WORLD.md` (coordinates), `FACT-CHECK-ROME.md` (claims).

## Session 1 (Opus 5.5, 25 Nov 2026) — done
- Research: `HISTORY.md` with status, evidence level and sources for every landmark, plus the list of later buildings to keep out.
- World plan: `WORLD.md`; positions live in `src/rome/world/layout.js` only.
- New page `/experience/rome-100-ad/` (`experience/rome-100-ad/index.html`, `src/rome-main.jsx`, `src/rome/*`).
- Terrain: 14 hills, levelled Forum/Colosseum/Circus floors, the Tiber with the Tiber Island, distant Alban, Sabine and Prenestini hills (`world/terrain.js`, `world/Ground.jsx`).
- City fabric: about 12,000 instanced buildings in 23 districts (insulae, domus, horrea), streets, 2,000 trees; window/shop shader, no textures (`world/Fabric.jsx`).
- Monuments (massing, about 91k triangles, one draw call + gilded roof): Forum buildings, Capitol, imperial fora, Colosseum (80 bays, 3 orders, attic with 240 mast posts, cavea, arena), Meta Sudans, Colossus, Domus Aurea, Baths of Titus, Ludus Magnus, Temple of Claudius, Palatine palace, Circus Maximus with Trajan's scaffolding, Forum Boarium temples, Theatre of Marcellus, Porticus Octaviae, Tiber Island, six bridges, Porticus Aemilia, Theatre and Porticus of Pompey, Stadium, Pantheon placeholder, Baths of Agrippa and Nero, Saepta, Mausoleum of Augustus, Castra Praetoria, Aqua Claudia arches (`world/Landmarks.jsx`, generators in `world/geo.js`).
- Journey: aerial descent in four captions (`journey.js`, `content/rome.js`), then free exploration.
- Touch: one-finger orbit, pinch zoom, two-finger pan, tap a building (invisible pick boxes, `world/Picks.jsx`), double tap home, place chips, Replay. Mouse and keyboard too (`rig.js`).
- 19 markers with Documented / Inferred / Invented and status tags, sources on every card (`RomeOverlay.jsx`, `rome.css`). On phones the card is a bottom sheet and the camera frames the building above it.

## Tested
- `npm run build` passes. Headless Chrome (software GL) at 1280×720 and 390×844 touch: no console errors; tap opens the right card, chips fly, drag orbits.
- Layout generation: about 180 ms (fabric) + 230 ms (monuments) on a desktop CPU.
- Giza still loads with no errors.
- **Not tested on a real phone or GPU.** Please open the preview on your phone.

## Known limits / not done
- Forum and imperial fora are schematic (positions ±20 m, simplified buildings) → session 3.
- Colosseum: exterior in outline only; no statues in the arches, no velarium, no interior detail → session 2.
- No people yet (planned with the Forum and Colosseum).
- The page's first download includes three.js because the overlay imports the camera rig; split later if the phone load is slow.
- Rome is not yet linked from Explore, Timeline or the Rome destination page → session 4 (Sonnet).
- Pons Sublicius position is uncertain; Temple of Saturn and Castor orientations approximate.

## Session 2 (Opus 5.5, 25 Nov 2026) — done: the Colosseum
- New `src/rome/world/Colosseum.jsx` replaces the outline (about 84k triangles, built in about 0.25 s):
  80 arched bays × 3 storeys from extruded panels, Tuscan/Ionic/Corinthian half-columns with bases and capitals, entablatures,
  statues in the upper arches, number plates over 76 public arches, wider axial arches with porches,
  attic with pilasters, windows and gilded shields, 240 corbels and masts, corridors seen through the arches,
  podium, balustrade, three stepped tiers (marble, marble, wooden) with dividing walls and 112 vomitoria,
  crowning colonnade and roof, boxes at both ends of the short axis, sand arena,
  hypogeum (Domitian) in a dug-out pit (`terrain.js` PIT), travertine paving ring with 80 cippi, the colonnade to the Esquiline,
  9,000 spectators (3,500 on phones), awning that unrolls.
- Touch: card buttons "Look beneath the arena" (the sand fades, the hypogeum shows) and "Spread the awning" (`state.js`).
- Five new markers: arena and hypogeum, awning, emperor's entrance, gladiators' gates, emperor's box. New "Arena" place chip.
- While a card is open the picture slides away from it (camera view offset): up on phones, left on wide screens.
- Phones: places are one sideways-scrolling row.
- Colosseum axis set to 20° (see FACT-CHECK-ROME.md); FLATS widened round it.
- Tested in headless Chrome at 1280×720 and 390×844 touch, no errors. Still not tested on a real phone.

## Still open from the Colosseum
- Axis bearing to confirm against a survey plan (±10°).
- Interior: walk-through corridors and stairs are not modelled (seen only through arches).
- Hypogeum: one level and simplified; Domitian's two levels and the lift count are not modelled.

## Session 3 (Opus 5.5, 25 Nov 2026) — done: the Roman Forum
- Every Forum building re-placed from published coordinates (layout.js comment; FACT-CHECK-ROME.md). Forum centre F moved to (10, 7).
- New `src/rome/world/Forum.jsx` (about 29k triangles, 0.06 s): paved square with slab joints and 18 statues; Lacus Curtius with Marsyas;
  Basilica Julia and Aemilia with two arcaded storeys on all sides, clerestory naves, Aemilia's portico of shops; Curia with bronze doors;
  Rostra with ships' beaks; temples of Saturn (with the Golden Milestone), Vespasian, Concord, Divus Julius (with its platform), Castor
  (with the spring of Juturna), Vesta; Regia; House of the Vestals; Tabularium with arcades; arches of Augustus, Tiberius and Titus;
  1,800 people (700 on phones) in the square and up the Sacra Via.
- Temple generator now has bases, capitals, painted frieze, blue tympanum with sculpture, acroterion, doors.
- Imperial fora re-placed and their temples turned the right way (Caesar NW end facing SE; Augustus and Nerva NE end facing SW).
- Removed Diocletian's honorific columns (anachronism from session 1).
- Five new markers (Sacra Via street view, Basilica Aemilia, Rostra, Divus Julius, Lacus Curtius); "Street" place chip puts you at walking height.
- Tested desktop and phone (headless): no errors.

## Still open from the Forum
- The Palatine's Domus Tiberiana above the Forum is still a crude block → session 6.
- Comitium area, Basilica Aemilia's exact elevation and the Temple of Concord's form are simplified.
- Capitoline slopes are bare grass; add terrace walls and buildings with the Capitol in a later session.

## Session 4 (Sonnet 5.5, 25 Nov 2026) — done: "Rome, part 1" pages
- `src/site/places.js`: Rome is `open` with our own 3D still (`rome-open-s.webp`, `rome-open-thumb.webp`), facts, experience and page links. Explore, Timeline and the Home "Go and stand there" section follow from that; Timeline end text counts open places.
- New field guide `/destinations/rome/` (`destinations/rome/index.html`, `src/destination-rome-main.jsx`, `src/destination/RomePage.jsx`, `rome-page.js`): six stops, then/now (our still next to the Paris Orlando photo), 21-row evidence ledger, sources. Copy of the Giza page, not a shared component (left Giza untouched). Rollup input `romePage` in `vite.config.js`.
- Giza's "next place" cards (experience and field guide) now link to Rome; footer has a Rome field guide link; Home has an "Enter Rome" button.
- Credits: `romeSources` in `src/site/credits.js` (shown on About and the Rome page); NOTICE.md updated; About "how we check" text says Claridge/Coarelli were not read directly.
- Text pass on all Rome cards (plain English), Basilica Aemilia date corrected, Forum card lists a source we actually read. Table in FACT-CHECK-ROME.md.
- Tested (headless Chrome): build passes; Explore, Timeline, Rome page, About, Home on desktop and 390 px: no console errors, no sideways overflow; Giza and Rome experiences load without errors. Not tested on a real phone.

## Before going live (Sayed)
1. Open the preview on your phone: Rome experience (drag, pinch, tap, Street and Arena chips, awning/beneath buttons), Rome guide, Explore with Rome chosen.
2. Create branch, add the files, push, check the Vercel branch preview, then merge to main.
3. Rome's first load is heavy (three.js and the city). If it feels slow on your phone, tell me and session 9 will split it.

## Session 5 (Opus 5.5, 25 Nov 2026) — done: Everyday Rome, a street in the Subura
- `src/rome/world/Street.jsx` (new): about 220 m of street on the line of the Argiletum, from the firewall of the Forum of Augustus towards the Clivus Suburanus. Apartment blocks of 4–5 storeys (under 18 m), shops with thresholds, mezzanine windows and shutters, porticoes with roof terraces, wooden balconies, laundry, a bakery (3 lava mills, donkey, domed oven, loaves), a food bar (counter with jars), a street fountain, a crossroads shrine, a side lane, a litter with bearers, a mule, about 340 people (170 on phones). A gate in the firewall closes the view. Basalt paving with a polygon shader. ~48k triangles, built in ~100 ms.
- Street-level walking (`rig.js`, `walk`): views with `view.walk = { pts, s, off }` put the eye 1.65 m above the street. Drag looks around (scene follows the finger), pinch/scroll/arrow keys walk along the line, double tap flies back up. Director lets the camera go down to 1.2 m only in walk mode, sharpens shadows around the visitor, and labels only places within 240 m.
- The "Street" chip is now "Sacra Via" and uses walking (line moved in front of the Basilica Aemilia portico, which the old line ran under). New chip "Subura".
- Seven new cards: the street, an apartment block, a food bar, a bakery, a street fountain, a crossroads shrine, the firewall. Sources in FACT-CHECK-ROME.md.
- Layout: `STREET`, `streetPoint`, `suburaWalk`, `CLEARINGS` (Fabric leaves the street area empty), a levelled floor in terrain.js.
- Rome field guide, Explore blurb, sources and ledger updated.
- Tested (headless Chrome): desktop and 390 px phone, every card's view, no console errors; Giza still loads. Not tested on a real phone: check that drag-to-look and pinch-to-walk feel right.

## Still open from the street
- People are simple figures (same as the Forum); children, animals and carried goods are few.
- The insides of shops are dim in shadow; no interiors above the ground floor.
- Walking is only along the line of the street (no side lane, no free walking): free movement is session 8.

## Session 6 (Opus 5.5, 25 Nov 2026) — done: the palace, the Circus Maximus, the baths
- `src/rome/world/Palatine.jsx` (new): Domitian's palace laid out to the excavated plan in the palace frame. Domus Flavia (porch, throne hall with apse, basilica, lararium, peristyle with pool and octagonal labyrinth, banquet hall with two oval fountains), Domus Augustana (upper peristyle with island shrine, lower peristyle with four-crescent fountain, curved façade towards the Circus), the garden stadium (160 × 48, two-storey portico, cypresses, fountains, emperor's box), Domus Tiberiana on three tiers of arches above the Forum, terraces and arched substructures on the Circus side. ~27k triangles.
- `src/rome/world/Circus.jsx` (new, replaces `circus()` in Landmarks): stepped seats, two storeys of shop arcades plus attic, starting gates with towers, the barrier (basins, obelisk, turning posts, eggs and dolphins, shrines, statues), the gods' box, the triple Arch of Titus with the seats opened for it, Trajan's works on the Palatine side (unfinished upper seats, scaffolding, two treadwheel cranes, blocks), ~360 people (160 phones). ~33k triangles.
- Landmarks: the old palace blocks and the giant plinth under them are gone (Magna Mater and Apollo stay); Baths of Titus rebuilt (platform and arches, vaulted halls, two exercise courts, the stair down to the Colosseum square with a portico); Golden House wing given its portico, open court and domed octagonal hall.
- Cards: palace (now the Domus Flavia, with a courtyard walk), the emperor's house, the palace stadium (walk), Circus (updated), on the track (walk), the obelisk, the Arch of Titus in the Circus, the gods' box, the Baths of Titus, the Golden House. Chips: Palace, Track.
- Simplifications disclosed on cards: the sunken lower court and the sunken stadium stand at the hilltop level, because our Palatine is a flat plateau.
- Skyline: the palace and Circus now dominate the south; no separate skyline work beyond that.
- Tested (headless Chrome): desktop and 390 px phone, every new view, no console errors.

## Still open
- The Palatine hill in our terrain is too flat and its south edge too far from the Circus; a terrain pass would let the sunken courts and the stadium sit at their true depth.
- The Circus seats look smooth from track level; races, horses and crowds on race day are not shown.
- Interiors of the halls are not modelled.

## Session 7 (Opus 5.5, 25 Nov 2026) — done: inside the Colosseum (milestone 2)
- Hypogeum: 28 lift frames with capstans along the curved corridor, as documented for the Flavian period.
- "Who sits where": a colour layer over the tiers (gold senators, red knights, blue citizens, green women and the poor), switched from its card (`state.seating`, `SEAT_CLASSES` in Colosseum.jsx).
- "A day at the games" (`ColosseumGames.jsx`): two scenes switched from the card (`state.hunt`, `state.fight`, never both). Morning: trees and rocks, two lions, a bear, a bull, two deer circling, six hunters. Afternoon: four gladiator pairs (thraex–murmillo ×2, retiarius–secutor, hoplomachus–murmillo) each with a referee, turning slowly; musicians (water organ, two horns, a trumpet). No blood; executions only described. Animation stops with reduced motion.
- Two street-level views with new rig options `walk.y` (fixed eye height) and `walk.loop` (closed line): "Take a seat" (front row of the middle tier, walk round the whole ring; crowd left out of rows 0–2 there) and "Stand on the sand" (along the long axis).
- Cards: Who sits where, A day at the games, Take a seat, Stand on the sand; arena card updated (28 lifts, Severan 60 later). Chips: Seats, Games.
- Tested (headless Chrome): desktop and 390 px phone, both scenes, colours and both views; no console errors.

## Still open
- The crowd is about 9,000 figures (3,500 on phones) for 50,000 people; seen from the seats it is thin.
- Gladiator figures are blocky; no fights are animated beyond slow circling.
- Arena floor trapdoors are not drawn; the hypogeum is still simplified.

## Session 8 (Opus 5.5, 25 Nov 2026) — done: then and now, free walking
- **Then/Now switch.** When exploring, the date in the top corner is a two-way switch, AD 100 / Today (`state.now`, `?today` in the URL opens on it). The camera stays where it is; an open card turns into its counterpart (`pair`) or closes.
- **How "today" is drawn** (`world/era.js`): the AD 100 monuments become a faint outline (an outline-weighted ghost shader, so layers of walls do not fog the view); crowds, gold, awning and games are hidden. What survives is solid in weathered stone, what was built later in blue-grey.
- **Colosseum today** (`Colosseum.jsx`): the same geometry cut in the shader (south outer rings gone, south inner rings cut at about 21 m), with its own shadow pass; Stern's and Valadier's buttresses; sand hidden, hypogeum open; a modern floor over the east end.
- **Forum and beyond** (`world/Today.jsx`, about 10k triangles, built the first time Today is switched on): Saturn (8 columns), Vespasian (3), Castor (3), Curia, Vesta, Arch of Titus, the basilica floors and stumps, cores of Concord, Divus Julius, Rostra; the Tabularium with the Palazzo Senatorio; later buildings: Arch of Septimius Severus, Column of Phocas, Antoninus and Faustina, Basilica of Maxentius, Venus and Roma, Arch of Constantine, Hadrian's Pantheon, Via dei Fori Imperiali, the Vittoriano; the Circus as a park.
- **The city today** (`Fabric.jsx`, `layout.js` `inPark`): no houses inside the archaeological park; outside it the same blocks in grey stand in for the modern city (Invented, said on the cards).
- **19 today cards** (`NOW_MARKERS` in `content/rome.js`, `era: 'now'`), their own place buttons, tags "A ruin today / Standing today / Built after AD 100". Markers and tap targets follow the era.
- **Free walking** (`rig.js` `walkHere`, `flyUp`; `world/obstacles.js`): "Walk here" puts you at eye level where you are looking. Drag to look; pinch, scroll or arrow keys walk the way you face; tap the ground to walk there (a ring marks the spot). Houses of the fabric and of the Subura street stop you and you slide along them; the river stops you; monuments let you through (said in the hint). "Fly up" rises over the same spot. The near plane comes in to 0.5 m at street level.
- Field guide: new stop "Then and now", "Your turn" updated, five ledger rows. Credits: one line of today sources. HISTORY.md and FACT-CHECK-ROME.md: session 8 tables.
- Tested (headless Chrome, software GL): 1280×720 and 390×844 touch; switch both ways with a card open; walking in the Subura (stopped by a house front), the Forum then and today; no console errors. Frame rate unchanged in the headless test (not meaningful for a real GPU).

## Still open after session 8
- **Not yet on a real phone.** The ghost layer adds transparent overdraw in "today"; check the frame rate on your phone first.
- The Palatine's ruins are not modelled (outline only, said on its card); the Theatre of Marcellus, the Pantheon's piazza and other survivors outside the centre are outlines only.
- The terrain is AD 100 ground: the Velia, removed in 1932, is still there under the road (said on the card).
- Ruin outlines are simplified; the Colosseum's break line is a smooth cut.
- Walking passes through monuments; the crowd does not move out of your way.

## Next session (9): Sonnet 5.5, then an Opus audit
Polish, phone performance pass, accessibility, share image, final fact-check, release checklist (milestone 3). Sayed switches the model first.

## (Old plan for session 3, kept for reference)
1. Survey plan of the Forum (Digitales Forum Romanum, Coarelli) and re-place every building in `layout.js` within a few metres.
2. Full buildings: Basilica Julia and Aemilia (arcades, tabernae), Curia with bronze doors, Rostra with ship rams, temples of Saturn, Castor, Divus Julius, Vespasian, Concord, Vesta, the Regia, House of the Vestals; Sacra Via paving; honorific columns and statues; Lacus Curtius, Umbilicus, Miliarium Aureum.
3. Equus Domitiani: show only the empty base under the paving or nothing (it was destroyed in 96).
4. People in the Forum, walking-height viewpoint.
5. Markers and fact-check for every new item; phone test.

## (Old plan for session 2, kept for reference)
1. Survey plan: real axis bearing and position from a published plan; correct `layout.js`.
2. Exterior: Tuscan, Ionic, Corinthian half-columns and entablatures, statues in the upper arches (coin evidence, label Inferred), attic pilasters and windows, the 240 mast corbels, numbered entrances, the four axial gates.
3. Arena and cavea: podium, maeniana, vomitoria, the imperial box; the velarium (Inferred).
4. Approach: travertine paving ring with bollards (cippi), Meta Sudans, crowds.
5. Touch: walking-height viewpoint around the building; three more markers (gates, velarium, hypogeum, the last labelled as below ground).
6. Fact-check additions to `FACT-CHECK-ROME.md`, phone test, `HANDOFF.md`.
