# kids-games: working notes for Claude

Touch web games for the owner's young kids (about 18 months to 5 years; the oldest is 4). Every game is a static folder with no build step, published by GitHub Pages and installable to a phone or tablet home screen.

- Live site: https://conflagarationman.github.io/kids-games/
- Repo: `conflagarationman/kids-games`. Pages serves `main` from the repo root (legacy build, `.nojekyll` present).
- Backlog, ideas and history: [ROADMAP.md](ROADMAP.md). The player-facing game list: [README.md](README.md).

## Layout

```
index.html              home page: one illustrated tile per game, plus its own ⚙️ for Play time
shared/                 used by every page: KidsRounded.woff2 (+ OFL license), grownup.js, grownup.css
README.md               game list (keep in sync when adding or changing a game)
ROADMAP.md              backlog, ideas, history, open questions
<game>/index.html       the whole game: inline CSS + JS, one full-screen <canvas>
<game>/manifest.webmanifest
<game>/sw.js            offline cache for that game only
<game>/icon-180.png  icon-192.png  icon-512.png
<game>/cover.svg        800x500 cover for the home-page tile
```

Games: `bubble-pop/`, `magic-paint/`, `little-band/`, `web-hero/` (web-hero also vendors `matter.min.js`, Matter.js 0.19.0, MIT).

## Design rules (from research on toddler touch design; see ROADMAP.md for sources)

- **Tap and swipe only.** Avoid pinch, double tap and long press for kids. Little ones under 5 lose contact mid-drag, so a drag that breaks must still do something sensible.
- **Nothing to fail.** No losing, no timers, no score that goes down, unlimited tries. Wrong answers just play.
- **Big targets.** Anything a kid touches is at least 44px, with generous hit zones.
- **Keep the bottom edge clear.** Kids rest their wrists along the bottom edge of tablets, so no controls go there.
- **No narration over play.** Kids go passive when narrated at. Bubble Pop's spoken names are the deliberate exception and have a voice toggle.
- **Grown-up settings hide behind a press-and-hold.** The ⚙️ button top-right opens a panel after a 1.5s hold (a ring fills). Every game has it; copy the markup, CSS and JS from an existing game.
- **Make blank states inviting.** An idle screen shows a hint (Magic Paint's ghost 👆, Web Hero's pull hint).
- **No trademarked characters.** The site is public. No Spider-Man, Paw Patrol and so on, by name, logo or look. Make original characters (Web Hero's masked kid is original on purpose).

## Code conventions (copy from the existing games, don't reinvent)

- **Structure:** one IIFE in `index.html`, with sections marked `// ---------- Name ----------`. Brief "why" comments, the same density as the existing files. 2-space indent.
- **Viewport:** `width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover`.
- **Safe areas:** offset fixed UI with `env(safe-area-inset-*)`. Canvas layouts read them through CSS vars `--sat/--sab/--sal/--sar` (see `little-band/index.html` `inset()`).
- **Canvas:** size to `innerWidth/innerHeight` times `devicePixelRatio` (capped at 2), and lay out again on `resize`. Base sizes on `unit()` (`Math.min(W, H)` or a variant) so phones, iPads and monitors all work.
- **Loop:** a `requestAnimationFrame` loop with `dt` clamped to 0.05.
- **Input:** pointer events only, `touch-action: none`, with `contextmenu` and `gesturestart` prevented. Every finger counts (track by `pointerId`).
- **Audio:** all Web Audio synthesized, with no sound files. Create or resume the `AudioContext` on the first pointerdown (`audio()`). Use the major pentatonic so random notes sound good.
- **Settings:** only settings are saved, in `localStorage` with every read and write in try/catch. Keys:

  | Game | Key |
  |---|---|
  | Bubble Pop | `bubblePop.kids.v1` |
  | Magic Paint | `magicPaint.kids.v1` |
  | Little Band | `littleBand.kids.v2` |
  | Web Hero | `webHero.kids.v1` |

  Bump the key's version only if old saved values would break the game. New settings just get a default in the `settings` object.
- **Color emoji on canvas:** set `ctx.fillStyle = '#000'` right before any emoji `fillText`. Chrome applies the fill's transparency to color emoji, and this once made icons look washed out.
- **Sticker emoji:** emoji are pre-rendered once as stickers: a white outline about 6% of the size (the glyph silhouette stamped in white at 16 offsets) and a soft shadow `rgba(43,45,92,.25)`, baked into a sprite. Keep **one master sprite per glyph** at the largest size it's drawn, and scale it down; never cache per size, because per-size caches reached 120MB and iPad Safari kills pages over its canvas memory limit.
- **Sound limiter:** every game puts a `DynamicsCompressorNode` (threshold -12 dB, knee 6, ratio 12, attack 0.003, release 0.25) between its master gain and `actx.destination`, so piles of sounds don't distort on tablet speakers.
- **Offline (`sw.js`):** stale-while-revalidate over a fixed `FILES` list.
  - **Prefix cleanup:** all games share one origin, so `activate` may delete only caches starting with that game's prefix (`k.startsWith('<game>-')`). Never delete other games' caches.
  - **Bump `CACHE` on every change.** Current versions: `bubble-pop-v7`, `magic-paint-v9`, `little-band-v8`, `web-hero-v6`. Bumping gets installed copies to update.
  - **New files:** add any file the game needs to `FILES`. Every game also lists `../shared/KidsRounded.woff2`, `../shared/grownup.js` and `../shared/grownup.css` (same origin, so the paths work).
- **Look:** soft pastel gradients and white-outlined shapes. Fonts are "Trebuchet MS" for UI and "Kids Rounded" (bundled Nunito ExtraBold, then "Arial Rounded MT Bold") for big glyphs; ink is `#2b2d5c`; the bright palette is `#ff3b3b #ff9a1f #f5c800 #22b84a #2f7bff #a04dff #ff4fb0`.

## Shared font and grown-up timer (`shared/`)

- **Font:** `KidsRounded.woff2` is Nunito ExtraBold (OFL, license beside it), Latin subset, 12KB, family `"Kids Rounded"`. Each page declares it with `@font-face` (`font-display: block`, `../shared/` path) plus a `<link rel="preload">`. Put `"Kids Rounded"` first wherever big glyphs are drawn. Canvas text doesn't wait for fonts, so a game with cached text calls `document.fonts.load('900 64px "Kids Rounded"')` and then its rebuild function (Bubble Pop `buildSprites()`, Little Band `rebuild()`). Nothing waits on it: play starts with the fallback and swaps in.
- **Timer:** `grownup.js` + `grownup.css` need no setup beyond one `<link>`, one `<script>` (before the game's own script), a `<div data-kg-panel></div>` inside the grown-up panel (it renders the Play time controls) and one register call: `KidsGrownup.register({ setVolume(v), pause() })`. `setVolume` multiplies the master gain before the limiter (eased with `setTargetAtTime`); `pause()` ends any drag or held note, cancels speech, and suspends the `AudioContext` (the game keeps an `asleep` flag so `audio()` doesn't resume it). `KidsGrownup.mountPanel(el)` renders the controls anywhere (the home page uses it).
- **Storage:** `kidsGames.grownup.v1` = `{ limit (minutes, 0 off, 5 to 120), show ('ring' | 'ring+minutes' | 'hidden'), remainingMs, lastTick, state ('playing' | 'winding' | 'goodnight') }`. One clock for all games; it counts only while a page is visible (delta capped at 1.5s per tick), saves about every 5s and on pagehide, and starts a new session when `lastTick` is more than 6h old or the limit changes.
- **Behavior:** with the limit off nothing is added to the DOM. The ring (`pointer-events: none`) sits left of `#parentBtn`, so don't put game UI in that corner. The last 2 minutes: ring becomes a growing moon, a dusky tint up to 25%, volume to 60%. At zero a full-screen goodnight overlay (z-index 4, under each game's `#panel` at 5) fades in over 3s; a capture-phase listener stops the game from seeing pointer or key events. Its own press-and-hold ⚙️ opens "+5 minutes, +15 minutes, New session, Turn the limit off".
- **Debug:** `?debug` gives `window.__grownup()`; `?debug&fast` makes a minute last a second. (Web Hero's `?debug` also draws body outlines, so use the stored state to screenshot it.)

## Adding a game (checklist)

1. **Make the folder:** create `<game>/` with `index.html`, the manifest, `sw.js` (new prefix) and icons. Include the shared font and timer as described in the shared section above. Draw the icons with Python PIL, flat shapes on a gradient like the others, and avoid looking like any brand.
2. **Draw the cover:** `<game>/cover.svg`, 800x500, in the same polished style as the existing covers. Render it in the browser and refine it.
3. **Add the home tile:** in `index.html`, copy an `<a class="game">` tile and set `--accent`/`--tint`, the cover, icon, title and a one-line description.
4. **Update the docs:** add the game to `README.md` and to the game notes below. Move its ROADMAP entry to History.
5. **Test** at every size (below), then commit and push.

## Testing

- **Serve locally:** `python3 -m http.server 8777 --bind 127.0.0.1` from the repo root (run it in the background), then open `http://localhost:8777/`.
- **Check every size** in the built-in browser with `resize_window`: phone portrait 375x812, phone landscape 844x390, iPad 768x1024, monitor 1440x900. Reset to `desktop` when done.
- **Simulate play** with dispatched `PointerEvent`s (`pointerdown`/`pointermove`/`pointerup` with `pointerId`, `clientX`, `clientY`). Open the grown-up panel by dispatching `pointerdown` on `#parentBtn` and waiting about 1.7s.
- **Debug hooks:** open a game with `?debug` to get a read-only snapshot. Bubble Pop has `window.__bubblePop()` (Find it target and where those bubbles are). Web Hero has `window.__webHero()` (level, stars, vehicle positions and whether each is knocked) and draws body outlines. Magic Paint has `window.__magicPaint()` (memory per cache).
- **The game loop pauses while a test script awaits.** rAF stops while a `javascript_exec` is waiting, so let time pass with the computer tool's `wait` and query afterwards. Real clicks (`left_click`) run in real time.
- **Ignore one console error:** "An unknown error occurred when fetching the script" is a preview-browser service-worker limit, not a bug. Check service worker behaviour on the live HTTPS site instead.
- **Find what's left untested:** real audio and real fingers can't be checked from a session, so say so in reports.
- **Measure, don't eyeball:** to check things like spawn spread, hook `CanvasRenderingContext2D.prototype.fillText` for a frame and count emoji positions. That is how Bubble Pop's left-side bias was found.

## Deploying

- **Push to deploy:** the owner works directly on `main`. Pushing to `main` deploys.
- **Wait for the build:** `gh api repos/conflagarationman/kids-games/pages/builds/latest --jq '.status+" "+.commit'` until it shows your commit as `built`, then curl the changed URLs on the live site.
- **Commit messages:** a short summary line plus a body explaining what changed per game.

## Game notes

**Bubble Pop** (`bubble-pop/`)
- **Origin:** first built in a session on the owner's Linux machine ("Linux beast") and copied here unchanged.
- **Content modes:** animals, colors, letters, numbers, shapes, mix. Content is dealt from shuffled decks (`deal()`) so it doesn't repeat.
- **Bubble count:** `maxBubbles()` covers about 22% of the screen with bubbles (8 to 18), with `baseR()` clamped between 36 and 80px. Rise speed is a share of `H` (`RISE`), so a trip takes the same time on any screen. The spawn timer keeps a steady flow; the cap is only a ceiling.
- **Spawning:** `openX()` picks the most open bottom spot. Its fallback must stay a candidate spot: falling back to 0 caused a left-wall bias.
- **Bubbles apart:** overlapping bubbles nudge apart.
- **Giant bubbles:** every 11th spawn is a giant that bursts into 4 minis.
- **Celebration:** every 12 pops (in free popping).
- **Find it** (`settings.find`): items carry an `id` and an `ask` phrase. `newTarget()` picks one and puts it on at least 2 mid-screen bubbles. `newItem()` makes about 30% of new bubbles the target. The badge at top center shows the target, so it works with the voice off. After 3 misses or 12s, it asks again and the right bubbles shimmer (`hintGlow`). iOS needs a touch before speech, so the first ask is repeated on the first tap.
- **Clouds:** drawn each frame behind the bubbles (`drawClouds`) from opaque cloud sprites with globalAlpha, so overlapping clouds have no seams.
- **Sprites:** bubble bodies (one master per hue or tint, the rim stroked live), glyph stickers and clouds are all cached, so a frame is mostly `drawImage`. `buildSprites()` queues every sprite the current mode can need on startup, resize (`buildSprites(true)` keeps masters if size and DPR didn't change) and mode change, and builds them in small slices after frames; anything not ready yet draws the old uncached way. Blit at whole device pixels. Mix mode's cache is about 18MB.

**Magic Paint** (`magic-paint/`)
- **Painting:** a persistent `paint` layer canvas with live effects drawn on top. Drag paints and a short tap (under 300ms, under 12px of movement) stamps. Stamps animate, then bake into the paint layer.
- **Colors:** the rainbow brush advances with distance painted, so it looks the same on fast and slow screens.
- **Brush:** strokes are continuous (no bead seams between segments). `settings.brushStyle` is `smooth` (default) or `crayon`, a grainy wax texture, in the grown-up panel.
- **Idle:** when nothing is moving the loop doesn't redraw; the ghost hint still appears on time.
- **Color buttons:** DOM buttons, not canvas. A column on the left in portrait, a row across the top in landscape. `settings.brush` is `rainbow`, `crayons` (surprise colors) or a hex color.
- **Hint:** a ghost 👆 hint shows on a blank page.
- **Saving:** the share sheet when `navigator.canShare({files})`, otherwise a download. The saved picture includes the coloring-page lines.
- **Coloring pages** (`settings.page`, `PAGES`): line art drawn in a -1..1 box with helpers `c e p l a` onto an `outline` canvas that sits on top of the paint. `wall` marks line pixels.
- **Tap to fill:** when a page is drawn, `labelRegions()` labels every open area once with bounding boxes, so a tap just looks up its region (a few ms, even full-screen on a 12.9" iPad). The fill goes into an offscreen canvas, which pours in with a growing clip circle, then bakes into the paint. A tap on a page never stamps: a tap on a line fills the nearest open spot (searched out past the line width, `lineW`), and if there is none it just sparkles.
- **Page placement:** `pageBox()` keeps clear of the color buttons. On resize the page keeps its box so the paint still lines up, unless it no longer fits (then the page is re-placed and the paint cleared).
- **Page memory:** each page (and blank paper) keeps its own painting. `leavePage()` snapshots the paint to an in-memory PNG blob, and `restorePage()` brings it back if the page box still matches. Not saved across reloads. Clear clears only the current page.
- **Stickers:** stamps use the shared sticker look from a small least-recently-used cache (about 14MB). `?debug` exposes memory per cache through `window.__magicPaint()`.
- **Picture button:** the 🖼️ button in `#palette` cycles `PAGE_ORDER`. On big screens (`bigStrip()`: shortest side at least 700px, with the color buttons shown) it hides, and `#pages` shows every page as a tile down the right side instead. Thumbnails are drawn once with `drawLines()`, `pageBox()` keeps clear of the strip, and tapping the current page's tile does nothing so it can't wipe the painting.

**Little Band** (`little-band/`)
- **Keyboard:** a real keyboard starting at middle C (MIDI 60), 1 or 2 octaves (auto when `range` is 0). Notes hold while the key is down (`startVoice()` returns `{stop}`), and sliding across keys plays a run.
- **Sounds:** `VOICES` holds piano, bells, guitar and horn as additive oscillators with envelopes. `PADS` holds drum and clap.
- **Layout:** portrait keeps keys piano-shaped (`maxKey = ww*6`) with a 2x3 instrument grid; landscape uses one row sharing the top line with the ⚙️.
- **Key colors:** white keys use classroom bell colors (C red to B pink).
- **Songs:** `SONGS` holds MIDI lists within C4–C5. The next key glows with a ⭐ inside it, and wrong keys just play.
- **Beat:** the play-along beat is scheduled ahead on the audio clock (`scheduleBeat`).
- **Static layer:** the background, resting keys and instrument buttons (with their shadows and sticker emoji) are drawn once per layout by `rebuild()`; each frame draws only what moves, and nothing at all when idle. No `shadowBlur` per frame (it's slow on iPad Safari).
- **Voices:** at most `MAX_VOICES` (10) key notes at once; an extra one fades out the oldest.
- **Record and play:** ● and ▶ are `ctrl` buttons in the instrument row (8 buttons: one row when wide, 2×4 when tall). A take is a list of `{ t, kind, midi, voice, dur, id }`. Keys record on press, and their `dur` is set on release. Playback replays on `setTimeout`s and lights keys through the `ghost` map without moving song steps. There's a 20s cap (`MAX_REC`).

**Web Hero** (`web-hero/`)
- **Built by:** a separate Sonnet session from a written plan.
- **Hero:** original masked kid in a teal suit with a yellow chest star, orange domino mask and yellow cape.
- **Shooting:** pull anywhere to slingshot (a stretchy strand plus 25 aim dots), or tap empty sky to auto-throw a lobbed arc there.
- **Sticky web** (`settings.tap = 'yank'`, the default): tapping a crate or vehicle (`Query.point`) adds a Matter `Constraint` from the wrist to that spot. The web shoots out for 0.12s, reels in hard, and lets go at 0.75s. At most 2 at once.
- **Targets:** hand-drawn vehicles on Matter bodies, on crate and girder towers.
- **Physics:** Matter.js `Engine.create({ enableSleeping: true })`, stepped at a fixed 1/60s. No Matter.Runner or Matter.Render: everything is drawn by hand.
- **Knocked rule:** a vehicle counts as knocked when it is rotated more than 60°, falls more than its height, leaves the screen, or is pushed more than 0.9 of its width from its start.
- **Levels:** 3 hand-made tutorials, then a seeded generator (same level number and difficulty always gives the same level). Each level settles in a silent 1s physics run and is regenerated if anything falls on its own.
- **Settings:** `{ diff: 'easy'|'medium'|'big', dots, sound, tap: 'yank'|'throw' }`.
- **Juice:** a web trail behind each shot, dust puffs at hard contacts, a small screen shake on big crashes (the HUD doesn't shake), and a row of the level's vehicles under the star counter, ticked off as they fall.
- **Sizing:** `u = max(min(W, H*1.5)/14, min(W/10, H/16))`. The second term stops tall screens from getting a tiny world under a huge sky.
- **Tuning calls:** ball radius about `0.4*unit`, pull cap about `3.5*unit`, ball density 0.016, hero drawn at 1.15x. Big levels use the right 67% of the width.
- **Vehicles:** drawn by hand (`paintVehicle` to a sprite per type and size, `drawVehicle` adds live spinning wheels), in the city's flat style, always facing the hero. No faces on vehicles (that's a trademarked movie look). Hubcaps pop off when knocked. Bodies and physics are unchanged from the emoji version.
