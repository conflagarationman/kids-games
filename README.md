# kids-games

Simple, touch-friendly web games for little kids. Each game is a self-contained folder of static files (no build step) that can be installed to a phone or tablet home screen and works offline.

## Games

- [`bubble-pop/`](bubble-pop/) — **Bubble Pop!** Pop floating bubbles to reveal animals, colors, letters, numbers or shapes, with sounds and a spoken name. Press and hold ⚙️ for 1.5s to open grown-up settings (content, sound/voice, speed).
- [`magic-paint/`](magic-paint/) — **Magic Paint!** Drag to finger paint (every finger at once), tap to drop a wiggling stamp. Grown-up settings: rainbow or crayon colors, stamp set, day or glowing night paper, save the picture, clear the page.
- [`little-band/`](little-band/) — **Little Band!** Six animal musicians (piano, drums, bells, bass, horn, shaker). Tap or swipe across them to play; every note is in the same five-note scale, so nothing sounds wrong. Grown-up settings: a play-along beat at three speeds, and a 4-friend band for little ones.

All games share the same rules: tap and swipe only, nothing to fail, and settings behind a 1.5s press-and-hold on ⚙️ so little fingers don't open them.

## Running locally

```bash
python3 -m http.server 8777
```

Then open http://localhost:8777/. Offline support (service worker) only turns on over HTTPS or localhost.

## Live site

Published with GitHub Pages from `main`: https://conflagarationman.github.io/kids-games/
