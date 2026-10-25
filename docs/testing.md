# Testing and shipping

## Unit tests (`npm test`)

Vitest in a node environment, with no DOM. What they guard:

| File | Checks |
|---|---|
| `src/engine/pk/pk.test.ts` | Data completeness (learnsets, type chart), Gen 3 stats, level-ups and move learning, evolution, damage range, immunities, faints and replacements, catching, items, Struggle, AI-vs-AI fights always end |
| `src/data/maps.test.ts` | Every map has rectangular rows of known tiles; warps land on walkable tiles; NPCs and triggers stand on free tiles; patches stay in bounds; encounters only list known creatures |
| `src/story/story.test.ts` | Every script id a map references exists; every flag a map waits for is set somewhere; `afterScript`s exist |
| `src/data/trainers.test.ts` | Difficulty level shifts and a gentle first two trainers |
| `src/ui/battle/panelMode.test.ts` | Each battle state maps to one panel mode |
| `src/ui/paper/paginate.test.ts` | Text box pagination |
| `src/ui/logic/logic.test.ts` | Bag pockets and item use, PC rules, menu cursor movement |
| `src/audio/music.test.ts` | Note and rest parsing |

## Balance (`npm run balance`)

`tools/balance.ts` simulates trainer fights in story order: the trainer AI plays both sides, with no
items. It prints the win rate for each starter (Minousse / Braisou / Clapotin) with a typical team for
that point of the story. Pass a difficulty and a fight count, e.g. `npm run balance -- easy 100`.

Run it before and after any change to levels, teams, stats, learnsets or the type chart. Numbers
depend heavily on the team used, so compare runs rather than chasing exact values. For quick
what-ifs, copy it to `tools/out/` (gitignored) and edit freely.

## Playtesting in a browser

`npm run dev` serves http://localhost:5173/pokemol/. In dev builds two console handles exist:

- `window.__ab`:
  - `save`, `update(fn)`, `flag`, `setFlag`;
  - `warpTo({ map, x, y, facing })`, `runScript(id)`, `scripts`, `refreshMap()`;
  - `dialog` / `closeDialog()`, `monOverlay`, `screen`;
  - `fight(...)`, `trainerBattle(id)`, `createMon(species, level, { rng })`, `checkEvolutions()`.
- `window.__battle` (while a battle is open): `dispatch(action)`, `state()`, `speed`.

Typical setup from the console, after starting a new game:
```js
__ab.update((d) => { d.party = [__ab.createMon('002', 12, { rng: 1 })]; d.flags.rival1 = 1; });
__ab.warpTo({ map: 'atelierPastel', x: 5, y: 4, facing: 'up' });
__ab.trainerBattle('mireille');
```

Don't `await` a script promise from a page-evaluate call: scripts wait for dialog input, so the call
deadlocks. Start the script, then close dialogs in a loop
(`__ab.dialog.value && __ab.closeDialog()`).

**Phone checks.** Screenshot these sizes:
- 360×740 and 412×870, at 100% and 130% root font (`document.documentElement.style.fontSize = '130%'`);
- landscape 740×360.

Watch for text overflowing its box, the battle panel height changing between modes, and menus cut
off in landscape.

The desktop app's browser pane is often hidden, so headless Chrome is the reliable way. Install
puppeteer-core in a scratch folder (it is not a project dependency) and point it at the local Chrome:

```js
import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--autoplay-policy=no-user-gesture-required'],
});
const page = await browser.newPage();
await page.setViewport({ width: 360, height: 740, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await page.goto('http://localhost:5173/pokemol/', { waitUntil: 'networkidle0' });
// click through the title, play the prologue, then drive the game with page.evaluate(() => window.__ab…)
await page.screenshot({ path: 'shot.png' });
```

## Shipping

1. `npm test` and `npm run build`. The build runs `tsc`, which also checks `tools/`.
2. Commit with `git -c user.email=51904030+MickaelVanhoutte@users.noreply.github.com commit …`, then
   push `main`.
3. Wait for the Pages workflow (`gh run watch <id> --exit-status`), then check that the live bundle is
   the one you built:
   ```bash
   ls dist/assets | grep -E '^index-.*\.js$'
   curl -s https://mickaelvanhoutte.github.io/pokemol/ | grep -oE 'index-[A-Za-z0-9_-]+\.js' | head -1
   ```
4. The PWA updates itself (`registerType: 'autoUpdate'`). A phone may need one reload to pick up the
   new version.
