# TimeAtlas: Rome, 100 AD — roadmap

Status: sessions 1–8 done (25 Nov 2026), **milestone 2 reached**, plus session 8: free walking anywhere and the Then/Now switch (Forum, Colosseum, the Velia and the Circus, with later buildings). Next: session 9 on Sonnet 5.5, then an Opus audit (polish, phone performance, accessibility, share image, final fact-check, release checklist). See HANDOFF.md.
Destination: `/experience/rome-100-ad`. Giza stays untouched.

## Two standards that apply to every session

### Accurate like Giza
- Rome is one snapshot: **100 AD, reign of Trajan**. No later buildings without a clear "later" label.
- `HISTORY.md` holds one row per landmark: status in 100 AD (standing / under construction / not yet built / later), evidence level, sources. Start by verifying these likely traps: Arch of Septimius Severus, Temple of Venus and Roma, Temple of Antoninus and Faustina, Basilica of Maxentius, Trajan's Forum, Column and Markets, the Hadrianic Pantheon, Baths of Trajan, the Aurelian Walls.
- Every on-screen claim gets at least two independent sources and is recorded in `FACT-CHECK-ROME.md`, in the same format as Giza's `FACT-CHECK.md` (✅ confirmed, ✏️ wording changed, ⚠️ disputed or simplified).
- Every marker is labelled **Documented**, **Inferred** or **Invented**. Reconstruction choices (colours, roof forms, crowds) are disclosed on screen.
- No copyrighted reconstruction images are copied. Reference images are mood only. Free licences only, credited in About.

### Touchable (phone first)
- Tap a building or a marker: the camera flies there and a short card opens (name, date, purpose, why it matters, sources). Tap targets are the buildings themselves, not only small dots; at least 44 px.
- One finger drags to look or orbit, two fingers pinch to zoom, double tap returns to the overview. Nothing depends on hover.
- Two modes: **guided** (the scroll journey, like Giza) and **free** (orbit plus location chips: Aerial, Forum, Colosseum, Subura, Circus).
- Phone tier by default (`q=low` style): instancing, limited shadows, capped pixel ratio. A laptop gets the high tier. Test on a real phone every session.

## Sessions

Each session ends with a buildable branch and an updated `HANDOFF.md`. Work happens on a branch, never on production; Sayed previews on his phone via the Vercel branch preview and merges himself.

| # | Model | Goal | Done when |
|---|-------|------|-----------|
| 1 | Opus 5.5 high | Research and foundation: audit Giza, `HISTORY.md`, `WORLD.md`, register the destination, terrain with hills and the Tiber, instanced city fabric, aerial descent ("The Eternal City") | Aerial descent works on phone and laptop; every landmark has a status row |
| 2 | Opus 5.5 high | The Colosseum, exterior and arena: arcades, orders, attic, velarium, approach, touch orbit, first markers | Recognisable and measured; markers open on tap |
| 3 | Opus 5.5 high | Roman Forum core: Basilica Julia and Aemilia, Curia, Rostra, temples of Saturn, Castor and Vesta, Arch of Titus, Palatine slope, crowds | Walkable from the aerial view; period-correct |
| 4 | Sonnet 5.5 | Pages and content: Rome on Explore, Timeline and the destination page, marker text from `HISTORY.md`, About credits, mobile layout, fact-check pass, ad re-cut | **Milestone 1: ship "Rome, part 1"** (Eternal City, Colosseum, Forum) after Opus spot-checks the fact-check |
| 5 | Opus 5.5 high | Everyday Rome: a Subura street with insulae, shops, bakery, workshops, fountain, vendors, pedestrians; contrast with the monuments | Feels inhabited, not an archaeological park |
| 6 | Opus 5.5 high | Circus Maximus, Palatine palace, baths and the wider skyline | Connected with the Forum and Colosseum |
| 7 | Opus 5.5 high | Colosseum interior: seating, spectators, the games explained; underground structures only as far as research confirms for this date | **Milestone 2** |
| 8 | Opus 5.5 high | Free exploration mode and Then/Now: meaningful geographic comparison (what survives, what is gone), no image-swap slider | Comparison works for at least Forum and Colosseum |
| 9 | Sonnet 5.5, then Opus audit | Polish, phone performance pass, accessibility, share image, final fact-check, release checklist | **Milestone 3: Rome complete** |

Sonnet is used only for clearly defined work after the foundation exists. Opus keeps everything that needs historical judgement or hard 3D.

## Working rules
- Do not deploy, merge to main, buy anything or connect paid services.
- Do not expand scope without explaining the added complexity first.
- If a session nears its limit: save, keep the build passing, update `HANDOFF.md` with what is done, what is not, and the exact next step.
