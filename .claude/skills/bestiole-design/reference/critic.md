# The critic

A fresh agent (general-purpose) that judges a finished drawing before the owner sees it. It catches anatomy, readability
and clutter well. It does not know the owner's taste, so it never replaces the owner's review.

## Brief it

Give it:
- the candidate: a crop of its row on `tools/out/redraws-sheet.png`, or `tools/out/critic/candidates.png` (full size
  plus battle size);
- `tools/out/critic/classic-reference.jpg`: **the professional bar**, the 151 designs of the classic monster games
  the owner gave as reference (local only: `tools/out/` is gitignored; never commit, publish or name them in the
  repo). The question is always: would this stand on that sheet without looking amateur?
- `tools/out/refs-sheet.png`: the designs the owner approved, the house bar;
- the form before (`tools/out/critic/previous.png`);
- the concept card with the **personality card**;
- `reference/owner-taste.md`;
- from round 2 on, **its own previous verdicts**, so it stays consistent. It once advised planting a leg, then lifting
  it again.

Give it only the concept, never your own opinion of the drawing. **Tell it to be harsh**: the owner found the critic
« pas très critique ». It must:
- default to FAIL;
- score appeal against the classic sheet, not against other children's drawings: a design that would look amateur
  or generic next to the classic sheet gets 6 at most;
- name the classic design it most resembles, in its answer only (never in the repo). If it is too close, FAIL.

Ask for:
- a score out of 10 on each of:
  1. concept (reads as the animal and the twist);
  2. silhouette;
  3. anatomy (limbs attached where the real animal's are, feet the right way);
  4. flow (one line of action);
  5. detail budget;
  6. face;
  7. family (resemblance and change);
  8. appeal next to the classic sheet and the refs;
  9. **personality** (the trait reads from expression, pose and one habit; would a child want it on their team?);
- the worst problem and at most three fixes, in drawing terms, with coordinates on the image it saw;
- PASS or FAIL.

**PASS**: no score under 7, appeal and personality at least 8.

## Run it

- Keep one critic agent per batch and resume it with SendMessage: it remembers the bar.
- **At most three rounds per design.** If round three still fails, the concept or the pose is wrong: go back to
  thumbnails or concept cards. Don't push the details further.
- Filter its fixes through the house rules: it suggested a bandana, which is a worn prop (refused).
- Translate its coordinates (on the trimmed card) to canvas coordinates before editing.
- A PASS is not the owner's approval: the turtles passed with appeal 8 and were refused for lacking personality.
