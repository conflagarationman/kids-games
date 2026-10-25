# kids-games

Simple, touch-friendly web games for little kids. Each game is a self-contained folder of static files (no build step) that can be installed to a phone or tablet home screen and works offline.

## Games

- [`bubble-pop/`](bubble-pop/) — **Bubble Pop!** Pop floating bubbles to reveal animals, colors, letters, numbers or shapes, with sounds and a spoken name. Press and hold ⚙️ for 1.5s to open grown-up settings (content, sound/voice, speed).

## Running locally

```bash
python3 -m http.server 8777
```

Then open http://localhost:8777/. Offline support (service worker) only turns on over HTTPS or localhost.

## Live site

Published with GitHub Pages from `main`: https://conflagarationman.github.io/kids-games/
