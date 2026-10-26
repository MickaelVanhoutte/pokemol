---
name: new-bestiole
description: Add a new Bestiole (creature) to Atelier Bestioles, from a photo of the little artist's drawing or as a brouillon drawn in code, with balanced stats, catch rate, base XP, a family power, a learnset, places to meet it, tests, sims and docs. Use when the owner brings a new drawing, asks for a new creature or evolution, or replaces a brouillon with a real drawing.
---

# Adding a Bestiole

The rules live in `docs/bestioles.md`; read it first. `src/data/bestioles.test.ts` checks them.
The owner's standing rules (CLAUDE.md) apply: original names only, French then English with `L()`,
drawing photos never leave the machine, phones first, balance with sims, docs updated in the same commit.

## 1. The picture

- **A drawing**: the photo goes in `img-source/` (gitignored, never committed). Add an entry to
  `tools/cards-manifest.json` (crop box, erase polygons; newer phone photos need `scale: 0.5` and
  `paperChroma: 0.26`), run `npm run cards -- <id>`, and check `tools/out/contact-sheet.png` and
  `tools/out/minis-sheet.png` (README "Add a new drawing").
- **A brouillon** (not drawn yet): a module in `tools/drafts/<slug>.ts` listed in `DRAFTS`
  (`tools/drafts/make.ts`), drawn with the kid kit in `tools/drafts/kid.ts`, then `npm run drafts -- <id>`.
  It must look like a quick drawing by a six-year-old: simple shapes, front parts hiding back ones
  (`layered: true`), saturated colours, lines gone over twice. Evolutions need bigger features and a fiercer
  pose than the earlier form. Show the owner the card before going on. Set `draft: true` on the creature.
- **A drawing replacing a brouillon**: same id and slug in the manifest, `npm run cards -- <id>`, remove it
  from `DRAFTS`, drop `draft: true`.

## 2. The model

Pick a gen-1 creature with the same role and stage. Note its base stats, catch rate and base XP. Never use
its name anywhere.

## 3. The entry in `src/data/creatures.ts`

Next free `id` (never renumber), `slug`, `name` and `kind` in French and English, `type` / `type2`,
`base` stats, `catchRate`, `baseExp`, `evYield`, `rarity`, `evolutions` / `evolvesFrom`, Bestiodex text,
`faces` if the drawing looks sideways, `stencils`. Put an evolution right after its earlier form in the list.

- Base-stat total in its band (docs/bestioles.md section 2), keeping the model's spread and role.
- Catch rate and base XP from the model, harder to catch and more XP at each stage.

## 4. The power

Find the family's weak point (a ×4 weakness, weak types, no strong move, low stats) and give it one power:
- a power talent as the only regular talent (`talents: ['<id>']`), with a hidden talent for the 25%; reuse a
  kind from `src/data/talents.ts` with a new name, or add a kind (hook in `battle.ts`, AI in `ai.ts` if it
  changes damage, message in `messages.ts`, `POWER_KINDS` in the rules test, a test in the "family powers"
  block of `src/engine/pk/talents.test.ts`);
- or a signature move in `src/data/moves.ts` (damaging, power 70+ or priority, learned only by this family
  by about level 30).

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
