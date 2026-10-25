# kids-games

Simple, touch-friendly web games for little kids. Each game is a self-contained folder of static files (no build step) that can be installed to a phone or tablet home screen and works offline.

## Games

- [`bubble-pop/`](bubble-pop/) — **Bubble Pop!** Pop floating bubbles to reveal animals, colors, letters, numbers or shapes, with sounds and a spoken name. The sky stays full at any screen size, and now and then a giant bubble bursts into four little ones. Press and hold ⚙️ for 1.5s to open grown-up settings (content, sound/voice, speed).
- [`magic-paint/`](magic-paint/) — **Magic Paint!** Drag to finger paint (every finger at once), tap to drop a wiggling stamp, and pick colors from the big color buttons. A sparkly hint finger shows what to do on a blank page. Grown-up settings: rainbow or surprise colors, show/hide the color buttons, brush size, stamp set, day or glowing night paper, save the picture (share sheet on iPad/iPhone), clear the page.
- [`little-band/`](little-band/) — **Little Band!** A real, playable keyboard (white and black keys, chords, hold to sustain, slide to run up and down). Tap 🎹 🔔 🎸 🎺 to change the keyboard's sound, or the 🥁 and 👏 pads for rhythm. White keys carry classroom bell colors (C red, D orange, E yellow…) so songs can be taught by color. Follow-the-lights songs (Twinkle Twinkle, Mary Had a Little Lamb, Hot Cross Buns, Row Your Boat) put a star on the next key; wrong keys just play. Grown-up settings: song, a play-along beat at three speeds, color dots or note letters on the keys, and 1 or 2 octaves.

All games share the same rules: tap and swipe only, nothing to fail, and settings behind a 1.5s press-and-hold on ⚙️ so little fingers don't open them. Each one is laid out for phones (portrait and landscape), iPads and monitors, and keeps clear of the iPhone notch and home bar when installed to the home screen.

## Running locally

```bash
python3 -m http.server 8777
```

Then open http://localhost:8777/. Offline support (service worker) only turns on over HTTPS or localhost.

## Live site

Published with GitHub Pages from `main`: https://conflagarationman.github.io/kids-games/
