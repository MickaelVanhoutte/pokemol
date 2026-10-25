# Atelier Bestioles

A small Game Boy–style adventure and roguelike card game, made from a child's drawings.
Every creature ("Bestiole") is a real pencil drawing, cut out of a photo and turned into a card.

- Explore a pixel-art world (town, lab, route, city, misty woods), FireRed/LeafGreen style.
- Get your first card from Prof. Fusain, fight trainers, catch wild Bestioles with Blank Cards.
- Card battles: a team of up to 4 creature cards plus a deck of support cards.
- Roguelike dungeons (Grotte Gribouillis, Tour Brumeuse) with branching maps, talismans and bosses.
- Summons (gacha) with Glitter earned in game — no real money, ever.
- French and English, saves in the browser (export/import from Options), installable as an app (PWA).

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173/pokemol/
npm test           # battle engine, maps, gacha, dungeon generator
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
5. Add the creature to `src/data/creatures.ts` (same `id`/`slug`): name in French and English, type, HP,
   two attacks (cost, damage, effects, text), weakness, flavor text, rarity.
6. Optionally put it in a map's `encounters` (`src/data/maps.ts`) or a dungeon `pool` (`src/data/dungeons.ts`).
   Every creature is automatically in the summon pool.
7. `npm test`, commit, push: GitHub Pages redeploys.

## Deploy (GitHub Pages)

The workflow in `.github/workflows/deploy.yml` tests, builds and publishes `dist/` on every push to `main`.
In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.
The site is served at `https://<user>.github.io/pokemol/` (the `base` in `vite.config.ts` must match the repo name).

## Project layout

```
tools/            drawing cutout pipeline (sharp) and icon generator
src/art/          cutout algorithm (paper flattening, ink mask, flood fill)
src/data/         creatures, support cards, talismans, trainers, maps, dungeons
src/engine/       pure game logic: battle engine + AI, dungeon map, gacha, progression (tested)
src/overworld/    canvas engine: hand-painted tiles, sprites, buildings, movement, dialogs
src/story/        story scripts (intro, lab, rival, healing center, dungeon gates…)
src/state/        save data, dungeon runs, screen router
src/ui/           cards, battle screen, menus, shop, summons, collection, dungeon map
```

## Credits

- Every Bestiole: drawn by the little artist.
- Tiles, sprites and buildings: pixel art painted in code for this project.
- Fonts: Inter and Pixelify Sans (SIL Open Font License), via Fontsource.
- A fan project inspired by pocket-monster games and roguelike deck-builders; not affiliated with any brand.
