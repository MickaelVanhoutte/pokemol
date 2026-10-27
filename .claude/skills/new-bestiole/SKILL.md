---
name: new-bestiole
description: Add a new Bestiole (creature) to Atelier Bestioles, drawn in code in the little artist's style (from one of her drawings or not), with balanced stats, catch rate, base XP, a family power, a learnset, places to meet it, tests, sims and docs. Use when the owner brings a new drawing, asks for a new creature or evolution, or replaces a brouillon with a real drawing.
---

# Adding a Bestiole

The rules live in `docs/bestioles.md`; read it first. `src/data/bestioles.test.ts` checks them.
The owner's standing rules (CLAUDE.md) apply: original names only, French then English with `L()`,
drawing photos never leave the machine, phones first, balance with sims, docs updated in the same commit.

## 1. The picture

Every Bestiole is drawn in code in the little artist's style; she no longer has to draw them.
- **If she drew it**: her drawing is the original. The photo goes in `img-source/` (gitignored, never
  committed). Add an entry to `tools/cards-manifest.json` (crop box, erase polygons; newer phone photos need
  `scale: 0.5` and `paperChroma: 0.26`), run `npm run cards -- <id>` (writes `public/originals/`), check
  `tools/out/contact-sheet.png`, and add the id to `ORIGINALS` in `src/data/originals.ts`.
- **Draw it in her style**: a module in `tools/redraws/<slug>.ts` listed in `REDRAWS`
  (`tools/redraws/make.ts`), drawn with the `crayon` kit (`tools/redraws/crayon.ts`): lopsided shapes,
  stick legs, zig-zag fur, oval eyes, dense coloured-pencil colouring that runs over one wobbly line.
  Ask the owner what inspired it and keep its signature features (a bulb on the back, a flame on the tail…):
  her drawings don't always show them. Then `npm run redraws -- <id>` and check
  `tools/out/redraws-sheet.png` (her drawing, the redraw, battle size, miniature). Show the owner the sheet
  before going on. Draw it in three-quarter view turned to the left, never straight from the front (it looks
  silly in battle), and set `faces: 'left'`: battles mirror it so both Bestioles face each other.
- An evolution is never a recolour of its earlier form. First forms are cute and simple; evolved forms are
  bigger, more complex and more impressive: a new silhouette, new features (vines, horns, quills, cuffs…), a
  fiercer pose. Put the whole line side by side on the sheet before showing it.
- The 26 *brouillons* of `tools/drafts` (`draft: true`) are the rough kit; don't add new ones there.

## 2. The model

Pick a gen-1 creature with the same role and stage. Note its base stats, catch rate and base XP. Never use
its name anywhere.

## 3. The entry in `src/data/creatures.ts`

Next free `id` (never renumber), `slug`, `name` and `kind` in French and English, `type` / `type2`,
`base` stats, `catchRate`, `baseExp`, `evYield`, `rarity`, `evolutions` / `evolvesFrom`, Bestiodex text,
`faces` if the drawing looks sideways, `stencils`. Put an evolution right after its earlier form in the list.

- Base-stat total in its band (docs/bestioles.md section 2), keeping the model's spread and role.
- Catch rate and base XP from the model, harder to catch and more XP at each stage.
- An evolution only the story triggers uses `{ to, story: 1 | 2 }` (Coconfus at the ending): it never
  fires by level. Legendaries and their cocoon (`rarity: 'legendary'`) never come out of the Tombola machine.

## 4. The power

Find the family's weak point (a ×4 weakness, weak types, no strong move, low stats) and give it one power:
- a power talent as the only regular talent (`talents: ['<id>']`), with a hidden talent for the 25%; reuse a
  kind from `src/data/talents.ts` with a new name, or add a kind (hook in `battle.ts`, AI in `ai.ts` if it
  changes damage, message in `messages.ts`, `POWER_KINDS` in the rules test, a test in the "family powers"
  block of `src/engine/pk/talents.test.ts`);
- or a signature move in `src/data/moves.ts` (damaging, power 70+ or priority, learned only by this family
  by about level 30), with its animation in `src/ui/battle/fx/recipes.ts` (docs/content.md, "Moves").

An evolution joins its family's power: same talents (same number of them), or the same signature move.

## 5. The learnset

- weak moves first: no 80-power move before level 19;
- a final form gets a same-type move of power 80+ by level 40 and a coverage move by about level 35;
- a level-0 entry is learned on evolving.

## 6. Where to meet it

- an `encounters` table on a map where its level fits the story (`src/data/maps/<area>.ts`), weighted by
  rarity; day-only or night-only if it suits it;
- one or two trainers near there (`src/data/trainers.ts`), and the Concours or tower if it is a strong final
  (`TOWER_POOL` in `src/data/postgame.ts`).

## 7. Check

```bash
npm test
npm run typecheck
npm run balance -- normal 300 <rows of trainers that use it>
npm run balance -- easy 300
npm run balance -- hard 300
```

Compare with the numbers before the change. Act 1 stays gentle, leaders sit around 40–90% on Normal, the
finale and the Concours champion around 50–75%. Retune a team (levels, items) if a row moves by more than
about 10 points, or soften the power if it swings many rows.

Then a headless playtest on a phone size (docs/testing.md): the card in the Bestiodex, the summary with its
talent, a battle using its power.

## 8. Docs, commit, deploy

- `docs/story.md`: where it lives, who uses it, balance notes;
- `docs/bestioles.md`: its power in the table;
- `docs/histoire.md` (French and English, no spoilers: no evolution names, no legendaries) if it changes
  what a player meets;
- commit with the noreply email, fetch and rebase, push, then check the live bundle (docs/testing.md).
