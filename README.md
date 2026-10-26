# Atelier Bestioles: le Rêve de Papeterre

A small FireRed/LeafGreen-style adventure, made from a child's drawings.
Every creature ("Bestiole") is a real pencil drawing, cut out of a photo.

**The story.** One evening, a little artist falls asleep on the sketchbook and opens their eyes in
Papeterre, a land drawn on a giant sheet of paper where every drawing is alive. Prof. Fusain
photographs every Bestiole "so none ever gets lost", and Team Gomme rubs out the scenery and greys
out Bestioles for their mysterious boss, the Great Eraser. More, still without spoilers, in French and
English: [docs/histoire.md](docs/histoire.md).

- 8 Ateliers (gyms) and badges, Team Gomme hideouts, a rival you name yourself, an ending.
- Classic battles: party of 6, four moves with PP, moves learnt by level-up, types, statuses,
  stat stages, XP, evolution scene. FireRed-style screens drawn on school paper.
- A gentle start (the first trainers have one or two low-level Bestioles) and a difficulty
  option: Easy (weaker trainers that sometimes misplay), Normal, Hard (stronger, higher-level teams).
- Field tools: scissors, foam mallet and strong gloves for bushes, rocks and boulders, a paper
  boat to sail, three fishing rods, a pencil bike; the Bestiodex tells where each Bestiole lives.
- The Pencil Day Care on Route 2: leave two Bestioles to gain XP while you walk; two of one
  family sometimes leave an egg, which hatches as you carry it (inheriting IVs, the hidden talent,
  and the nature of a parent holding the Everstone).
- Friendship (hearts in the summary), evolutions by level, magic pencil or friendship, a Move
  Rememberer and a Move Forgetter in every Inn.
- Collecting: nicknames (and a Calligrapher in every Inn), sparkly Bestioles (1 in 100,
  recoloured drawing with glitter), cries, "met at" notes in the summary, 8 PC boxes, Shoo Spray
  and Ariadne Thread.
- 18 types with dual-type Bestioles, weather (rain, sun, sandstorm, hail), freeze, bad poison,
  shields, two-turn moves, ties, greedy seeds and paper dolls.
- Deeper battles, GBA style: talents (one or two per species plus a hidden one, 1 chance in 4),
  25 natures (+10% / −10%), IVs graded E to S next to each stat in the summary, effort points;
  held items (a Snack that heals each turn, the Stubborn Band/Specs/Scarf, the Fierce Marble, the
  Painter’s Apron, the Spiky Helmet, the Steadfast Ribbon and more, and a coloured pencil for every
  type), eight berries (bushes on routes regrow every day), the Tracing Paper (shares XP),
  battle items (syrups, the Pencil Sharpener, the Protective Varnish) and 12 Pochoirs: stencils that
  teach a move as often as you like, one from each Atelier Master.
- Dungeon puzzles: crayon-barrier switches, glossy paper to slide on, eraser blocks and boulders
  to push onto plates or down holes to the floor below, and fresques (sliding picture puzzles of the
  drawings) hiding secret rooms. A Mémo-Bestioles card game at the fair.
- Your first Bestiole hops along behind you, as a little pixel version of its drawing; talk to it to see
  how it feels (it sometimes finds things). It can be switched off in Options.
- Inns (Auberges) instead of healing centers: the innkeeper lets your Bestioles rest, and the beds let
  you sleep until night or until morning.
- A living world: day and night on the device's clock (or after sleeping at an Inn or at home), with
  Bestioles that only come out at night; a trade in each town; townspeople asking small favours;
  route trainers who want a rematch the next day.
- A music box in the title menu (MUSIQUES) to listen to every original tune.
- A late game with detours and back-and-forth, a cycling track that loops back south, and a cave
  where something breathes in the dark.
- Post-game: the Grand Concours (four Grand Masters and a last surprise opponent in a row, then
  the Hall of Fame) and the Challenge Tower (three Bestioles at level 50, rounds of 7, points to
  trade for items).
- Town Map (Mom gives it at the start, START > CARTE): where you are, and a star on where to go next.
- Side quests: 12 torn sketchbook pages to find, the Tombola at the fair,
  a complete Bestiodex. A Pencil Balloon in every Inn flies you to visited towns.
- Girl or boy (French texts agree), French and English, saves in the browser (export/import from
  Options), installable as an app (PWA: the title screen offers it). On phones, touch the screen
  anywhere to show the joystick.
- Plays offline: the first visit downloads every file in the background. New versions download
  silently too and start the next time the game is opened (Options shows the version and offline state).

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173/pokemol/
npm test           # battle engine, creatures/XP, maps, story wiring
npm run build      # static site in dist/
npm run balance    # simulated trainer fights along the story (win rate per starter)
```

More for contributors (and coding agents): [CLAUDE.md](CLAUDE.md), [docs/story.md](docs/story.md),
[docs/content.md](docs/content.md), [docs/testing.md](docs/testing.md).

Controls: arrows/WASD to move, Z/Enter/Space = A, X/Shift = B (hold to run once Mom gives you the
Zip Sneakers), Esc/M = menu. The game saves when you choose SAUVER (auto-save is an option).
On a phone or tablet: touch and slide anywhere to walk (slide far to run), tap = A.

## Add a new drawing

1. Take a photo of the drawing on white paper and put it in `img-source/`.
2. Open the photo in any image viewer and note the pixel box around the creature (`[x0, y0, x1, y1]`).
3. Add an entry to `tools/cards-manifest.json`:
   ```json
   { "id": "012", "slug": "mon-nom", "photo": "photo.jpeg", "box": [100, 200, 900, 1100] }
   ```
   If a neighbour drawing touches it, add `"erase": [[[x, y], [x, y], [x, y], ...]]` polygons (photo pixels).
   Paper the drawing closes in (between a mane and a neck, say) stays white: add
   `"holes": [[x, y], ...]`, one photo point inside each such area, to make it see-through.
   Tweak `"options": { "inkLum": 0.8, "inkChroma": 0.11 }` if pale colours disappear.
   Big phone photos: add `"scale": 0.5`. Beige paper or yellow lamp light: add `"paperChroma": 0.26` to `options`.
4. Run `npm run cards -- 012` and check `tools/out/contact-sheet.png` (dark background shows leftover paper).
   It also makes the little overworld sprite of the Bestiole that follows you (`public/minis/`; review
   them all with `npm run minis` and `tools/out/minis-sheet.png`).
5. Add the creature to `src/data/creatures.ts` (same `id`/`slug`): name in French and English, type,
   base stats, catch rate, base XP, learnset (`[level, move id]`, moves live in `src/data/moves.ts`),
   evolution level if it evolves, Bestiodex text, talents, and `faces: 'left'` or `'right'` if the drawing
   looks sideways (battles mirror it so both Bestioles face each other). The `id` is only a key: the
   Bestiodex number is the creature's place in the list, so put an evolution right after its earlier form.
6. Put it in a map's `encounters` (`src/data/maps/<area>.ts`) or a trainer party (`src/data/trainers.ts`).
   Every creature can also come out of the Tombola.
7. `npm test`, commit, push: GitHub Pages redeploys.

## Deploy (GitHub Pages)

The workflow in `.github/workflows/deploy.yml` tests, builds and publishes `dist/` on every push to `main`.
In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.
The site is served at `https://<user>.github.io/pokemol/` (the `base` in `vite.config.ts` must match the repo name).

## Project layout

```
tools/            drawing cutout pipeline (sharp) and icon generator
src/art/          cutout algorithm (paper flattening, ink mask, flood fill)
src/data/         creatures, moves, items, badges, sketchbook pages, types chart, trainers, maps/ (one file per area)
src/engine/pk/    pure game logic: creatures/stats/XP, Gen 3–style battle engine, catching, AI (tested)
src/overworld/    canvas engine: hand-painted tiles, sprites, buildings, movement, dialogs, pick-ups
src/story/        story scripts: prologue and act 1, act 2, act 3 + ending, shared ones (healing center…),
                  objective.ts (next step shown on the Town Map)
src/state/        save data (party, PC box, bag, Bestiodex), screen router
src/ui/           paper kit (windows, notebook text boxes, menus), battle, FRLG views (party, summary, bag,
                  Bestiodex, PC, shop, options, trainer card), pencil battle backdrops, pixel icons
```

## Credits

- Every Bestiole: drawn by the little artist.
- Tiles, sprites, buildings, icons and battle backdrops: drawn in code for this project.
- Fonts: Inter and Jersey 15 (SIL Open Font License), via Fontsource.
- A fan project inspired by the Game Boy Advance pocket-monster games; not affiliated with any brand.
