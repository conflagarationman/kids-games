# Roadmap

What's next, what's still unverified, and how we got here. Conventions and how-to live in [CLAUDE.md](CLAUDE.md).

## Needs checking on a real device

Sessions can only test in a desktop preview browser with simulated touches and no speakers. Still unverified:

- **Sound in every game:** do Little Band's piano, bells, guitar, horn, drum, clap and beat sound good? Is Web Hero's thwip, honk and thud loud enough? Are volumes balanced across games?
- **Web Hero with a 4-year-old:** is pull-to-shoot learnable, is tap-to-throw obvious, and is Easy easy enough? Watch for levels that are too hard to clear.
- **Home-screen installs on iPhone and iPad:** the ⚙️ should sit clear of the status bar, offline play should work, and Magic Paint's Save should open the share sheet.
- **Emoji fonts:** emoji look different on Android and Windows, especially which way Web Hero's vehicles face.

## Backlog: ideas not built yet

Roughly in priority order. None are committed to. Check with the owner before starting one.

1. **Web Hero v2: sticky-web yank.** A second shot type where the web sticks to a crate or vehicle and yanks it over. This is the most "web-slinger" part of the original idea.
2. **Web Hero v2: rescue mini-levels.** Web a falling kitten or ice cream before it lands, for variety between tower levels.
3. **Web Hero: choice of hero,** a few original color and suit variants.
4. **Bubble Pop "find it" mode** for ages 3–4. "Pop the red one!" is spoken; the right bubble cheers, a wrong one gently shows the right answer. Off by default, since it has right and wrong answers.
5. **Magic Paint coloring pages:** simple outlines (an animal, a house) to paint inside, as an option beside the blank page.
6. **Little Band recording:** a big ● button that records about 10 seconds of playing and plays it back.
7. **Shared grown-up settings:** sound on or off and an optional play-time limit, set once on the home page and read by every game.
8. **Where's the Cow?** A listening and vocabulary game for ages 3–4: animals shown, "Can you find the cow?" asked. Ranked lower because it overlaps Bubble Pop and has right and wrong answers.

## Research notes (why the games are built the way they are)

- **Tapping is easiest:** tapping is the most intuitive gesture for preschoolers. Pinching and flicking are hard. Kids rest their wrists on a tablet's bottom edge and trigger anything placed there. Make interactive things look distinct, and give encouraging feedback even on wrong answers.
  [Sesame Workshop, touch screen tips](https://licensinginternational.org/news/sesame-workshop-shares-tips-for-creating-touch-screen-content-for-preschoolers), [Joan Ganz Cooney Center, best practices](https://joanganzcooneycenter.org/?p=19607)
- **Some gestures need care:** 2–3 year olds can manage more than tap and drag (one-finger rotate, two-finger scale up). Double tap, long press, scale down and two-finger rotate cause problems.
  [Multi-touch gestures for pre-kindergarten children](https://ubmr.hds.hebis.de/EdsRecord/edscal%252Cedscal.28891981)
- **Drags break:** under 5, kids often lose contact during drag-and-drop, so prefer tap-and-tap. They are also slow to notice activation and hold touches too long. Avoid double tap, which is a learned interaction.
  [Design Considerations for Little Fingers](https://uxdesign.cc/design-considerations-for-little-fingers-ad2a19ed3816)
- **Toys, not tests:** the best toddler apps are "digital toys" with no levels, no instructions, no winning or losing, and the kid leading. Sago Mini removed a narrator and kids started talking instead of listening passively.
  [Sago Sago on the preschool market](https://kidscreen.com/2015/04/09/sago-sago-dishes-on-developing-for-the-preschool-market)
- **What's popular:** early literacy, counting and shapes, creative play (drawing and music) and character mini-game collections.
  [Common Sense Media, best preschool apps](https://www.commonsensemedia.org/es/node/86253)

## History

- **Bubble Pop:** built in a Claude session on the owner's Linux machine and served from it over Tailscale (a plain Python file server on port 8777). That session broke before pushing anything, so the site was downloaded and committed unchanged. Linux beast's copy is now out of date; GitHub is the source of truth.
- **GitHub Pages:** turned on from `main` root, with a home page of game tiles.
- **Magic Paint and Little Band:** added after research picked open-ended creative play and music as the best companions to Bubble Pop. Little Band started as six animal musicians on a pentatonic scale; the owner asked for "just the instruments" and a real piano, so it became a playable keyboard.
- **Review pass at four screen sizes:**
  - **Bubble Pop:** denser bubbles (the owner's request), a fixed left-side spawn bias, and giant bubbles.
  - **Magic Paint:** kid color buttons, a blank-page hint, brush size, and save via the share sheet.
  - **Little Band:** a portrait layout and follow-the-lights songs.
  - **All games:** safe-area insets and the emoji transparency fix.
- **Illustrated covers:** an SVG cover for every game and a redesigned home page.
- **Web Hero:** the owner wanted a slingshot game in the style of Spider-Man web shooters and Angry Birds for their 4-year-old, with trucks and cars as targets. It was made with an original masked-kid hero, for trademark reasons. Built from a written plan by a separate Sonnet session; v1 is knock-down only.
