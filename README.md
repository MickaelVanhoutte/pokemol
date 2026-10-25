# Atelier Bestioles

A small FireRed/LeafGreen-style adventure, made from a child's drawings.
Every creature ("Bestiole") is a real pencil drawing, cut out of a photo.

- Explore a pixel-art world drawn in code: town, lab, routes, city, misty woods, a cave and a tower.
- Get your first Bestiole from Prof. Fusain, fight trainers, catch wild Bestioles with Crayon-balls.
- Classic battles: party of 6, four moves with PP, moves learnt by level-up, types and weaknesses,
  statuses (sleep, paralysis, poison, burn, confusion), stat stages, XP and evolution.
- Healing Center, PC storage, shop, Bestiodex, and a creature machine that draws a surprise Bestiole for coins.
- Two badges (Grotte Gribouillis, Tour Brumeuse) and a final rival battle.
- French and English, saves in the browser (export/import from Options), installable as an app (PWA).

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173/pokemol/
npm test           # battle engine, creatures/XP, maps
npm run build      # static site in dist/
```

Controls: arrows/WASD to move, Z/Enter/Space = A, X/Shift = B (hold to run), Esc/M = menu.
On a phone or tablet an on-screen D-pad appears.

## Add a new drawing

1. Take a photo of the drawing on white paper and put it in `img-source/`.
2. Open the photo in any image viewer and note the pixel box around the creature (`[x0, y0, x1, y1]`).
3. Add an entry to `tools/cards-manifest.json`:
   ```json
   { "id": "012", "slug": "mon-nom", "photo": "photo.jpeg", "box": [100, 200, 900, 1100] }
   ```
   If a neighbour drawing touches it, add `"erase": [[[x, y], [x, y], [x, y], ...]]` polygons (photo pixels).
   Tweak `"options": { "inkLum": 0.8, "inkChroma": 0.11 }` if pale colours disappear.
4. Run `npm run cards -- 012` and check `tools/out/contact-sheet.png` (dark background shows leftover paper).
5. Add the creature to `src/data/creatures.ts` (same `id`/`slug`): name in French and English, type,
   base stats, catch rate, base XP, learnset (`[level, move id]`, moves live in `src/data/moves.ts`),
   evolution level if it evolves, Bestiodex text.
6. Put it in a map's `encounters` (`src/data/maps.ts`) or a trainer party (`src/data/trainers.ts`).
   Every creature can also come out of the creature machine.
7. `npm test`, commit, push: GitHub Pages redeploys.

## Deploy (GitHub Pages)

The workflow in `.github/workflows/deploy.yml` tests, builds and publishes `dist/` on every push to `main`.
In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.
The site is served at `https://<user>.github.io/pokemol/` (the `base` in `vite.config.ts` must match the repo name).

## Project layout

```
tools/            drawing cutout pipeline (sharp) and icon generator
src/art/          cutout algorithm (paper flattening, ink mask, flood fill)
src/data/         creatures, moves, items, types chart, trainers, maps
src/engine/pk/    pure game logic: creatures/stats/XP, Gen 3–style battle engine, catching, AI (tested)
src/overworld/    canvas engine: hand-painted tiles, sprites, buildings, movement, dialogs, pick-ups
src/story/        story scripts (intro, lab, rival, healing center, tower gate, final rival…)
src/state/        save data (party, PC box, bag, Bestiodex), screen router
src/ui/           battle screen, party, summary, bag, Bestiodex, PC, shop, creature machine
```

## Credits

- Every Bestiole: drawn by the little artist.
- Tiles, sprites and buildings: pixel art painted in code for this project.
- Fonts: Inter and Pixelify Sans (SIL Open Font License), via Fontsource.
- A fan project inspired by the Game Boy Advance pocket-monster games; not affiliated with any brand.
