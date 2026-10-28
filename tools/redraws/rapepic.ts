import type { P, Redraw } from './crayon.ts';

/**
 * Ponçou grown into a big porcupine, on all fours and turned to the left: a huge fan of quills raised over its
 * back, each one a strip of sandpaper or a nail file (fine sand, red garnet, coarse grey, pink emery), dark
 * brown fur, a long cream snout, a fierce little eye, strong digging claws.
 */
export default {
  id: '106', slug: 'rapepic', seed: 10631, size: [1000, 1000], tilt: -2,
  draw(c) {
    const { shape, paper, stroke, dot, tint, potato, band, spikes, rnd } = c;
    const FUR = '#6b4a2e', FUR2 = '#8a5f3a', CREAM = '#e9d2a6', GRIT = '#4a3420', CLAW = '#ede3c8', PINK = '#f29ac8';
    const STRIPS = ['#d9b77a', '#c4704a', '#8f8c95', '#e39aa6'];
    /** One quill: a strip of sandpaper from its root to a sharp tip, specks of grit along it. */
    const quill = (root: P, tip: P, w: number, col: string) => {
      const mid: P = [(root[0] + tip[0]) / 2, (root[1] + tip[1]) / 2];
      shape(band([root, mid, tip], w, 4), col, { angle: (Math.atan2(tip[1] - root[1], tip[0] - root[0]) * 180) / Math.PI, over: 0.2 });
      for (let k = 1; k < 5; k++) {
        const t = k / 6;
        dot(root[0] + (tip[0] - root[0]) * t + (rnd() - 0.5) * 8, root[1] + (tip[1] - root[1]) * t + (rnd() - 0.5) * 8, 2.2, 2, GRIT);
      }
    };
    // the fan of quills raised over its back: in battle it rattles
    c.part('piquants', { pivot: [620, 600], motion: 'swing', amp: 4, period: 2, behind: true }, () => {
      const o: P = [640, 660];
      for (let k = 0; k < 17; k++) {
        const a = ((-165 + k * 11) * Math.PI) / 180, want = 500 + (k % 3) * 40 - Math.abs(k - 8) * 8;
        // the quills on the right stop short of the edge of the sheet
        const len = Math.cos(a) > 0 ? Math.min(want, (970 - o[0]) / (Math.cos(a) * 0.92)) : want;
        quill([o[0] + Math.cos(a) * 170, o[1] + Math.sin(a) * 150], [o[0] + Math.cos(a) * len * 0.92, o[1] + Math.sin(a) * len * 0.9], 54, STRIPS[k % 4]);
      }
    });
    // the far legs, behind
    shape(band([[420, 720], [400, 840]], 70, 60), FUR, { angle: 90, over: 0 });
    shape(band([[760, 720], [790, 840]], 76, 64), FUR, { angle: 90, over: 0 });
    // the body, dark fur
    shape(potato(590, 650, 270, 175, 12, 0.04), FUR, { angle: 70, over: 0.5 });
    // short quills over the top of its back, in front of the fan
    shape(spikes([[820, 640], [760, 520], [640, 470], [500, 490], [400, 560]], 3, 60).concat([[430, 600], [560, 560], [700, 580], [790, 680]]), '#d9b77a', { angle: 40, over: 0.4 }, {}, false);
    for (let k = 0; k < 24; k++) dot(450 + rnd() * 330, 520 + rnd() * 80, 2.4, 2, GRIT);
    // the near legs, strong, with digging claws
    for (const [x, w] of [[480, 92], [720, 96]] as const) {
      shape(band([[x, 720], [x - 10, 870]], w, w * 0.85), FUR2, { angle: 90, over: 0.2 });
      for (const dx of [-38, -8, 22]) shape([[x + dx - 10, 868], [x + dx - 34, 915], [x + dx + 10, 880]], CLAW, { over: 0 }, { w: 3 }, false);
    }
    // the head held high, dark fur with a cream muzzle
    shape([[470, 500], [500, 640], [420, 720], [300, 740], [175, 710], [130, 650], [190, 590], [300, 500], [390, 470]], FUR2, { angle: 60, over: 0.4 });
    shape([[250, 610], [300, 690], [240, 740], [160, 720], [125, 660], [170, 615]], CREAM, { angle: 20, over: 0.2 });
    dot(130, 650, 19, 16);
    dot(124, 644, 5, 4, '#ffffff');
    // two big orange gnawing teeth
    shape([[175, 712], [178, 768], [205, 770], [205, 716]], '#f0a040', { over: 0 }, { w: 3.5 }, false);
    shape([[208, 716], [210, 764], [236, 762], [234, 712]], '#f0a040', { over: 0 }, { w: 3.5 }, false);
    for (const [a, b] of [[[220, 650], [300, 625]], [[222, 668], [305, 665]]] as [P, P][]) stroke([a, b], { w: 2.5, col: '#f4ead6' });
    // a fierce eye under a bushy cream brow, a round ear
    paper(potato(285, 575, 22, 18, 8, 0.05));
    dot(280, 578, 11, 13);
    dot(276, 572, 4, 4, '#ffffff');
    shape([[230, 545], [330, 530], [345, 552], [240, 566]], CREAM, { over: 0 }, { w: 3.5 });
    shape(potato(430, 480, 34, 32, 8, 0.06), FUR, { over: 0 });
    tint(potato(430, 482, 16, 14, 7, 0.06), PINK, { gap: 3 });
    // only in battle: puffs of sand fly up round its feet
    c.part('sable', { pivot: [500, 900], motion: 'flicker', period: 2.4, extra: true }, () => {
      for (const [x, y, s] of [[260, 920, 1], [880, 910, 0.9], [600, 950, 0.7]] as const) {
        shape(potato(x, y, 55 * s, 28 * s, 9, 0.12), '#d9b77a', { over: 0, press: 0.7 });
        for (let k = 0; k < 5; k++) dot(x + (rnd() - 0.5) * 70 * s, y + (rnd() - 0.5) * 30 * s, 3, 3, GRIT);
      }
    });
  },
} satisfies Redraw;
