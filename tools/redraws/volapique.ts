import type { Redraw } from './crayon.ts';
import { fishBody } from './sautevase.ts';
import { BDEEP, BLUE, GOLD, SEA, SILVER, forkTail, wingFin } from './fretivole.ts';

/**
 * The grown flying fish, the dart: a long sleek fish shooting low over the sea, its snout grown into a sharp spear,
 * gliding on four wing-fins now (a second pair grew behind the first) swept back like the feathers of an arrow. A deep
 * blue back, a white belly, one narrowed eye with a glint: it picks its target and does not miss.
 */
export default {
  id: '138', slug: 'volapique', seed: 13803, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke } = c;
    // spray streaks where its tail skims the sea
    c.part('sillage', { pivot: [820, 760], motion: 'nod', amp: 1, period: 2, decor: true, behind: true }, () => {
      stroke([[620, 800], [780, 780], [960, 790]], { w: 5, col: '#5aa8c8' });
      for (const [x, y] of [[860, 740], [900, 720], [940, 744]] as [number, number][]) stroke([[x, y + 30], [x + 18, y]], { w: 4.5, col: '#5aa8c8' });
    });
    // the far wing-fins, swept back at the same angle
    c.part('ailesLoin', { pivot: [450, 450], motion: 'flap', amp: 4, period: 1.2, behind: true }, () => {
      wingFin(c, [450, 450], [[480, 350], [560, 250], [670, 190], [780, 180], [740, 280]], GOLD);
      wingFin(c, [680, 520], [[700, 450], [760, 390], [840, 370], [820, 440]], GOLD);
    });
    // the deeply forked tail
    c.part('queue', { pivot: [900, 610], motion: 'swing', amp: 4, period: 1, behind: true }, () => {
      forkTail(c, [890, 610], [990, 480], [985, 760]);
    });
    // a dart of a body: the spear grown out of its upper jaw, the head widening to the shoulder, a thin tail stalk
    fishBody(c, [[40, 470], [200, 480], [380, 500], [560, 540], [740, 580], [900, 610]], (k) => (k < 0.3 ? 12 + (k / 0.3) * 268 : 280 - ((k - 0.3) / 0.7) * 236), BLUE, SILVER, 48);
    c.tint([[40, 470], [80, 462], [140, 466], [140, 480], [80, 480]], BDEEP, { angle: 0, wash: 0.8 });
    c.tint([[260, 420], [420, 410], [600, 450], [760, 520], [600, 490], [420, 450]], BDEEP, { angle: 10, wash: 0.5 });
    stroke([[400, 440], [430, 500], [420, 570]], { w: 4.5 });
    // the near wing-fins, swept back like the fletching of an arrow
    c.part('ailes', { pivot: [430, 560], motion: 'flap', amp: 5, period: 1.2 }, () => {
      wingFin(c, [430, 560], [[480, 660], [570, 760], [690, 820], [810, 830], [760, 740]], GOLD);
      wingFin(c, [680, 600], [[700, 670], [770, 730], [860, 750], [830, 680]], GOLD);
    });
    // the spear: its upper jaw running on past the lower jaw as a thin lance, a darker tip
    shape([[160, 458], [24, 448], [2, 456], [24, 466], [160, 482]], BLUE, { angle: 0, over: 0 }, { w: 4 }, false);
    c.tint([[0, 456], [40, 452], [40, 462], [10, 460]], BDEEP, { wash: 0.9 });
    // a dark streak through the eye like a mask
    c.tint([[220, 450], [300, 432], [380, 446], [380, 490], [300, 500], [220, 486]], BDEEP, { angle: 0, wash: 0.8 });
    // one eye, open, focused: a low straight brow
    c.eye(300, 470, 40, 44, '#241c38', { lid: 0.16, skin: '#2c5aa8' });
    stroke([[246, 436], [300, 420], [356, 410]], { w: 8 });
    stroke([[160, 512], [240, 516]], { w: 5.5 });
    // speed lines behind it
    stroke([[900, 330], [990, 310]], { w: 5 });
    stroke([[880, 380], [990, 370]], { w: 5 });
    void SEA;
    c.part('paupieres', { pivot: [300, 470], motion: 'blink', extra: true }, () => {
      c.lid(300, 470, 40, 44, BLUE);
    });
  },
} satisfies Redraw;
