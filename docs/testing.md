# Testing and shipping

## Unit tests (`npm test`)

Vitest in a node environment, with no DOM. What they guard:

| File | Checks |
|---|---|
| `src/engine/pk/pk.test.ts` | Data completeness (learnsets, type chart), Gen 3 stats with effort points, level-ups and move learning, evolution, damage range, immunities, faints and replacements, catching, items, Struggle, AI-vs-AI fights always end |
| `src/engine/pk/judge.test.ts` | IV grades (E–S) and natures (+10% / −10%, never HP) |
| `src/engine/pk/talents.test.ts` | Every species' talents exist, slots survive evolution, about 1 in 4 hidden, talent effects in battle |
| `src/state/game.test.ts` | Save migration and repair (older versions load without losing anything); the three game slots and each game's own difficulty |
| `src/story/choices.test.ts` | The ending's tally (the final answer counts double, a tie goes to it), Coconfus never evolving by level, finding Coconfus in the party, PC or daycare |
| `src/data/curve.test.ts` | The no-grind level curve down to the Great Eraser: route trainers never ahead of the team, bosses at most five levels above, the team reaching the finale at L42 or more |
| `src/data/maps.test.ts` | Every map has rectangular rows of known tiles; warps land on walkable tiles; NPCs and triggers stand on free tiles; patches stay in bounds; encounters only list known creatures; wild levels never above the weakest trainer's ace on the same map |
| `src/story/story.test.ts` | Every script id a map references exists; every flag a map waits for is set somewhere; `afterScript`s exist |
| `src/data/trainers.test.ts` | Difficulty level shifts and a gentle first two trainers |
| `src/ui/battle/panelMode.test.ts` | Each battle state maps to one panel mode |
| `src/ui/paper/paginate.test.ts` | Text box pagination |
| `src/ui/logic/logic.test.ts` | Bag pockets and item use, PC rules, menu cursor movement |
| `src/audio/music.test.ts` | Note and rest parsing |

## Level curve (`npm run curve`)

`src/data/curve.ts` walks the story path (`CURVE_PATH`) like a player who never grinds:
- they fight every trainer on the way and the wild Bestioles they can't avoid. That is the fewest
  tall-grass steps between a route's way in and way out, or every step in a cave, times the
  encounter rate;
- they catch a teammate where the path says so;
- they share the XP evenly, with the catch-up factor.

`npm run curve [-- difficulty]` prints, for each trainer, its strongest Bestiole next to the team's
levels, and marks the trainers that are ahead. `src/data/curve.test.ts` keeps the Normal curve within
reach up to `CHECKED_UNTIL`, which moves forward as each act's routes are made longer.

## Balance (`npm run balance`)

`tools/balance.ts` simulates trainer fights in story order: the trainer AI plays both sides, with no
items. It prints the win rate for each starter (Minousse / Braisou / Clapotin), with the team the
level curve gives at that point of the story (the starter and its best teammates). Pass a difficulty and a fight count, e.g. `npm run balance -- easy 100`, and optionally
some row ids to run only those: `npm run balance -- normal 300 effaceur,gcFusain`.

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
  `dispatch` resolves when the whole turn has played: call it without awaiting to watch the turn.
- `window.__fx` (while a battle is open): `ids()`, `play(moveId, side)`, `freeze(moveId, 0…1, side,
  charge)` to leave one moment of an animation on screen, `clear()`, `ball(item, shakes, caught)`. Freezing every move at a few
  moments and screenshotting `.pk-scene` gives a contact sheet of all the animations.

Typical setup from the console, after starting a new game:
```js
__ab.update((d) => { d.party = [__ab.createMon('002', 12, { rng: 1 })]; d.flags.rival1 = 1; });
__ab.warpTo({ map: 'atelierPastel', x: 5, y: 4, facing: 'up' });
__ab.trainerBattle('mireille');
```

A new game opens with the falling-asleep scene (`SleepIntroView`, about 19 s): click `.sleepintro` to
skip a beat. Reach the game's modules through these handles rather than `import('/pokemol/src/…')` from the
page: after a hot reload the app imports them with a `?t=` suffix, and a bare import gets a second copy with
its own state (an empty `save`). Saves live in `localStorage` under `atelier-bestioles.save` (game 1),
`atelier-bestioles.save.2` and `.3`.

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
3. Check `git log origin/main` first: other sessions push to `main` too, so rebase on it before
   pushing. Then wait for the Pages workflow (`gh run watch <id> --exit-status`) and check that the
   live bundle contains your change. Every build stamps its time into the bundle (`__APP_BUILD__`),
   so the CI hash never equals your local one. Grep for a string your change added instead:
   ```bash
   JS=$(curl -s https://mickaelvanhoutte.github.io/pokemol/ | grep -oE 'index-[A-Za-z0-9_-]+\.js' | head -1)
   curl -s "https://mickaelvanhoutte.github.io/pokemol/assets/$JS" | grep -c 'some-new-class-or-text'
   ```
4. The PWA never reloads a running game (`registerType: 'prompt'`, `src/state/pwa.ts`). It checks for
   a new version on start, every hour, when the app comes back to the foreground and when the network
   returns. Only the changed files are downloaded, and the new version starts from the title screen,
   which in practice is the next time the game is opened. Options shows the build date
   (`__APP_BUILD__`), whether the game is playable offline, and whether an update is waiting.
