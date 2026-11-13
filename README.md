# TimeAtlas: Giza, c. 2560 BC

A scroll-driven 3D journey to the Giza plateau while the Great Pyramid is being built.
This is **Phases 1 and 2** of the scope sheet: the shared design system, the world, and scenes 1 to 5.

## Run it

```bash
npm install
npm run dev      # local development, http://localhost:5173
npm run build    # production build into dist/
npm run preview  # serve the production build
```

Deploy on Vercel as a Vite project (build command `npm run build`, output folder `dist`).

## What is in it

| Scene | What happens |
| --- | --- |
| 1. Dawn over the Nile | Sunrise along the harbour canal, then a rising turn across fields, villages and the river to the plateau |
| 2. The building site | Fly in to the half-built pyramid, then follow a hauling team up the last stretch of ramp onto the working platform |
| 3. Stone and sunlight | A time-lapse of the remaining years (c. 2570 to 2560 BC): courses rise, casing follows, the ramp comes down, queens' pyramids, temple and causeway appear |
| 4. Inside the pyramid | The pyramid is cut open along the plane of its passages. Fly in at the foot of the Grand Gallery, climb it, stoop into the King's Chamber and look around by dragging |
| 5. Forty-six centuries | One continuous shot from the western desert while time runs to today: Khafre's and Menkaure's pyramids rise, the harbour silts up, the Nile shifts east, the casing is carried off, Cairo fills the valley. At the end a slider lets the visitor drag the date between 2560 BC and today |
| 6. Your turn | The camera is handed over. Drag (or use arrow keys) to orbit the plateau, scroll wheel / pinch / + and − to zoom, drag the slider to change the century, open a marker to read about a place. "Back to the journey" returns to scene 5. A card announces Rome (c. 100 AD) as the next, planned, destination |

## Phase 3: exploring

- **Orbit camera** (`camera/rig.js`): spherical orbit around the plateau with limits (not under the ground, not inside the pyramids, not out into empty desert). Touch: one finger orbits, two fingers pinch. Buttons for zoom and reset exist for people who cannot do either.
- **Hotspots** (`content/hotspots.js`): eight markers. Seven appear during the journey (in the scene where they belong) and all eight in scene 6, where choosing one also sets the date and flies there. Each card carries sources. Edit the text and positions in that one file.
- **Rod**: the I–VI marks on the right jump to a scene.
- **Sound** (`audio/sound.js`): off by default (a soft chime confirms it is on), built from synthesised noise and tones (wind, a low drone inside, a rush while time moves, lamp crackle). No audio files.
- **Reduced motion** (`design/calm.js`): with the system setting on, scrolling follows the scroll bar closely, and the sun wheel, time-wind, flame flicker, camera drift and inertia are switched off.
- **Loading**: the 3D world is a separate download (`Scene.jsx`); a loading screen shows until real frames are drawn. If WebGL is missing or the world crashes, the page falls back to the story as plain text.
- **Keyboard and screen readers**: markers, slider, rod and buttons are real controls with labels; captions are announced as the journey moves.


## Where things live

```text
src/
  design/      the design system: tokens.js (palette, sizes, sun), materials.js,
               glsl.js (shared sky, haze, noise), patch.js
  journey/     journey.js: the scroll position and every value that changes with it
  camera/      cameraPath.js (the route), rig.js (what the visitor adds: looking around),
               Director.jsx (camera, sun, sky, shadows), Post.jsx (glow, grain, vignette)
  world/       Terrain, Sky, Nile, Pyramid, ConstructionSite, Environment, rampPath,
               interiorPlan.js + Interior.jsx (passages, chambers, cut face), TimeWind, City
  content/     giza.js: all on-screen words and their sources
  ui/          Overlay.jsx: title, captions, year, progress rod
  styles/      global.css: type and interface
```

## The three files you will tune most

- `src/design/tokens.js`: the seven palette colours, sky colours, sun direction, scroll feel.
- `src/camera/cameraPath.js`: where the camera stands and looks at each moment.
- `src/journey/journey.js`: the tracks (sun height, haze, build height, year) keyed to the journey.

## How the two big ideas of Phase 2 work

- **Rail and rig.** The rail (`cameraPath.js`) decides where the camera stands and faces. The rig (`rig.js`)
  layers the visitor's input on top: a slight drift with the pointer everywhere, and free looking where the
  `look` track in `journey.js` is 1. Phase 3 adds free orbiting to the same rig.
- **One `era` value.** Everything that changes over the centuries is derived from `era` (0 = 2560 BC, 1 = today)
  in `setEra()` in `journey.js`. The Then/Now slider (`EraSlider` in `ui/Overlay.jsx`) only sets `journey.manualEra`;
  scrolling away hands the date back to the journey.
- **The interior is one list.** `interiorPlan.js` lists every passage and chamber once. The 3D rooms and the
  shader that cuts them out of the stone are both generated from it.

## Quality levels

Quality is a ladder in `Scene.jsx`: everything on, then no post-processing (`Post.jsx`), then lower resolution
in steps. A device that drops frames climbs down, one with power to spare climbs back up, each change waits
five seconds, and after three swings it settles one step lower for good. Phones start without post-processing.

## Testing aids

- Add `?t=1.7` to the address to jump to a moment (0 to 1 is scene 1, 1 to 2 is scene 2, and so on).
- Add `?q=high` or `?q=low` to fix the quality level.
- In the browser console: `__journey` (set `__journey.debugT = 5.5` to freeze on a moment), `__orbit` (camera state), `__camera`.

## Historical notes

- Only one pyramid stands at Giza in 2560 BC. Khafre's and Menkaure's pyramids appear in scene 5; their positions are approximate. The Sphinx is not modelled.
- Interior sizes follow Petrie's survey, rounded. The underground chamber, the relieving chambers above the King's Chamber and the narrow shafts are not modelled.
- The lamp in the King's Chamber is an invention, and the caption says so.
- In scene 5 the sun circles the sky three times as a sign of passing time; it is not an astronomical simulation.
- The Nile really runs seven or eight kilometres east of the plateau today. The valley here is narrower than in reality, so the river only shifts 1.4 km; a caption says so.
- Modern Cairo (`world/City.jsx`) is a sketch: plain blocks and towers, not real buildings.
- The winding ramp is one hypothesis among several; the scene says so on screen.
- The capstone is shown as plain limestone because its original look is not known.
- Dates are approximate ("c."). All sources are listed in `src/content/giza.js` and were checked in Phase 4 (see FACT-CHECK.md).

## Docs in this folder

- `DESIGN.md`: the TimeAtlas website design system and page architecture (decisions for all future phases).
- `DEPLOY.md`: put it on Vercel, step by step.
- `LAUNCH.md`: LinkedIn post drafts (English and German) and a screenshot list.
- `FACT-CHECK.md`: every claim, its source and what was corrected.
- `NOTICE.md`: licences of what is bundled (fonts, GSAP, three.js).

## Not built yet

- Real-device testing. It has only been tested in a software-rendered desktop browser, so frame rate on real phones and GPUs, and the automatic quality fallback, are unverified. The sound has not been judged by ear.
- The facts were checked against secondary sources, not by reading the cited books.
- An imprint (Impressum) and privacy notice, which a public German site normally needs.
- More places and times (the platform shell is the planned next phase).

## Site structure

- `/` : home page: two paintings, Giza at dawn, how it works, next places, last line (`index.html`, `src/home/`, words in `src/home/content.js`)
- `/explore/` : all places on a time line (`explore/index.html`, `src/explore/`, list in `src/site/places.js`)
- `/timeline/` : vertical walk through time (`timeline/index.html`, `src/timeline/`)
- `/about/` : about, credits, privacy, imprint (`about/index.html`, `src/about/`, `src/about/about-content.js`, `src/site/credits.js`)
- `/destinations/giza/` : the Giza field guide with the evidence ledger (`destinations/giza/index.html`, `src/destination/`)
- `/experience/giza/` : the Giza journey (`experience/giza/index.html`, `src/GizaApp.jsx`)

Timeline and About are not built yet; they show as inactive words in the navbar.
Rome, Athens and Angkor have no photo yet. Add a square image and set `thumb` in `src/site/places.js`.
