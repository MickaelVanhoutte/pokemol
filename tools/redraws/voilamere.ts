import type { P, Redraw } from './crayon.ts';

/**
 * Médusoie grown into a great jellyfish of the open sea, turned to the left: a tall violet dome of layered
 * tissue paper with a see-through sail along its top, a ring of green poison barbs round its rim, frills of
 * crepe paper underneath and long knotted tentacles trailing down, a stern look.
 */
export default {
  id: '102', slug: 'voilamere', seed: 10211, size: [1000, 1000], tilt: 3,
  draw(c) {
    const { shape, paper, stroke, dot, tint, band, spikes, potato } = c;
    const VIOLET = '#8e5cc8', PINK = '#f2a0c8', LILAC = '#c4a6ec', TEAL = '#4fb8b2', POISON = '#7bc043', DEEP = '#5d3a8e', SEA = '#bfe3f7';
    /** A long tentacle hanging down in waves from (x, y), knotted with poison. */
    const tentacle = (x: number, y: number, len: number, sway: number, w: number, col: string) => {
      const path: P[] = Array.from({ length: 8 }, (_, k) => [x + Math.sin(k * 1.1 + x) * sway, y + (k * len) / 7]);
      shape(band(path, w, w * 0.35), col, { angle: 90, over: 0.2 });
      for (const k of [3, 5]) shape(potato(path[k][0], path[k][1], w * 0.42, w * 0.32, 7, 0.06), POISON, { over: 0 });
    };
    // tentacles at the back, behind everything
    c.part('tentacules-loin', { pivot: [600, 560], motion: 'swing', amp: 7, period: 3, behind: true, phase: 0.5 }, () => {
      tentacle(640, 540, 420, 34, 36, TEAL);
      tentacle(740, 500, 380, -30, 32, LILAC);
      tentacle(560, 560, 400, 28, 30, DEEP);
    });
    // the sail along its top, a tall ruffled crest: in battle it ripples
    c.part('voile', { pivot: [520, 230], motion: 'swing', amp: 5, period: 2.4, behind: true }, () => {
      const crest: P[] = [[300, 270], [320, 175], [370, 120], [410, 160], [450, 70], [505, 115], [545, 20], [600, 95], [655, 55], [680, 135], [740, 140], [750, 250],
        [640, 225], [520, 215], [400, 245]];
      shape(crest, TEAL, { angle: 80, over: 0.3 });
      tint([[330, 250], [360, 165], [450, 95], [545, 50], [650, 80], [720, 160], [735, 230], [520, 200]], PINK, { gap: 3.4, wash: 0.3, press: 0.7 });
      for (const [x, y] of [[370, 125], [450, 75], [545, 25], [655, 60], [740, 145]] as const) stroke([[x, y + 10], [x + 10, 235]], { w: 3, col: '#2e7f7a' });
    });
    // a ring of green poison barbs round the rim, behind it
    shape(spikes([[180, 560], [330, 610], [500, 620], [680, 600], [820, 540]], 4, 46).concat([[820, 520], [180, 540]]), POISON, { angle: 70, over: 0.2 }, {}, false);
    // the great dome, layered tissue paper
    const dome: P[] = [[175, 555], [190, 400], [280, 275], [420, 205], [580, 200], [720, 260], [810, 380], [830, 520], [785, 580], [720, 560], [660, 600], [590, 575],
      [520, 610], [450, 580], [380, 612], [310, 580], [240, 600]];
    shape(dome, VIOLET, { angle: 60, over: 0.5 });
    tint([[600, 240], [760, 300], [750, 450], [610, 420]], PINK, { gap: 3.2, wash: 0.45 });
    tint([[230, 420], [360, 380], [380, 510], [240, 540]], LILAC, { gap: 3.2, wash: 0.5 });
    tint([[430, 240], [560, 230], [570, 330], [440, 340]], TEAL, { gap: 3.2, wash: 0.4 });
    stroke([[600, 240], [760, 300], [750, 450], [610, 420], [600, 240]], { w: 2.5, col: '#c46a9e' }, false);
    // round glowing spots
    for (const [x, y, r] of [[560, 300, 18], [700, 380, 14], [300, 340, 12]] as const) shape(potato(x, y, r, r, 8, 0.05), PINK, { over: 0 });
    // frills of crepe paper under the rim
    shape(spikes([[260, 600], [400, 640], [540, 645], [700, 610]], 6, -40).concat([[700, 590], [260, 580]]), PINK, { angle: 90, over: 0.2 }, {}, false);
    // two long curtains of ruffled crepe paper hanging from its middle
    for (const [x0, col] of [[400, PINK], [520, LILAC]] as const) {
      const down: P[] = [[x0, 600], [x0 - 30, 720], [x0 - 10, 840], [x0 - 40, 940]];
      const up: P[] = [[x0 + 30, 950], [x0 + 60, 840], [x0 + 40, 720], [x0 + 70, 600]];
      shape(spikes(down, 4, 26).concat(spikes(up, 4, 26)), col, { angle: 90, over: 0.3 }, {}, false);
    }
    // a stern face, turned to the left
    paper(potato(300, 440, 26, 22, 8, 0.04));
    paper(potato(410, 432, 36, 30, 8, 0.04));
    dot(296, 446, 12, 14);
    dot(404, 438, 17, 19);
    dot(292, 438, 4, 4, '#ffffff');
    dot(398, 429, 5, 5, '#ffffff');
    stroke([[262, 410], [330, 425]], { w: 7 });
    stroke([[370, 405], [455, 395]], { w: 7 });
    stroke([[310, 520], [355, 505], [400, 515]], { w: 5 });
    // long tentacles in front: in battle they sway
    c.part('tentacules', { pivot: [450, 620], motion: 'swing', amp: 6, period: 2.6 }, () => {
      tentacle(270, 600, 390, 30, 40, LILAC);
      tentacle(350, 640, 350, -34, 40, TEAL);
      tentacle(600, 640, 340, 30, 40, DEEP);
      tentacle(680, 600, 380, -28, 38, VIOLET);
    });
    // only in battle: drops of poison drip from its barbs
    c.part('gouttes', { pivot: [500, 600], motion: 'flicker', period: 1.8, extra: true }, () => {
      for (const [x, y] of [[150, 650], [860, 610], [110, 470], [900, 450]] as const) {
        shape([[x, y - 34], [x + 18, y + 4], [x, y + 22], [x - 18, y + 4]], POISON, { over: 0 }, { w: 3.5 });
      }
      for (const [x, y, r] of [[120, 250, 20], [880, 200, 16]] as const) {
        paper(potato(x, y, r, r, 8, 0.03), { w: 3 });
        tint(potato(x, y, r * 0.8, r * 0.8, 8, 0.03), SEA, { gap: 3 });
      }
    });
  },
} satisfies Redraw;
