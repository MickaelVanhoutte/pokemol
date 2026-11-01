import type { P, Redraw } from './crayon.ts';

/**
 * A baby skunk on all fours, round and purple, turned to the left: a head as big as its body with a short pointed snout
 * and a pink nose, big shiny eyes, and a huge puffy tail arched over its back, as big as itself. A cream stripe runs
 * from its forehead over its back to the tip of its tail, and a little cream tuft on its head won't lie flat. When it
 * is scared its tail puffs up and lets out a little purple cloud that smells of rotten eggs. Touchy.
 */
export default {
  id: '033', slug: 'pschitou', seed: 3341, size: [1000, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const FUR = '#8a5ac8', DEEP = '#6e44a8', CREAM = '#f6ecd2', TAIL = '#b896e4', PINK = '#f28aa8';
    // the huge puffy tail arched over its back, its cream stripe (it swishes in battle)
    c.part('queue', { pivot: [720, 600], motion: 'swing', amp: 7, period: 1.8, behind: true }, () => {
      const path: P[] = [[720, 600], [840, 470], [820, 290], [660, 220], [540, 280]];
      shape(band(path, 170, 230), FUR, { angle: 60, over: 0.3 });
      // its stripe a pale lavender on the tail, so it doesn't read as a second tail
      shape(band(path.slice(1), 60, 80), TAIL, { angle: 60, over: 0 }, { w: 0.1 });
    });
    // the far legs, behind
    shape(band([[730, 700], [740, 860]], 70, 60), DEEP, { angle: 90 });
    shape(band([[470, 700], [460, 860]], 70, 60), DEEP, { angle: 90 });
    // the round body, the cream stripe running along its back
    shape(potato(620, 640, 230, 150, 12, 0.03), FUR, { angle: 10, over: 0.3 });
    shape(band([[440, 520], [600, 496], [780, 530]], 64, 50), CREAM, { angle: 10, over: 0 }, { w: 0.1 });
    // the near legs
    shape(band([[780, 720], [800, 880]], 76, 66), FUR, { angle: 90 });
    shape(band([[520, 720], [500, 880]], 76, 66), FUR, { angle: 90 });
    // small round ears, the big round head, a short pointed snout
    // (the head drawn 1.25 times bigger round (370, 560): a baby's head, as big as its body)
    const H = ([x, y]: P): P => [370 + (x - 370) * 1.25, 560 + (y - 560) * 1.25];
    const h = (pts: P[]) => pts.map(H);
    shape(potato(...H([330, 410]), 54, 54, 9, 0.05), DEEP, { angle: 60 });
    shape(potato(...H([480, 380]), 62, 62, 9, 0.05), FUR, { angle: 60 });
    shape(h([[290, 470], [370, 400], [480, 400], [560, 470], [570, 590], [500, 680], [380, 700], [300, 660], [220, 640], [170, 610], [180, 580], [250, 560]]), FUR, { angle: 78, over: 0.3 });
    // the cream stripe from its forehead up over its head, and one lock of it that won't lie flat
    shape(h([[330, 470], [380, 420], [460, 400], [540, 420], [470, 440], [400, 470]]), CREAM, { over: 0 }, { w: 3 });
    shape(h([[430, 410], [420, 350], [470, 404]]), CREAM, { over: 0 }, { w: 3 }, false);
    // big shiny eyes, a pink nose at the snout tip, a tiny mouth, pink cheeks
    c.eye(...H([322, 530]), 38, 48);
    c.eye(...H([432, 524]), 50, 62);
    dot(...H([178, 596]), 20, 16, PINK);
    stroke(h([[214, 632], [236, 644], [260, 632]]), { w: 4.5 });
    c.cheek(...H([490, 610]), 34, 20, PINK);
    c.part('paupieres', { pivot: H([376, 528]), motion: 'blink', extra: true }, () => {
      c.lid(...H([322, 530]), 38, 48, FUR);
      c.lid(...H([432, 524]), 50, 62, FUR);
    });
  },
} satisfies Redraw;
