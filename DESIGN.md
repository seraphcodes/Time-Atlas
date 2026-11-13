# TimeAtlas design system

Status: decided 2026-11-11. This file is the source of truth for the main website and for every future civilisation. If code and this file disagree, fix one of them on purpose; do not let them drift.

The Giza experience (`src/` today, `experiences/giza/` after the platform phase) is not covered by the website tokens. See "Experiences stay independent".

## 1. Direction

TimeAtlas is a premium digital museum for historical places you can walk through.

- Apple's discipline: few elements, strict hierarchy, quiet motion. We borrow principles and numbers from the open Apple-style design skill (github.com/naplesblue/apple-design-skill), not Apple's site, colours or branding.
- Cinematic, with the artwork and the 3D world as the visual centrepiece. The interface stays nearly colourless so the image carries the colour.
- Never a SaaS dashboard: no card grids for their own sake, no gradients, no stacked shadows, no decorative effects.
- Honest by design: every claim is labelled documented, inferred or invented (section 9).

## 2. Decisions log

| # | Decision | Notes |
| --- | --- | --- |
| 1 | Palette: Obsidian and Champagne | Core colours below. Locked. |
| 2 | Typeface: Inter, with the Apple-skill type scale | Self-hosted variable font (OFL). No serif on the website. Libre Caslon stays inside the Giza experience only. |
| 3 | Two surfaces: dark (cinematic) and paper (reading) | Paper is Champagne, a warm white. |
| 4 | Home hero artwork: Thomas Cole, The Architect's Dream (1840) | Public-domain painting by a human artist, not AI. Licence of the specific scan must be checked before launch (section 11). Always captioned as artwork. |
| 5 | Six pages, one platform | Section 10. |
| 6 | Every civilisation has its own destination page and its own lazily loaded experience | Never merge civilisations into one 3D scene. |

## 3. Colour

```css
:root {
  /* core */
  --obsidian:  #101418;  /* dark surfaces */
  --champagne: #F2EBDD;  /* primary text on dark, paper surface */
  --gold:      #C7A36A;  /* the one action colour, on dark only */
  --slate:     #5A5F66;  /* lines, planned states, secondary text on paper */

  /* derived */
  --mist:      #9AA0A8;  /* secondary text on dark */
  --raised:    #181D23;  /* menus, panels on dark */
  --paper-up:  #FBF7EE;  /* raised areas on paper */
  --gold-ink:  #7A5C2B;  /* gold used as text or links on paper */

  --line-dark:  rgba(242, 235, 221, 0.14);
  --line-paper: rgba(16, 20, 24, 0.14);
}
```

Contrast, measured:

| Pair | Ratio | Use |
| --- | --- | --- |
| Champagne on Obsidian | 15.6 | body text on dark |
| Mist on Obsidian | 7.0 | secondary text on dark |
| Gold on Obsidian | 7.8 | actions, links, selected states on dark |
| Obsidian on Gold | 7.8 | label inside a gold button |
| Obsidian on Champagne | 15.6 | body text on paper |
| Slate on Champagne | 5.4 | secondary text on paper |
| Gold-ink on Champagne | 5.2 | links on paper |
| Slate on Obsidian | 2.9 | lines and "planned" markers only, never text |
| Gold on Champagne | 2.0 | never |

Rules:
- Gold is the only accent. At most one gold-filled button per view. Gold never appears on paper except as `--gold-ink` text.
- On paper, the primary button is an Obsidian pill with Champagne text.
- No other hues in the interface. Imagery supplies colour.
- No error or success colours yet; add them only when a form needs them, and tell the user why.

## 4. Typography

Inter, variable, self-hosted and inlined (no third-party font requests). `font-optical-sizing: auto`, `-webkit-font-smoothing: antialiased`, `font-variant-numeric: tabular-nums` for dates and numbers. Headings semibold (600), never heavier.

| Level | Size | Weight | Tracking | Line |
| --- | --- | --- | --- | --- |
| Display (home hero) | clamp(44px, 9vw, 104px) | 600 | -0.035em | 1.02 |
| H1 (page title) | clamp(34px, 6vw, 64px) | 600 | -0.03em | 1.06 |
| H2 (section) | clamp(26px, 4vw, 40px) | 600 | -0.025em | 1.12 |
| H3 (item title) | 18 to 22px | 600 | -0.01em | 1.3 |
| Lede | clamp(17px, 2.2vw, 21px) | 400 | 0 | 1.55 |
| Body | 16 to 18px | 400 | 0 | 1.65 (long reading on About: 1.75) |
| Meta | 13 to 14px | 400 or 500 | 0 | 1.5 |
| Label | 11 to 12px | 500 | +0.12em, uppercase | 1.4 |

- Uppercase is only for labels: dates, locations, metadata, and the TIMEATLAS wordmark (600, +0.2em). Never uppercase headings or buttons.
- Line length: body at most 65 characters (about 34em), reading container 720px.
- Sentence case everywhere. Verb-first buttons ("Start exploring", "Enter Giza"). No "click here", no exclamation marks.
- Hierarchy comes from size, weight and the two text greys, not from colour.

## 5. Layout, radius, elevation

- Containers: reading 720px, content 1200px, full-bleed for artwork and hero.
- Side padding: 22px on mobile, 40px from tablet up.
- Section spacing: clamp(72px, 11vw, 160px). Generous negative space is a feature.
- Breakpoint at 680px (one column below). Touch targets at least 44px.
- Radius tiers: pill and buttons 999px; thumbnails 12px; panels and menus 16px; large image frames 22px. Hero artwork is full-bleed with no radius.
- Elevation: none by default. Separate with hairlines (`--line-dark`, `--line-paper`) and space. Only floating menus and dialogs get a shadow: `0 2px 8px rgba(0,0,0,.25), 0 24px 60px rgba(0,0,0,.35)` on dark.
- Cards only when the content is a bounded object (a destination). Prefer image plus text over boxed cards.

## 6. Motion

```css
:root {
  --ease-spring: cubic-bezier(0.32, 0.72, 0, 1);   /* enter, sheets, page transitions */
  --ease-out:    cubic-bezier(0.25, 1, 0.5, 1);    /* hover, small moves */
  --t-enter: 400ms;
  --t-exit:  260ms;
  --t-press: 100ms;
}
```

- One orchestrated moment per page, not scattered effects. Home: the hero artwork settles from scale 1.04 to 1 over 1.2s on load, then the headline fades up once.
- Navbar: transparent at the top; after scrolling it gets Obsidian at 70% with `backdrop-filter: blur(20px) saturate(180%)` and a hairline. Transition 400ms.
- Press: `transform: scale(.97)` over 100ms. Hover: opacity or underline, no lifts.
- Timeline rail: the selected place grows and the others dim to 55% opacity (opacity, never blur). Horizontal drag with inertia.
- Entering an experience: the page fades to Obsidian (400ms), then the experience mounts. Exit is the same path in reverse (260ms).
- `prefers-reduced-motion`: cross-fades of 200ms, no travel, no parallax. Motion becomes gentler, not absent. Also honour `prefers-reduced-transparency` (solid Obsidian navbar).
- Nothing loops faster than once per 5 seconds. No full-screen moving backgrounds.

## 7. Components

- Navbar. Desktop: TIMEATLAS wordmark left; Explore, Timeline, About centre; "Start exploring" pill right (gold on dark, Obsidian on paper). Mobile: wordmark left, a 44px menu button right opening a full-height panel with the same links. Minimal, nothing else.
- Button. Pill, 44px high, 15px/500. Primary (gold or Obsidian), secondary (1px hairline, transparent). No disabled buttons: explain in text instead.
- Label. The small uppercase 11px text above titles, used only when it carries information (date and place).
- Confidence marker (section 9).
- Destination tile. Image-led, 3:4 or 16:10, title and label below the image, no shadow. "Planned" tiles use the Slate line and Mist text, with no image.
- Rail node (Timeline). Dot on a hairline rail, a stem, a small silhouette tile, name and date.

## 8. Imagery

- Home hero: Thomas Cole, The Architect's Dream (1840), full-bleed. Crop for desktop (wide, favour the monuments on the right) and for phones (portrait, subject centred). Dark overlay is a flat Obsidian layer at 35 to 55%, not a gradient. Caption: "Artwork: Thomas Cole, The Architect's Dream, 1840".
- Destination imagery comes from our own scenes (stills captured from the 3D at high quality). Artwork, photography or any non-original image is always captioned with author, year and licence.
- AI-generated imagery is not used. If it ever is, it is labelled "Illustration" and counted as invented.
- Formats: AVIF with WebP fallback, responsive `srcset`. Hero at most about 250 kB per size. Every licence is recorded in `NOTICE.md`.

## 9. Honesty labels

| Label | Meaning | Marker |
| --- | --- | --- |
| Documented | Backed by excavation or a surviving text | solid gold dot |
| Inferred | Scholars' best reading of the evidence | gold ring |
| Invented | Added by us to make the scene work | dashed Mist ring |

Each destination page lists its sources and shows these labels. The labels appear on hotspot cards inside experiences too.

## 10. Architecture

| Route | Page | Surface |
| --- | --- | --- |
| `/` | Home | dark |
| `/explore` | Explore (destinations) | dark |
| `/timeline` | Timeline (the rail) | dark |
| `/destinations/<slug>` | Destination overview, sources, labels | paper for reading, dark hero |
| `/experience/<slug>` | Immersive experience | the experience's own palette |
| `/about` | About and historical sources, licences, imprint, privacy | paper |

- One list, `src/content/destinations.js`, drives Explore, Timeline and destination pages. Fields: slug, name, place, date label, status (open or planned), hero image, summary, sources, experience loader.
- Each experience lives in `src/experiences/<slug>/`, is loaded with `React.lazy(() => import(...))`, and ships as its own chunk. Shell pages never import three.js or GSAP.
- Adding a civilisation: one folder, one list entry, one hero still, one sources file, a fact-check entry in `FACT-CHECK.md`. Nothing else changes.

## 11. Experiences stay independent

- The website tokens apply to the shell only. Inside an experience, the historical palette and any typefaces of that world stay (Giza keeps its sand palette and Libre Caslon).
- The only brand elements inside an experience are the Exit pill, the sound toggle style and the honesty labels, so that crossing between shell and world feels consistent without recolouring the history.
- An experience must keep working on its own: its own loading state, its own WebGL fallback, its own reduced-motion handling.

## 12. Quality bar

- WCAG AA contrast (table above), visible keyboard focus (2px gold ring on dark, 2px Obsidian on paper), full keyboard use, `prefers-reduced-motion` respected.
- No cookies, no third-party requests, no analytics unless the user decides otherwise. An imprint (Impressum) and a short privacy notice live under About; this is not legal advice and should be checked.
- Shell route budget: about 150 kB gzipped JavaScript, excluding experiences.
- Test every page at 390 by 844 and 1280 by 720, run the axe audit, and check keyboard order before calling a phase done.

## 13. Open items

- The Cole scan's licence for use in Germany is not confirmed. Use the Toledo Museum of Art's own image terms or confirm before launch.
- Hero crops are not made yet; the full-resolution file has to be downloaded on the user's laptop (the cloud workspace cannot reach Wikimedia).
- Athens, Rome, Angkor and Machu Picchu are placeholders for the "Planned" tiles, not commitments.
- Gold-ink and Mist were chosen for contrast; adjust only with a new contrast check.

## Home page (built, November 2026)

Sayed's direction replaces the earlier homepage sample.

- Screen 1: Thomas Cole, *The Architect's Dream* (1840), full-bleed. Headline "Stand in the past."
- Navbar: 44px high, 12px type, wordmark 12px/600/+0.2em. Transparent over the painting, blurred Obsidian after scrolling. Explore, Timeline and About show as inactive text until those pages exist.
- Transition: the stage is pinned for about three screens. Scroll drives one GSAP timeline: the camera pushes into painting 1 (scale 1 to 3.6, aimed at the monuments), it dissolves into painting 2, which settles from 1.45 to 1 while an olive vignette closes in from the edges and a warm gold glow forms in the centre. Only transform and opacity change.
- Screen 2: Cole, *The Course of Empire: The Arcadian or Pastoral State* (1834). Headline "Then walk into it." Button into Giza.
- Reduced motion: no pinning, the two screens simply follow each other.
- Phones: portrait crops of both paintings, shorter pin, menu button.

Files: `src/home/` (Home.jsx, Nav.jsx, content.js, home.css, img/). Images are made by `node tools/make-home-images.mjs <hero> <second>`.

**Palette (sampled):** olive #3A401F from the foliage of The Pastoral State, gold #CFAA6F from the dome in The Architect's Dream (close to Antique Gold #C7A36A). Paintings are processed with `tools/make-home-images.mjs`; the original 3840px scans are not in the repo.

## Pages are separate documents

The site is a multi-page Vite build, not a single-page router: `/` is the home page (about 2 kB of its own JS plus React and GSAP), `/experience/giza/` is the Giza journey, unchanged. The home page never loads three.js. New experiences get their own folder under `experience/` and an entry in `vite.config.js`.


## Home transition v2: "The curtains open" (replaces the zoom-through)

Sayed found the zoom-and-dissolve not premium enough. The painting is now treated as a stage.

- The Architect's Dream is cut into depth layers (`src/home/layers/`): swag, left pillar and drape, right drape and pillar, the architect's column, church with cypresses, and the city behind with the foreground painted out.
- Scroll (pinned about four screens): the swag lifts, the pillars and drapes part with a slight sway, the column sinks, church and trees drift off slower, the city turns to warm mist, and The Pastoral State settles in behind it with olive edges and a gold centre.
- At rest the untouched painting is shown; the layers take over on the first pixel of scroll, so the still image is never degraded.
- Only transform and opacity animate. Reduced motion: no pinning, two plain screens. Phones: same choreography, framed on the temple and the architect.
- Cut-outs are made by `/home/claude/cut/layers.py` (GrabCut from hand-placed outlines; kept outside the repo with the 3840px scan).

## Explore and destination pages (built, November 2026)

Sayed's direction after two rounds of sketches.

- **Background system:** every page behind the home page shows one sharp image under one flat dark layer. No blur, no stripes, no glow. Explore uses The Pastoral State (the same file as the home page, so it is already cached) at 72% Obsidian. The Giza page uses our own dawn still at 76%. The strengths were measured so that small Sand and gold text passes 4.5:1 even over the brightest part of the image; change them only with a new measurement (`--dark` in `site.css` / `destination.css`).
- **Warm text on images:** Sand #E3DAC6 for secondary text, Sand-dim #CFC6B0 for quiet labels, Gold-lit #E0BE80 for open and planned states. Mist grey is not used on these pages.
- **Glass:** panels, the rail, medallions and small cards are frosted glass (`.glass` in `site.css`): blur 22px, a lit top edge, a soft shadow. With "reduce transparency" they become solid.
- **Explore (`/explore`):** a glass ruler from 3000 BC to today with ticks every 100, 500 and 1000 years. Places are round medallions on stems, alternating above and below the rail so neighbours never collide. Choosing one grows it, moves a gold mark along the rail and sends a thread of light down into the glass panel, which shows the place. Moving the mouse along the rail shows the year. Small glass cards and filter chips repeat the list below. Phones: the rail scrolls sideways and brings the chosen place into view.
- **Rings:** gold ring with a picture = open; thin gold ring = planned; dashed ring = only an idea. Places without a real, licensed photo show their first letter. Add a photo with the `thumb` field in `src/site/places.js`.
- **Giza field guide (`/destinations/giza`):** a glass card that stays beside you (picture, date, Enter button, four facts); six stops on a lit rail, each with honesty marks; then and now; the evidence ledger on Champagne paper with the source list; the way in; Rome as planned next.
- **Honest wording:** planned places say "Not built yet". The ledger says the books were not read cover to cover.
- Home: the hero button "Start exploring" now opens Explore. "Enter Giza" on the second screen and the navbar pill still open the experience.

Files: `src/site/` (places.js, site.css, img/), `src/explore/`, `src/destination/`, `explore/index.html`, `destinations/giza/index.html`. A new place needs one entry in `places.js`; a new field guide needs a content file like `giza-page.js`.

## Timeline and About (built, November 2026)

Both keep the Explore background (The Pastoral State, one flat dark layer, no blur).

- **Timeline (`/timeline`):** a vertical walk through the same list as Explore (`places.js`). A sticky glass card shows the year of the chapter you are in and "about N years ago" (rounded to 100, no year 0). A gold rail fills as you scroll (`--p`, set in rAF). Chapters are glass cards with photo, blurb, facts, photo credit and buttons; pills between them say how many years pass ("About 2,100 years later"). The last card, Today, leads to Explore. Phones: the year card becomes a slim bar under the nav.
- **About (`/about`):** what TimeAtlas is, the three honesty marks (documented, inferred, invented), how we work, then one large dark glass panel with the credits table (`credits.js`), software, Privacy and Imprint (no white paper on this page; the Giza evidence ledger keeps the one Champagne paper moment). The credits table turns into stacked rows under 700px.
- **Footer (updated):** one shared `Footer.jsx` on every page. The painting again (The Pastoral State, sharp) under one flat 72% dark layer set in `site.css` (`footer.foot`); contrast measured against the brightest 0.5% of the footer: sand-dim 4.8:1, gold-lit 4.6:1 on desktop and above on phones. Brand line, a note, then two link columns: Places (Explore, Timeline, Giza field guide) and This site (About, Credits, Privacy, Imprint). Change the layer only with a new measurement.
- **Imprint:** placeholders `[Your full name]`, `[Street and number, postcode, city, Germany]`, `[Email address that you read]` in `about-content.js` must be filled before launch.

## Home page, the rest of the journey (built, November 2026)

After the two paintings the home page carries on as one scene. Each section has exactly one transition, and each one means something. Nothing else moves.

| From → to | Name | What happens |
| --- | --- | --- |
| Painting one → painting two | The curtains open | Unchanged (see "Home transition v2"). |
| Painting two → Giza | Walk into the light | The words leave. A warm light rises from the sky of the painting, at the exact spot where the sun sits in our dawn still, fills the screen, and draws back into that sun. Behind it the painting has gone and Giza at dawn is standing there. Same pinned stage, same scrub. |
| Giza → How it works | Lights down | The dawn still does not scroll. It stays behind the page and darkens to 78% while the three steps rise on glass. A gold line runs through the three numbers as you pass. |
| How it works → Where we go next | Time passes | In the dark, dawn changes to the finished pyramid. |
| Where we go next → last line | Lights up | A beat of darkness with nothing on screen, then the dark lifts and the finished pyramid stands over the last line. |
| Last line → footer | The painting returns | Shared footer (The Pastoral State). |

How it is built (`src/home/Home.jsx`, `home.css`, words in `content.js`):

- **`.sky`**: our own stills (dawn, finished), fixed behind the page, with one dark layer `.bd-dim`. The stage hides it until the second move. The home page is the only page whose backdrop is not the painting: here the rebuilt place itself is the backdrop, and the painting comes back in the footer.
- **The light** (`.light`): a small round gradient scaled up from the sun's position. `SUN` in `Home.jsx` holds the sun's place in the still; `sunAt()` works out where that lands on screen for the current crop, and is re-run on resize. If the dawn still is replaced, update `SUN`.
- **The pinned stage** is now 638% long on desktop (456% on phones): the first move keeps its exact length, the second adds about half.
- **One function sets the dark layer** (`setDim`) from two scroll ranges, so jumping to the end and back can never leave it in the wrong state. The third screen's own shade continues below the stage (`.how-tail`) and hands over to the dark layer, so no edge shows.
- **Third screen**: status pill (solid gold dot = open), title, lead, Enter Giza, field guide, and three facts on glass. The caption says the picture is our own model, not a photograph.
- **How it works**: three numbered steps (a real sequence), each with a small picture of the real thing: the time line with the four medallions, a still, the three honesty marks. Whole card is the link. Phones: numbers down the left with a line between them.
- **Where we go next**: Rome (planned) is the large card; Athens and Angkor (ideas) are small, dashed, with round photos. Each opens Explore with that place chosen (`explore/#rome`). Photo credits stay on the cards.
- **Reduced motion**: no pinning and nothing moves; the three screens stack and the backdrop changes by plain 0.5 s fades (classes `lights-down`, `time-on`, `lights-up`).
- **Checked**: text contrast measured against the real pixels behind it at 16 scroll positions, desktop and phone (worst case 5.1:1 for small text); axe clean at five scroll positions, desktop, phone and reduced motion; state correct after jumping to the end and back.
- **Accessibility note**: the visible hero title is hidden once the curtains open, so the page keeps a screen-reader `h1` at the top of `main`.

## Desktop polish round (after the home sections)

- **Type on laptop and up (min-width 901px):** hero and second screen titles clamp(40px, 5vw, 70px); the Giza screen title clamp(32px, 3.7vw, 52px); section headings clamp(30px, 3.6vw, 50px); buttons 38px high. Phones keep the earlier sizes.
- **Olive, not navy:** `--glass` in site.css is olive (rgba(58, 65, 31, 0.58)) with `--olive-deep` for pills and dots. The home backdrop dimmer is a deep olive-black.
- **Navbar:** frosted glass (neutral dark film 42%, blur 30px, saturate 190%), so it takes the colour of the page behind it. Where the person has turned transparency off (`prefers-reduced-transparency`, or no `backdrop-filter`), the bar falls back to a tint, `--nav-tint`, which Home.jsx sets from the scroll position (colours read off the pictures, darkened to 32%). Other pages use the default dark green tint.
- **Ending:** the last section fades the finished pyramid into obsidian, and the footer's painting rises out of that (`.home footer.foot` gradient). No hard edge.
- **Footer:** larger, with a round line icon on every link (compass, hourglass, pyramid, info, camera, shield, scales), drawn inline in Footer.jsx.
- **Contrast:** nav links at 4.4:1 or better, except about 3.9:1 during the bright sun flash between painting two and Giza.
