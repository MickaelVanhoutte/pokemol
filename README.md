# Atelier Bestioles: le Rêve de Papeterre

A small FireRed/LeafGreen-style adventure, made from a child's drawings.
Every creature ("Bestiole") is a real pencil drawing, cut out of a photo.

**The story.** The little artist falls asleep on the sketchbook and wakes up in Papeterre, a region
drawn on a giant sheet of paper. Prof. Fusain photographs every Bestiole "so none ever gets lost".
Team Gomme rubs out the scenery and greys out Bestioles for their boss, the Great Eraser: the little
voice that says your drawings aren't good enough. Beat him at the Edge of the Page… and wake up.

- 8 Ateliers (gyms) and badges, Team Gomme hideouts, a rival you name yourself, an ending.
- Classic battles: party of 6, four moves with PP, moves learnt by level-up, types, statuses,
  stat stages, XP, evolution scene. FireRed-style screens drawn on school paper.
- A gentle start (the first trainers have one or two low-level Bestioles) and a difficulty
  option: Easy (weaker trainers that sometimes misplay), Normal, Hard (stronger, higher-level teams).
- Side quests: 12 torn sketchbook pages (memories of the real world), the Tombola at the fair,
  a complete Bestiodex. A Pencil Balloon in every Healing Center flies you to visited towns.
- Girl or boy (French texts agree), French and English, saves in the browser (export/import from
  Options), installable as an app (PWA). On phones, touch the screen anywhere to show the joystick.

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

Controls: arrows/WASD to move, Z/Enter/Space = A, X/Shift = B (hold to run), Esc/M = menu.
On a phone or tablet: touch and slide anywhere to walk (slide far to run), tap = A.

## Add a new drawing

1. Take a photo of the drawing on white paper and put it in `img-source/`.
2. Open the photo in any image viewer and note the pixel box around the creature (`[x0, y0, x1, y1]`).
3. Add an entry to `tools/cards-manifest.json`:
   ```json
   { "id": "012", "slug": "mon-nom", "photo": "photo.jpeg", "box": [100, 200, 900, 1100] }
   ```
   If a neighbour drawing touches it, add `"erase": [[[x, y], [x, y], [x, y], ...]]` polygons (photo pixels).
   Tweak `"options": { "inkLum": 0.8, "inkChroma": 0.11 }` if pale colours disappear.
   Big phone photos: add `"scale": 0.5`. Beige paper or yellow lamp light: add `"paperChroma": 0.26` to `options`.
4. Run `npm run cards -- 012` and check `tools/out/contact-sheet.png` (dark background shows leftover paper).
5. Add the creature to `src/data/creatures.ts` (same `id`/`slug`): name in French and English, type,
   base stats, catch rate, base XP, learnset (`[level, move id]`, moves live in `src/data/moves.ts`),
   evolution level if it evolves, Bestiodex text, and `faces: 'left'` or `'right'` if the drawing looks sideways
   (battles mirror it so both Bestioles face each other).
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
src/story/        story scripts: prologue and act 1, act 2, act 3 + ending, shared ones (healing center…)
src/state/        save data (party, PC box, bag, Bestiodex), screen router
src/ui/           paper kit (windows, notebook text boxes, menus), battle, FRLG views (party, summary, bag,
                  Bestiodex, PC, shop, options, trainer card), pencil battle backdrops, pixel icons
```

## Credits

- Every Bestiole: drawn by the little artist.
- Tiles, sprites, buildings, icons and battle backdrops: drawn in code for this project.
- Fonts: Inter and Jersey 15 (SIL Open Font License), via Fontsource.
- A fan project inspired by the Game Boy Advance pocket-monster games; not affiliated with any brand.
