import type { Fair, P } from '../redraws/crayon.ts';

/**
 * Ptérocaille's fair copy, Rock/Dragon, the same drawing grown up: bigger wings with a scalloped edge and
 * hooked claws at each wrist, jagged rock shards jutting from its back, its chin, its arm and its tail, bigger
 * jaws opened wide on two rows of teeth, a longer crest, thicker legs with long talons, its tail ending in a
 * dragon's spade, a fierce amber eye under a heavy brow, and the gold star on its body. It faces left, like its
 * drawing. Its head is a moving part of its own, so the rig keeps it in front of the near wing, as on the card.
 */
export default {
  id: '050', slug: 'pterocaille', seed: 50050, size: [1250, 1000], tilt: -4,
  draw(c) {
    const { shape, stroke, dot, potato, shake, band } = c;
    const ROCK = '#8a83a6', WING = '#b3aac8', DARK = '#5e577a', STONE = '#6d6688', AMBER = '#f0a028', MOUTH = '#7a2238', DRAGON = '#b8324e';
    /** Round lobes pushed out along a path (the scalloped edge of a wing). */
    const bumps = (path: P[], n: number, h: number): P[] => {
      const out: P[] = [];
      for (let i = 0; i < path.length - 1; i++) {
        const [a, b] = [path[i], path[i + 1]];
        const nx = -(b[1] - a[1]), ny = b[0] - a[0], l = Math.hypot(nx, ny) || 1;
        for (let k = 0; k < n; k++) {
          const hh = h * (0.8 + c.rnd() * 0.4);
          for (const [f, up] of [[0, 0], [0.18, 0.7], [0.5, 1], [0.82, 0.7]] as P[]) {
            const t = (k + f) / n;
            out.push([a[0] + (b[0] - a[0]) * t + (nx / l) * hh * up, a[1] + (b[1] - a[1]) * t + (ny / l) * hh * up]);
          }
        }
      }
      out.push(path[path.length - 1]);
      return out;
    };
    /** A jagged rock shard from its base (a, b) out to its tip. */
    const shard = (a: P, b: P, tip: P, col = STONE) => {
      const m: P = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const kink: P = [m[0] + (tip[0] - m[0]) * 0.55 + (b[0] - a[0]) * 0.18, m[1] + (tip[1] - m[1]) * 0.55 + (b[1] - a[1]) * 0.18];
      shape([a, tip, kink, b], col, { over: 0, angle: 30 }, { w: 5 }, false);
      c.shine([[a[0] + (tip[0] - a[0]) * 0.3, a[1] + (tip[1] - a[1]) * 0.3], [a[0] + (tip[0] - a[0]) * 0.6, a[1] + (tip[1] - a[1]) * 0.6]], 5);
    };
    /** A hooked claw from its base to its tip, bent to one side (bend > 0: to the left of base → tip). */
    const claw = (base: P, tip: P, w: number, bend: number) => {
      const dx = tip[0] - base[0], dy = tip[1] - base[1], l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
      const mid: P = [base[0] + dx * 0.55 + nx * bend, base[1] + dy * 0.55 + ny * bend];
      shape([[base[0] + nx * w, base[1] + ny * w], [mid[0] + nx * w * 0.55, mid[1] + ny * w * 0.55], tip, [mid[0] - nx * w * 0.35, mid[1] - ny * w * 0.35], [base[0] - nx * w, base[1] - ny * w]], DARK, { over: 0, angle: 20 }, { w: 5 }, false);
    };
    // the far wing, up and back, bigger, a claw at its wrist and a shard on its arm
    c.part('aile-loin', { pivot: [610, 460], motion: 'flap', amp: -12, period: 0.95, behind: true, phase: 0 }, () => {
      shape([[600, 450], [770, 150], [1080, 30], ...bumps([[1080, 30], [1040, 250], [900, 360], [780, 420], [660, 500]], 1, 50)], WING, { angle: 60 });
      for (const t of [0.4, 0.75]) stroke([[770 + (1080 - 770) * t, 150 + (30 - 150) * t], [700 + t * 260, 420 - t * 120]], { w: 4.5, col: STONE });
      claw([755, 165], [705, 95], 24, 12);
      claw([792, 152], [778, 82], 20, 10);
      stroke([[600, 450], [770, 150], [1080, 30]], { w: 11 });
    });
    // the tail, longer, rock shards along it and a dragon's spade at its tip
    c.part('queue', { pivot: [770, 610], motion: 'swing', amp: 4, period: 2.4, behind: true }, () => {
      shard([870, 622], [940, 640], [935, 545]);
      shard([990, 640], [1055, 638], [1070, 560]);
      shape(shake([[760, 580], [960, 635], [1130, 625], [1135, 668], [950, 692], [750, 645]], 5), ROCK, { angle: 10 });
      shape([[1135, 646], [1100, 585], [1240, 648], [1100, 712]], DARK, { angle: 40, over: 0 }, {}, false);
      c.tint([[1150, 646], [1128, 618], [1205, 648], [1128, 678]], DRAGON, { angle: 40 });
    });
    // thicker legs with long talons
    for (const x of [640, 720]) {
      shape(band([[x, 620], [x + 12, 700], [x + 20, 760]], 30, 22), ROCK, { angle: 85, over: 0 });
      for (const dx of [-30, 0, 30]) shape([[x + 10, 756], [x + 20 + dx * 1.5, 822], [x + 30, 758]], '#ffffff', { over: 0 }, { w: 4.5 }, false);
    }
    // the shards jutting from its back, then the body, its stone spots and the star
    shard([570, 478], [640, 455], [560, 320]);
    shard([655, 452], [730, 458], [700, 300]);
    shard([745, 468], [810, 500], [850, 360]);
    shape(potato(620, 560, 205, 115, 10, 0.04), ROCK, { angle: -30 });
    for (const [x, y, r] of [[600, 640, 18], [790, 560, 16], [740, 500, 20]] as [number, number, number][]) shape(potato(x, y, r, r * 0.8, 7, 0.12), DARK, { over: 0 }, { w: 4 });
    c.star(690, 590, 46, 8);
    c.shine([[700, 470], [760, 482]], 7);
    // the near wing, spread down and forward, bigger, a claw at its wrist and a shard on its arm
    c.part('aile', { pivot: [560, 540], motion: 'flap', amp: 12, period: 0.95, phase: 0 }, () => {
      shape([[560, 520], [370, 260], [70, 150], ...bumps([[70, 150], [110, 330], [210, 470], [380, 580], [570, 610]], 1, -50)], WING, { angle: 60 });
      for (const t of [0.3, 0.6]) stroke([[370 + (70 - 370) * t, 260 + (150 - 260) * t], [390 - t * 210, 560 - t * 120]], { w: 4.5, col: STONE });
      shard([440, 350], [495, 420], [530, 290]);
      claw([355, 268], [305, 198], 24, 12);
      claw([392, 258], [378, 188], 20, 10);
      stroke([[560, 520], [370, 260], [70, 150]], { w: 11 });
    });
    // the head over the near wing (a part of its own, so the rig keeps it in front): the crest, longer, swept back
    c.part('tete', { pivot: [530, 465], motion: 'nod', amp: 4, period: 2.8 }, () => {
      shape(shake([[500, 395], [380, 318], [250, 280], [460, 318], [610, 300], [540, 360]], 4), DARK, { angle: 20, over: 0 });
      // the head and its jaws opened wide: the upper jaw, the red mouth with two rows of teeth, the lower jaw
      shape([[535, 470], [500, 405], [430, 380], [340, 395], [200, 425], [70, 440], [210, 452], [380, 455], [470, 462]], ROCK, { angle: 10 });
      shape([[470, 462], [380, 456], [210, 453], [75, 444], [120, 500], [260, 510], [420, 496]], MOUTH, { angle: 10, over: 0 }, { w: 5 }, false);
      for (const x of [130, 190, 250, 310, 370]) c.paper([[x, 449], [x + 13, 478], [x + 26, 451]], { w: 4 }, false);
      for (const x of [175, 235, 295, 355]) c.paper([[x, 505], [x + 12, 478], [x + 25, 503]], { w: 4 }, false);
      shape([[540, 478], [470, 474], [420, 494], [260, 508], [115, 500], [105, 518], [260, 540], [420, 530], [520, 515]], ROCK, { angle: 10 });
      shard([300, 534], [370, 530], [320, 610]);
      // a fierce amber eye under a heavy brow
      shape([[420, 410], [462, 398], [480, 420], [440, 428]], AMBER, { over: 0 }, { w: 4.5 }, false);
      dot(452, 414, 8, 10);
      stroke([[400, 382], [492, 402]], { w: 12 });
      dot(140, 436, 5, 4);
      c.shine([[330, 405], [400, 395]], 6);
    });
  },
} satisfies Fair;
