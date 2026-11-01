---
name: bestiole-design
description: Design and draw a Bestiole (a new one, a redesign of an early one, or a whole evolution line) fast and to the owner's taste - personality first, then concept, silhouette, shapes, colours, face, family ladder, the house style, drawing it in code with the crayon kit, the critic and the owner's review. Use before any drawing in tools/redraws, and whenever the owner sends a design back.
---

# Designing a Bestiole

A Bestiole works or fails in its design, before the drawing: who it is, what it does, its shadow, its shapes, its
colours, its face, its family. This skill holds all of it, so a whole family can go from brief to approved in one
sitting instead of an evening per creature.

Where it comes from:
- a study of the first 251 creatures of the classic monster games: what makes them simple, unique and loved (local
  notes, never published: `tools/out/design-study.md`);
- how the studio behind those games designs its creatures (the process below), and a fan study of what their good
  designs share (section 1b);
- every review round with the owner (`reference/owner-taste.md`).

Files beside this one:
- `reference/drawing.md`: drawing it in code (crayon kit, anatomy kit, expressions, pitfalls).
- `reference/critic.md`: the critic brief.
- `reference/owner-taste.md`: what the owner loved and refused, and why.

Numbers, talent, moves and places are in the `new-bestiole` skill; the rules test is `src/data/bestioles.test.ts`.

**Never name or copy a creature of those games anywhere in the repo** (it is public). Learn the principles, design our
own, and leave the model behind (« tu dois te détacher des monstres originaux »).

## The pipeline (do it in this order, a whole family at a time)

| Step | What | Who decides |
|---|---|---|
| 1. Brief | the family's role, types, stats, talent, Bestiodex text, her drawing if any, where it lives | you, 5 minutes |
| 2. Concept cards | 3 cards per family, **personality first** (section 1) | the owner picks one |
| 3. Thumbnails | 3 quick poses per form that changes body plan, rendered with `--preview` | you pick, the critic checks |
| 4. Direction check | one image per batch: the chosen thumbnails, family side by side | the owner: « oui / non » |
| 5. Finish | draw it properly (`reference/drawing.md`), machine checks | you |
| 6. Critic | a fresh agent scores it (`reference/critic.md`), **at most 3 rounds** | the critic |
| 7. Review | the batch on the review page (`npm run redraws:review`), published as an Artifact | the owner names the bad ones |
| 8. Learn | every refusal becomes a rule in `reference/owner-taste.md` before redrawing | you |

Rules of the pipeline:
- **Personality is decided before anything is drawn**, and the owner picks it. The turtles passed every check three
  times and were refused in one look: « Aucune personnalité, vraiment pas envie de jouer ça dans mon jeu ».
- **Direction before polish.** A rough thumbnail sheet costs the owner ten seconds and saves ten critic rounds (the
  owner liked Clapoflot's posture the moment it was shown). Show a direction check only as one batch image, never one
  creature at a time, and say plainly it is a sketch.
- **Cap the critic at three rounds.** If it still fails, the concept or the pose is wrong, not the details: go back to
  step 2 or 3. Thirteen rounds of fixing details made the turtles cleaner, not better.
- **Never redraw a design the owner already likes.** Keep what they praised (a posture, a face) when fixing the rest.
- Commit only what the owner approved, with the noreply email; push nothing until the whole wave is approved.

## 1. Personality first

Every loved creature can be said as an attitude in one word and shown in one gesture. Pick this first; everything else
serves it.

**The personality card** (one per form; each form of a line has its own, the family keeps a thread):
- **Trait**: one word a child understands: daredevil, old captain, show-off, grump, sleepyhead, thief, worrier,
  clown, guardian, diva, glutton, scaredy-cat, bossy, dreamy.
- **Expression**: how the face shows it (section 6 and the table in `reference/drawing.md`).
- **Gesture**: the one thing the body is doing that shows it: diving nose first, a foot up on a rock, sitting smugly on
  its loot, drumming, peeking, yawning, showing off a muscle.
- **Habit or prop**: at most one, part of the story: a pencil it stole, a grass stalk it chews. Grown or held, never
  worn (no hats, scarves, belts, bandanas).
- **Flaw**: the « keep the balance » touch that makes it lovable: the fierce one blushes, the sweet one has a fang,
  the hero is a bit too fast and nearly falls.

A family's personalities grow like a person: the baby is cheeky or sweet, the teen is reckless or moody, the adult is
calm, proud or gruff. Same thread (the joker stays funny), new age.

What failed: reusing the first form's cute face (big round eyes, open smile, blush) on every form; « calm » shown as
a neutral face on a still body. Calm needs a pose and a habit too (the old captain eyeing you down its nose).

## 1b. Seven tests of a good design

From a fan study of what the classic designs share. A concept card must pass all seven:
1. **Cool or interesting, ideally both.** Cool means slick and striking. Interesting means it has depth: a story, a
   reveal along the line, a reason behind its look.
2. **A new species, not a cartoon of a real animal.** Start from the animal, then reshape its parts so it looks like
   something you could only meet in Papeterre: a turtle whose shell is a drum, not a turtle with a drum.
3. **Natural**: it fits its place so well you could bump into it there (the pond, the paper mill, the inkwell cave),
   even when it is odd.
4. **Its inspirations are subtle and integrated.** Take attributes from the idea and grow them on the animal, rather
   than gluing two things together: the scarf is its tongue, the drum's lacing is its shell's rim. This is why a
   twist grows from the body and is never worn.
5. **You could be its friend**, even when it is huge or fierce. Give it a readable personality, an endearing flaw,
   rounder shapes on a tough one.
6. **It looks able to live on its own**, even when cute: alert, sturdy, doing something. Only a deliberate baby form
   may look helpless.
7. **You can see how it fights**: its exceptional attribute (shield, weapon, trick) reads at a glance, matching its
   stats and talent.

And four drawing rules from the same study:
- **Stylised**: draw distinct, easy shapes, never a realistic portrait of the animal.
- **Vibrant colours**: saturated and distinctive, never bland.
- **Contrast leads the eye** to the point of interest (the face, the twist): put the strongest value contrast there.
- **Colour balances the drawing**: break a big flat area with one small marking (a band, a line, a patch of the
  accent), and calm a busy area with one plain colour.

## 2. The concept card

Show three cards per family with AskUserQuestion, one question per family, two lines per option. Each card:
- **Personality** (section 1): trait + gesture for each form.
- **Base**: one real animal a child knows and can name. Animals, not objects (an object can be one feature on the
  animal). Mix two sources at most.
- **The one twist**, said as a verb: it carries, it hides, it drools, it surfs, it keeps time.
  - It shows the **type** (a flame at the tail tip, a shell that is a drum) or a **behaviour** (always sleepy). The
    best do both: the flame that flares when it is scared.
  - It **grows from its body** or is what it does; never worn.
  - One twist. A second idea is a second Bestiole.
- **How does it fight?** (the owner's question) What exceptional attribute lets it stand up to other Bestioles: a
  weapon, a defence, a trick? Read its stats, talent and signature moves (`src/data/creatures.ts`,
  `src/data/talents.ts`) and make that attribute **visible and big** on the body. A tank shows its shield, a striker
  its weapon, a trickster its trick. Its battle animation can then use it.
- **Why it looks like that**: treat it as a living creature. Where it lives in Papeterre (which map), what it eats, and
  why the twist exists (the shell became a drum because it calls the pond to gather). This makes choices for you.
- **Tiny story**: one sentence a six-year-old could retell, with a cause, a habit, a friend or a reversal.
- **Silhouette in five words**: « turtle diving down a wave ».
- **Shapes per form**: round, then mixed, then angular or heavy (section 3).
- **Colours**: main, belly, one accent (section 5).
- **Name** (French and English), only if the old one describes the model.
- **Check**:
  - no other Bestiole uses that animal: `grep "kind: L" src/data/creatures.ts`;
  - it doesn't carry over the model's gimmick (three magnets as three bugs is still the model);
  - its stats and talent fit the body: a slow tank is wide and low, a fast striker is slim and leaning forward.

Designs start from a need, not a blank page: a battle role, a move the family should own, a place in the story, an
animal the game doesn't have yet. Start from that need.

A **redesign** of an early Bestiole (« réinvention fidèle ») keeps:
- its id, types, stats and moves;
- its colours and the feature that marks it in her drawing.

Everything else may change: animal, pose, name, `kind`, Bestiodex text. Reinterpreting it for its place in Papeterre
is a good source of new ideas: the studio turned an old mouse into a surfer riding its tail for a beach region.

## 3. Silhouette and shape language

**The idea is the body.** This is the biggest gap between our drafts and the classic designs. On the classic sheet,
each design is built around one shape whose black silhouette at thumbnail size still shows the twist and the
attitude, with no background and no add-ons. In our failed drafts the idea was bolted on: a painted wave behind it to
explain the surfing, a prow glued to an ordinary body, a personality left to small face marks. Before any detail,
fill the outline in black at 64 px with no background (the silhouette column of the sheet). If the twist and the
personality don't read from that shape alone, redo the pose and the body plan, not the details. Effects (waves,
splashes, speed lines) may help, but never carry the idea: the surfer's belly is its board, and the captain's head is
its prow.

- **Recognisable from its shadow** at battle size (140 px): one body shape plus one feature that breaks the outline.
- **The body is one to three primitives**: a ball, an egg, a bean, a tube, a box on legs, a small upright body. Add
  two to four secondary shapes: head, ears or horns, tail, legs, and the twist. More is clutter.
- **The twist sits on the outline**, where the shadow shows it. Inside the body it vanishes.
- **Gaps**: limbs, tail and ears stand clear somewhere, so the shadow has holes, not one blob.
- **One dominant shape**, chosen by role and type:
  - round = friendly, soft, tough or slow (first forms, Normal, Water, Fairy, big kind tanks);
  - triangles = fast, fierce, hot (Fire, Electric, Dragon, Dark, Flying, strikers);
  - blocks = heavy and sturdy (Rock, Steel, Ground, Fighting tanks).
- **A line of action**: one C or S curve from head to tail tip, every mass hung on it. Stacked blocks read « aucun
  flow ».
- **One gesture**: one limb or the head does the acting; the rest rests. Three busy limbs read « c'est la java ».
- **Memory test**: a child can draw it from memory in under a minute after seeing it once.
- Leave out: fingers (stubs or none), toes, the inside of ears, real teeth (fangs are two triangles), fur, scale and
  feather texture (one tuft stands for all the fur), a spiky outline all round.

## 4. Proportions by stage

- **First form, the baby**: head as big as the body, big low eyes, tiny mouth, short round limbs, a small twist. A
  sitting or tucked pose (Chapardou, Minousse) reads best.
- **Middle form, the teen**: smaller head, longer limbs, an active, cheekier or reckless pose, a bigger twist, two
  small fangs or a tuft.
- **Final form, the adult**: a small head on a big body, a strong stance, the twist at full size, and **a new shape
  language** (a round family turns angular or heavy: a wedge head, long limbs bent at the joints, a new stance).

## 5. Colour

- **One main colour** (its type's by default; breaking it is a deliberate identity choice), a **lighter belly or
  muzzle**, and **one small accent** where the eye should go (eyes, cheeks, a tail tip, a cord, a gem), contrasting in
  value, often warm on cool.
- A family keeps its palette; colour is the strongest family glue.
- Water against a blue body: give the water another hue (pale turquoise) and a dark outline, or it melts into the skin.
- Give even a stone or a shell one warm accent. A single dull colour with no accent is never a favourite.
- No accent of a type it doesn't have (no fire-coloured flames on a Ghost).

## 6. Face

- **One emotion**, the one on the personality card. Mixed signals (a worried brow over a grin) read as fear or
  nonsense. Keep both eyes nearly the same size (the far one only a little smaller for the turn); deliberately
  mismatched eyes read as panic.
- **The eyes set age and mood**: big shiny ovals (`c.eye`), the far one a little smaller. Later forms narrow them (`lid`), but
  keep the shine. One brow line changes the whole face. See the expression table in `reference/drawing.md`.
- **The mouth sits plainly under the nose**, inside the face. Make it small (a smile, an « o », one fang) unless the
  mouth is the idea (a yell of joy, a big laugh).
- **Each form its own expression**: never reuse the baby's face on the adult.
- **Readable at 140 px**: big pupils for joy, a squint for wisdom or mischief. Not subtle lines.

## 7. Detail budget

« Plus tu en rajoutes, pire c'est ». Count before drawing:
- one twist;
- one pattern or marking at most, repeated a few times;
- one prop or habit at most, only if the story needs it;
- no scattered extras: sparkles, stars, pebbles, dust, rosettes, crystals, puffs.

Effects that show the action (spray, speed lines, a splash) count too: two or three marks, not ten.

## 8. Families: the evolution ladder

- **Keep two of three**: the colour, the signature feature, the body plan (a turtle stays a turtle). A child sees the
  family at once. A decoration (a zig-zag cord) is not a family thread: « le zig zag rouge apporte rien ».
- **Each stage its own pose and silhouette**: never the same pose resized (« trop similaires, même pose »). Vary the
  silhouette's direction across the line: compact and low, then tall, then heavy and wide (or the reverse).
- **The form before foreshadows the next**: the middle form shows the first signs of the final's feature (« la
  pré-évolution devrait avoir des signes de son évolution à venir »): a little stone ridge where the prow will grow,
  a shell starting to harden. The final then reads as the line's promise kept.
- **Change**: size and proportions, stance, personality's age, the twist (it grows: bud, flower, crown), and at most
  **one new feature**, grown out of an existing one (fur becomes a mane).
- **Impressive is not fat** (« imposant c'est différent de gros »): a final grows in span, height and sharpness, a lean
  angular body and a high head, never into a rounder, chubbier one.
- **The final is more impressive, not more cluttered**:
  - size and stance first, then one feature enlarged, then at most one or two new features;
  - its **signature part grows into something visibly more impressive** (the shell, the wings, the mane): a new
    structure, not the same part stretched. Tortorrent's plain hull was « moche, pas d'amélioration »;
  - it removes something when it adds;
  - it changes its shape language;
  - its silhouette differs from the form before (the sheet's guard turns red at 65 % overlap; the test fails at 90 %).
- **The final must not be the model's final**: change the body plan (a serpent flying, a four-legged runner, a
  surfer), not just the details.
- **A twist grows out of the body, in front of it**: base sunk in the fur, never pasted behind the outline.
- Never a recolour, a colour flip, « the same but bigger », or a feature taken back.
- Design the whole line together: concept cards, thumbnails and review side by side.

## 9. The house style (« le style maison »)

Every Bestiole looks drawn by the same child (`docs/bestioles.md` « Le style maison »):
- three-quarters, **turned to the left** (`faces: 'left'`), far limbs half hidden behind the body;
- big oval eyes with a white shine, soft cheeks;
- one wobbly graphite outline, dense saturated coloured pencil running over it;
- two or three colours plus one accent;
- shapes a child would draw: round bodies, simple limbs, a big head on a first form;
- legs that read: straight or bent the way the animal bends, every part attached, nothing hanging limp;
- moving parts for battle (`c.part`): a tail, a wing, the twist, blinking eyes;
- the fair copy is automatic (`npm run fair`): its card gone over neatly, never designed.

## 10. Self-review before the critic

At battle size and in silhouette, on `tools/out/redraws-sheet.png`:
1. Can you say its personality in one word from the picture alone?
2. Can you name the animal and the twist from the shadow, in five words?
3. One dominant shape matching role and type, one line of action, one gesture?
4. One main colour (plus belly), one accent where the eye should go?
5. A face that shows the trait, with its mouth under the nose?
6. Within the detail budget, and nothing reading as something else (`reference/drawing.md`, « what reads as what »)?
7. The family obvious side by side, the final bigger and more striking, its own silhouette?
8. Nothing of the model it replaces?
9. One lovable flaw? Could a child see it as a friend, and does it look able to live on its own?
10. Does the strongest contrast sit on the face or the twist? Is any big flat area broken by one small marking?
