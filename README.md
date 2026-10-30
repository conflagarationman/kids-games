# kids-games

Simple, touch-friendly web games for little kids. Each game is a self-contained folder of static files (no build step) that can be installed to a phone or tablet home screen and works offline. Add the home page itself to the home screen (it installs as "Kids Games") and open it once while online: that saves every game for offline play.

## Games

- [`bubble-pop/`](bubble-pop/) — **Bubble Pop!** Pop floating bubbles to reveal animals, colors, letters, numbers or shapes, with sounds and a spoken name. The sky stays full at any screen size, and now and then a giant bubble bursts into four little ones. **Find it!** mode (for ages 3–4) asks "Pop the red one!" with a picture of what to find; the right pop cheers, a wrong pop just pops, and after a few misses the right bubbles shimmer. **Levels:** every 15 pops (5 finds in Find it) a boss bubble floats in and stays until it is popped by tapping or swiping it (a crowned bubble that cracks, or a silly bubble creature that giggles and goes dizzy), then a short break with a star, and the sky changes (day, sunset, underwater, starry dusk). Press and hold ⚙️ for 1.5s to open grown-up settings (content, Find it, sound/voice, speed, levels and boss taps).
- [`magic-paint/`](magic-paint/) — **Magic Paint!** Drag to finger paint (every finger at once), tap to drop a wiggling stamp, and pick colors from the big color buttons. A sparkly hint finger shows what to do on a blank page. **Coloring pages** (sun, fish, house, car, flower, butterfly, cat, star): tap any shape to pour color into it, and the 🖼️ button flips to the next picture. On iPads and bigger screens every picture sits in a strip down the right side to tap straight to, and each picture keeps its own painting when you switch. Grown-up settings: picture to color, smooth or crayon brush, rainbow or surprise colors, show/hide the color buttons, brush size, stamp set, day or glowing night paper, save the picture (share sheet on iPad/iPhone), clear the page.
- [`little-band/`](little-band/) — **Little Band!** A real, playable keyboard (white and black keys, chords, hold to sustain, slide to run up and down). Tap 🎹 🔔 🎸 🎺 to change the keyboard's sound, or the 🥁 and 👏 pads for rhythm. ● records up to 20 seconds of playing and ▶ plays it back with the keys lighting up. White keys carry classroom bell colors (C red, D orange, E yellow…) so songs can be taught by color. Follow-the-lights songs (Twinkle Twinkle, Mary Had a Little Lamb, Hot Cross Buns, Row Your Boat) put a star on the next key; wrong keys just play. Grown-up settings: song, a play-along beat at three speeds, color dots or note letters on the keys, and 1 or 2 octaves.
- [`web-hero/`](web-hero/) — **Web Hero!** A slingshot game starring an original masked kid hero. Pull back anywhere and let go to shoot a web ball (a dotted arc shows where it will go), or tap a truck or crate and a sticky web zips out and yanks it off the tower (tap empty sky to throw a web ball there). Knock over towers of crates and girders to topple the toy trucks and cars on top: each one honks, bursts into stars and adds to the star counter, and clearing every vehicle builds a new level (three hand-made tutorial levels, then endless generated ones). Physics by [Matter.js](https://brm.io/matter-js/) (MIT, vendored as `matter.min.js` so it works offline). A row under the star counter shows the level's vehicles, ticked off as they fall. Grown-up settings: level size (Easy, Medium, Big), what tapping a piece does (web yank or throw a ball), aim dots on/off, sounds, full screen, skip to the next level.

All games share the same rules: tap and swipe only, nothing to fail, and settings behind a 1.5s press-and-hold on ⚙️ so little fingers don't open them. Each one is laid out for phones (portrait and landscape), iPads and monitors, and keeps clear of the iPhone notch and home bar when installed to the home screen.

### For grown-ups

Press and hold ⚙️ (top right, 1.5s) on the home page or in any game and open **Play time** to set a bedtime limit: Off, a preset (10 to 60 minutes) or any length from 5 to 120 minutes with − and +. One clock counts active play across all the games, and pauses when the screen is off. A small ring beside the ⚙️ empties as time runs down (you can add the minutes, or hide it). In the last 2 minutes it becomes a little moon, the screen warms and dims, and the sound eases down. At zero a "Goodnight!" scene fades in with a soft lullaby, and the game stays asleep until a grown-up adds minutes or starts a new session (press and hold the ⚙️ on that scene). A new day starts a new session on its own after 6 hours away.

Working on this repo? Conventions, testing and deploy steps are in [CLAUDE.md](CLAUDE.md), and the backlog and history are in [ROADMAP.md](ROADMAP.md).

## Running locally

```bash
python3 -m http.server 8777
```

Then open http://localhost:8777/. Offline support (service worker) only turns on over HTTPS or localhost.

## Live site

Published with GitHub Pages from `main`: https://conflagarationman.github.io/kids-games/
