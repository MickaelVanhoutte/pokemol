# Drawing a Bestiole in code

How to turn an approved concept into `tools/redraws/<slug>.ts` quickly, and the traps that cost rounds.

## Setup and commands

- A module exports `{ id, slug, seed, size: [1000, 1000], tilt, draw(c) } satisfies Redraw` and is listed in
  `REDRAWS` (`tools/redraws/make.ts`). Set `faces: 'left'` in
  `src/data/creatures.ts`.
- `npm run redraws -- --preview <slug…>`: draws without touching `public/`. Check `tools/out/redraws-sheet.png`: the
  form before, the new card, battle size, silhouette, mini, and the evolution guard on the label.
- `npm run redraws -- <slug…>`: writes the card, mini and rig. Then `npm run fair -- <slug>` for a final.
- `npm run redraws:review -- <ids…>`: writes `tools/out/review.html` for the owner (publish it as an Artifact).
- `npm run redraws:refs`: the sheet of designs the owner approved (`APPROVED` in `tools/redraws/refs.ts`; add an id
  when the owner praises one).
- Thumbnails: put the variants behind an env var (`const V = process.env.X ?? 'a'`). Render each with `--preview`, copy
  `tools/out/redraws/cards/<id>-<slug>.webp` to the scratchpad, and montage them with PIL. Remove the env var once one
  is picked.
- Tests: `npx vitest run src/data/silhouettes.test.ts src/data/bestioles.test.ts src/data/rigs`, then `npm run typecheck`.

## The crayon kit (`tools/redraws/crayon.ts`)

Drawing order is painting order: what is drawn later covers what came before. Draw from back to front:
1. far limbs;
2. body;
3. markings;
4. near limbs;
5. neck;
6. head;
7. face;
8. blinking lids.

| Call | Draws |
|---|---|
| `shape(pts, col, colour?, line?, round?)` | a coloured shape with its outline; `{ w: 0.1 }` hides the line |
| `stroke(pts, line?, round?)` | a pencil line; `{ w, col }` |
| `tint(pts, col, { wash })` | colour without a line (shading, a pale throat) |
| `paper(pts, line?)` | a white part with its outline (foam, a white mane) |
| `dot(x, y, rx, ry?, col?)` | a filled dot (pupils, nostrils, knots) |
| `potato(x, y, rx, ry, n, wobble)` | points of a lopsided oval |
| `band(spine, w0, w1)` | points of a tapering band along a spine (necks, tails) |
| `spikes(pts, n, h)` | a zig-zag edge |
| `eye(x, y, rx, ry, col?, { lid, skin, tilt })` | a house-style eye; `lid` 0–1 closes it from the top |
| `cheek(x, y, rx, ry, col?)` | a soft cheek |
| `lid(x, y, rx, ry, skin)` | a closed lid, for the `paupieres` blink part |
| `shine(pts, w?)` | a white shine line |
| `part(name, { pivot, motion, amp, period, behind?, extra? }, draw)` | a moving part for the battle rig |

Colour options: `angle` (stroke direction), `over` (second pass across, 0–1), `wash`, `press`, `gap`.

Motions are `flap`, `fold`, `swing`, `nod`, `reach`, `peek`, `throw`, `flicker` and `blink`.
- Keep motions slow and small on big parts: `flicker` jumps in steps and only suits a small flame or spark; a crest or a
  ring that flickers looked « claquée, trop rapide, moche » (Dragobraise). Big parts `swing` 2–3° over 2–3 s.
- `behind: true` puts the part behind the whole body in the rig.
- **In battle a part is layered over the whole body** unless `behind: true`. A part that sits under something on the card
  (a beard under the head, a ruff under the face, the back of a burrow) looks wrong in battle: make it `behind`, split it
  (the back of the burrow `behind`, its front rim a separate part in front), or leave it static. Never give two calls the
  same part name. Check every rig on `tools/out/rigs-sheet.png`. `flicker` makes a part blink on and off: never use it
  on fire or big parts (« trop rapides, flash »).
- `extra: true` draws it last, only in the rig (lids).
- Scenery on the ground (a shadow, a rock, a floe, a burrow, a puddle, a branch it clings to) is `decor: true, behind: true`:
  without `behind` it covers the body in battle and in the fair copy (« la mise au propre de Grognours met le décor
  devant son corps »).
- `decor: true` marks scenery (the wave it surfs, a splash): it stays on the card and in battle, but never on the
  overworld follower (the owner: « la vague qui sert de décor ne devrait pas se retrouver sur le follower »). Put all
  scenery in a `decor` part.

## The anatomy kit (`tools/redraws/anatomy.ts`)

Start from these, never from coordinates out of nowhere:
- `lineOfAction(spine, widths, down)`: body and tail as one outline along a curve, with no seam.
- `openLimb(c, pts, col, from, to)`: a limb filled with no outline, its line drawn only along its outer edge. It
  melts into the body: « ne pas fermer le cercle de sa cuisse ».
- `flankLeg(c, top, foot, col, w)`: a near leg on the flank, a teardrop thigh tapering to a paw.
- `seated(c, x, y, s, fur, deep, chest)`: a four-legged animal sitting up; returns `{ head, tail }`.
- `paw`, `flame`, `jaggedLeaf`.

Proven local helpers to copy from:
- `blade` in `clapoflot.ts`: a sea-turtle flipper, three times longer than wide, pointed, with a bulging front edge.
- `T(p)` in `clapoflot.ts`: tilts a whole body around a point while the ground stays put.
- `scales`, `nails` and `hoop` in `tortorrent.ts`.

Add a piece to `anatomy.ts` when the owner approves a drawing that uses it.

## Expressions (the face table)

| Mood | Eyes | Brows | Mouth |
|---|---|---|---|
| joy, excitement | big pupils with two sparkles, near eye bigger for crazy-happy | raised, arched | wide « D », corners up, tongue tucked |
| fear, panic | white rings, small pupils | tilted up in the middle | open box |
| calm, kind | big round, a sliver of lid at most | none | closed small smile |
| wise, gruff (old) | one squinted shut, the other half-lidded and droopy | one bushy brow | crooked smile, one corner up |
| mischievous | pupils glancing sideways, one lid lower | one brow up | lopsided smile, one fang |
| proud, majestic | open, the pupil looking down along the nose, a bright shine | one firm line, level | closed, firm |
| smug | half-closed, chin up | flat | closed smile, one corner up |
| grumpy | half-lidded | down in the middle | corners down, a pout |
| sleepy | closed arcs | none | small « o » or a drool drop |
| fierce (finals) | narrowed with the shine kept | slanted down to the nose | closed, or two small fangs |

- Heavy lids under a low brow read as sleepy or smug, not calm. Heavy lids on a « majestic » final read as bored
  (« Dragobraise a l'air blasé »).
- **A head in profile shows one eye.** Birds, long snouts and beaks seen from the side hide the far eye behind the
  bridge of the beak or snout; two eyes side by side on a profile head look wrong (Faucardoise: « il a ses 2 yeux sur
  le même profil »; its dark cheek stripe was fine and stays). Only a three-quarter face shows the far eye, smaller.
- A grey eye fill reads as a black eye: keep pupils dark navy (`#241c38` to `#3a3050`).

## Bodies that read

- **A neck**: a head sits on a neck or chest, never floats. Narrow the neck to about half the head's width where they
  meet. A neck as wide as the head is a chimney under a lid.
- **Legs**:
  - near legs start on the flank or under the shell's rim, thick at the top and tapering, then flare into a foot;
  - far legs are darker and half hidden;
  - never four equal posts (« a table »);
  - never out of the belly (« sort du ventre »);
  - never a band laid on the flank (« a plank »);
  - no round mass on the joint (« a puppet joint »).
- **Know the animal**:
  - a turtle's head and legs come out of the shell's openings, between dome and plastron;
  - sea turtles have long pointed flippers, not paddles;
  - feet point the way they really do.
- **A lifted leg** shows thigh, knee and shin, and its sole hovers with a gap over what it stamps.
- **A tilted pose**: rotate the body with a `T()` helper around its centre; keep the ground, the water and the face
  where you want them in page coordinates.
- **Keep 40 px clear of the canvas edge**: anything past it is cut off.
- When the critic gives coordinates from the trimmed card, convert them to canvas coordinates first. Find the scale and
  offset from two known points (a head centre, a foot).

## What reads as what (traps from the owner's and the critic's rounds)

| You drew | It read as |
|---|---|
| a pale stripe along a tail | a second tail |
| puffs behind a rump | droppings |
| a hood pattern | a second face |
| a flipper or limb flung up behind the head | a horn, an ear, a dorsal fin |
| rounded paddles, blunt lobes | mittens, gloves |
| a flat flipper under the chin | a second jaw, lying on its arm |
| a tall pale column with a hooked top | a ghost, a sock, a candy cane |
| evenly spaced splash points with balls on top | a royal crown |
| thin separate splash tufts | grass |
| a short brown cylinder in the mouth | a cigar (never, in a children's game) |
| white blobs under a chin | a bib, pebbles, teeth |
| a white patch on the forehead | a bandage |
| black pebble nails | stones |
| a plain triangle behind the shell | a shark fin |
| an empty oval on a shell | a hole |
| a dark arc high on a dome | a seam |
| water in the same blue as the skin | nothing (it melts in) |

## Action without clutter

- Speed: two or three speed lines behind, a rooster tail of spray.
- Impact: one irregular splash (outer sheets tallest, curling outward), a ripple ring.
- Balance: the rear lifting off with a gap under it, one limb flung out wide.
- Calm: ripples round the feet, a habit (chewing a stalk), a slow idle motion in the rig.
