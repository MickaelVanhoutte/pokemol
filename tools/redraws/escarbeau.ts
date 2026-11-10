import type { Redraw } from './crayon.ts';
import { CHAR, CHAR2, EMBER, GLOW, GREY, emberFeather } from './fusinet.ts';
import { flame } from './anatomy.ts';

/**
 * The grown charcoal crow, the night arsonist: a tall lean crow leaning forward, head low below its shoulders, its wings
 * half opened and their long flight feathers burning at the edges, shedding cinders. A crest of smouldering feathers on
 * its head, a long sharp beak, one narrowed eye with a gleam. It flies over the roofs at night and steals every flame.
 */
export default {
  id: '140', slug: 'escarbeau', seed: 14001, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, potato } = c;
    // the far wing, half open behind, its feathers burning at the tips
    c.part('aileLoin', { pivot: [600, 420], motion: 'flap', amp: 4, period: 2.2, behind: true }, () => {
      for (const [a, b, d] of [[[600, 420], [780, 230], [860, 200]], [[620, 440], [840, 300], [920, 290]], [[640, 470], [880, 390], [950, 400]]] as [number, number][][]) {
        emberFeather(c, [a, [b[0] - 20, b[1] - 30], d, [b[0] + 10, b[1] + 20], [a[0] + 40, a[1] + 30]], 0.3);
        flame(c, d[0], d[1], 60, 60, 34, GLOW, EMBER);
      }
    });
    // the long tail
    shape([[700, 700], [880, 780], [940, 860], [860, 860], [700, 780]], CHAR2, { angle: 30, over: 0.2 });
    // legs gripping the ground
    stroke([[560, 780], [540, 900], [490, 920]], { w: 10, col: '#3e342c' });
    stroke([[540, 900], [570, 930]], { w: 8, col: '#3e342c' });
    stroke([[640, 770], [650, 900], [610, 920]], { w: 10, col: '#2e2620' });
    // the lean body, leaning forward, chest out
    shape([[380, 420], [500, 360], [640, 400], [740, 520], [760, 660], [700, 780], [560, 800], [460, 720], [400, 580]], CHAR, { angle: 60, over: 0.45 });
    c.tint(potato(470, 600, 70, 140, 10, 0.06), GREY, { angle: 60, wash: 0.55 });
    // the near wing, half open forward and down, burning edges
    c.part('aile', { pivot: [560, 480], motion: 'flap', amp: 4, period: 2.2 }, () => {
      for (const [a, b, d] of [[[560, 480], [620, 680], [600, 800]], [[580, 500], [700, 700], [730, 810]], [[600, 520], [770, 660], [830, 740]]] as [number, number][][]) {
        emberFeather(c, [a, [b[0] - 34, b[1]], d, [b[0] + 34, b[1] - 10], [a[0] + 40, a[1]]], 0.3);
        flame(c, d[0], d[1], 160, 54, 30, GLOW, EMBER);
      }
    });
    // the head, low and forward, a smouldering crest
    shape([[300, 420], [340, 340], [430, 320], [500, 360], [500, 440], [420, 480], [330, 470]], CHAR, { angle: 60, over: 0.3 });
    c.part('crete', { pivot: [440, 320], motion: 'swing', amp: 2, period: 2.4 }, () => {
      emberFeather(c, [[420, 330], [470, 230], [520, 210], [500, 280], [470, 340]], 0.4);
      emberFeather(c, [[450, 340], [540, 270], [580, 270], [540, 330], [490, 360]], 0.4);
    });
    // the long sharp beak
    shape([[330, 410], [170, 440], [110, 470], [200, 470], [330, 460]], '#4a4250', { angle: 0, over: 0 }, { w: 4.5 }, false);
    stroke([[320, 446], [150, 462]], { w: 3 });
    // one narrowed eye, gleaming, a heavy brow
    c.eye(390, 392, 30, 30, '#f2803a', { lid: 0.35, skin: CHAR });
    stroke([[340, 356], [440, 372]], { w: 8, col: '#1e1a24' });
    // three cinders drifting off
    for (const [x, y, r] of [[900, 160, 10], [960, 240, 8], [880, 880, 9]] as [number, number, number][]) c.dot(x, y, r, r, EMBER);
    c.part('paupieres', { pivot: [390, 392], motion: 'blink', extra: true }, () => {
      c.lid(390, 392, 30, 30, CHAR);
    });
  },
} satisfies Redraw;
