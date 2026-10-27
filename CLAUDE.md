# kids-games: working notes for Claude

Touch web games for the owner's young kids (about 18 months to 5 years; the oldest is 4). Every game is a static folder with no build step, published by GitHub Pages and installable to a phone or tablet home screen.

- Live site: https://conflagarationman.github.io/kids-games/
- Repo: `conflagarationman/kids-games`. Pages serves `main` from the repo root (legacy build, `.nojekyll` present).
- Backlog, ideas and history: [ROADMAP.md](ROADMAP.md). The player-facing game list: [README.md](README.md).

## Layout

```
index.html              home page: one illustrated tile per game
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
- **Offline (`sw.js`):** stale-while-revalidate over a fixed `FILES` list.
  - **Prefix cleanup:** all games share one origin, so `activate` may delete only caches starting with that game's prefix (`k.startsWith('<game>-')`). Never delete other games' caches.
  - **Bump `CACHE` on every change.** Current versions: `bubble-pop-v3`, `magic-paint-v3`, `little-band-v4`, `web-hero-v2`. Bumping gets installed copies to update.
  - **New files:** add any file the game needs to `FILES`.
- **Look:** soft pastel gradients and white-outlined shapes. Fonts are "Trebuchet MS" for UI and "Arial Rounded MT Bold" for big glyphs; ink is `#2b2d5c`; the bright palette is `#ff3b3b #ff9a1f #f5c800 #22b84a #2f7bff #a04dff #ff4fb0`.

## Adding a game (checklist)

1. **Make the folder:** create `<game>/` with `index.html`, the manifest, `sw.js` (new prefix) and icons. Draw the icons with Python PIL, flat shapes on a gradient like the others, and avoid looking like any brand.
2. **Draw the cover:** `<game>/cover.svg`, 800x500, in the same polished style as the existing covers. Render it in the browser and refine it.
3. **Add the home tile:** in `index.html`, copy an `<a class="game">` tile and set `--accent`/`--tint`, the cover, icon, title and a one-line description.
4. **Update the docs:** add the game to `README.md` and to the game notes below. Move its ROADMAP entry to History.
5. **Test** at every size (below), then commit and push.

## Testing

- **Serve locally:** `python3 -m http.server 8777 --bind 127.0.0.1` from the repo root (run it in the background), then open `http://localhost:8777/`.
- **Check every size** in the built-in browser with `resize_window`: phone portrait 375x812, phone landscape 844x390, iPad 768x1024, monitor 1440x900. Reset to `desktop` when done.
- **Simulate play** with dispatched `PointerEvent`s (`pointerdown`/`pointermove`/`pointerup` with `pointerId`, `clientX`, `clientY`). Open the grown-up panel by dispatching `pointerdown` on `#parentBtn` and waiting about 1.7s.
- **Debug hooks:** open a game with `?debug` to get a read-only snapshot. Bubble Pop has `window.__bubblePop()` (Find it target and where those bubbles are). Web Hero has `window.__webHero()` (level, stars, vehicle positions and whether each is knocked) and draws body outlines.
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
- **Clouds:** drawn each frame behind the bubbles (`drawClouds`).

**Magic Paint** (`magic-paint/`)
- **Painting:** a persistent `paint` layer canvas with live effects drawn on top. Drag paints and a short tap (under 300ms, under 12px of movement) stamps. Stamps animate, then bake into the paint layer.
- **Colors:** the rainbow brush advances with distance painted, so it looks the same on fast and slow screens.
- **Color buttons:** DOM buttons, not canvas. A column on the left in portrait, a row across the top in landscape. `settings.brush` is `rainbow`, `crayons` (surprise colors) or a hex color.
- **Hint:** a ghost 👆 hint shows on a blank page.
- **Saving:** the share sheet when `navigator.canShare({files})`, otherwise a download. The saved picture includes the coloring-page lines.
- **Coloring pages** (`settings.page`, `PAGES`): line art drawn in a -1..1 box with helpers `c e p l a` onto an `outline` canvas that sits on top of the paint. `wall` marks line pixels.
- **Tap to fill:** a tap on a page flood-fills the open area (`fillAt`) into an offscreen canvas, which pours in with a growing clip circle, then bakes into the paint.
- **Page placement:** `pageBox()` keeps clear of the color buttons. On resize the page keeps its box so the paint still lines up, unless it no longer fits (then the page is re-placed and the paint cleared).
- **Picture button:** the 🖼️ button in `#palette` cycles `PAGE_ORDER`.

**Little Band** (`little-band/`)
- **Keyboard:** a real keyboard starting at middle C (MIDI 60), 1 or 2 octaves (auto when `range` is 0). Notes hold while the key is down (`startVoice()` returns `{stop}`), and sliding across keys plays a run.
- **Sounds:** `VOICES` holds piano, bells, guitar and horn as additive oscillators with envelopes. `PADS` holds drum and clap.
- **Layout:** portrait keeps keys piano-shaped (`maxKey = ww*6`) with a 2x3 instrument grid; landscape uses one row sharing the top line with the ⚙️.
- **Key colors:** white keys use classroom bell colors (C red to B pink).
- **Songs:** `SONGS` holds MIDI lists within C4–C5. The next key glows with a ⭐ inside it, and wrong keys just play.
- **Beat:** the play-along beat is scheduled ahead on the audio clock (`scheduleBeat`).
- **Record and play:** ● and ▶ are `ctrl` buttons in the instrument row (8 buttons: one row when wide, 2×4 when tall). A take is a list of `{ t, kind, midi, voice, dur, id }`. Keys record on press, and their `dur` is set on release. Playback replays on `setTimeout`s and lights keys through the `ghost` map without moving song steps. There's a 20s cap (`MAX_REC`).

**Web Hero** (`web-hero/`)
- **Built by:** a separate Sonnet session from a written plan.
- **Hero:** original masked kid in a teal suit with a yellow chest star, orange domino mask and yellow cape.
- **Shooting:** pull anywhere to slingshot (a stretchy strand plus 25 aim dots), or tap empty sky to auto-throw a lobbed arc there.
- **Sticky web** (`settings.tap = 'yank'`, the default): tapping a crate or vehicle (`Query.point`) adds a Matter `Constraint` from the wrist to that spot. The web shoots out for 0.12s, reels in hard, and lets go at 0.75s. At most 2 at once.
- **Targets:** vehicles are emoji on Matter bodies, on crate and girder towers.
- **Physics:** Matter.js `Engine.create({ enableSleeping: true })`, stepped at a fixed 1/60s. No Matter.Runner or Matter.Render: everything is drawn by hand.
- **Knocked rule:** a vehicle counts as knocked when it is rotated more than 60°, falls more than its height, leaves the screen, or is pushed more than 0.9 of its width from its start.
- **Levels:** 3 hand-made tutorials, then a seeded generator (same level number and difficulty always gives the same level). Each level settles in a silent 1s physics run and is regenerated if anything falls on its own.
- **Settings:** `{ diff: 'easy'|'medium'|'big', dots, sound, tap: 'yank'|'throw' }`.
- **Juice:** a web trail behind each shot, dust puffs at hard contacts, a small screen shake on big crashes (the HUD doesn't shake), and a row of the level's vehicles under the star counter, ticked off as they fall.
- **Sizing:** `u = max(min(W, H*1.5)/14, min(W/10, H/16))`. The second term stops tall screens from getting a tiny world under a huge sky.
- **Tuning calls:** ball radius about `0.4*unit`, pull cap about `3.5*unit`, ball density 0.016, hero drawn at 1.15x. Big levels use the right 67% of the width.
- **Vehicle facing:** vehicles aren't flipped, so which way they face depends on the emoji font. Only Apple's font has been seen.
