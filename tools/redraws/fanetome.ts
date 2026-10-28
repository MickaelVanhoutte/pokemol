import type { Redraw } from './crayon.ts';

/**
 * A flower once pressed in a herbarium, back as a little ghost: a faded pink bell for a hood, a pale face under
 * it, a veil of a body trailing off into a wisp, dried leaves for arms, loose petals drifting round it.
 */
export default {
  id: '098', slug: 'fanetome', seed: 9801, size: [1000, 1000], tilt: 3,
  draw(c) {
    const { shape, paper, stroke, dot, tint, potato } = c;
    const PINK = '#d99ab0', LAV = '#b7a0d6', SAGE = '#9caf88', DSAGE = '#7d9068';
    // the far leaf arm, behind
    c.part('feuille-loin', { pivot: [560, 560], motion: 'swing', amp: -6, period: 2.8, behind: true, phase: 0.4 }, () => {
      shape([[545, 565], [640, 520], [725, 448], [748, 395], [688, 418], [610, 478]], DSAGE, { angle: 40, over: 0 });
      stroke([[560, 560], [700, 440]], { w: 3 });
    });
    // the veil of a body, trailing into a wisp; the stem running down it
    paper([[300, 500], [505, 495], [585, 600], [608, 722], [668, 822], [742, 885], [650, 872], [608, 902], [548, 852], [488, 882], [452, 802], [362, 702], [302, 602]]);
    tint([[330, 520], [500, 515], [570, 610], [590, 720], [640, 820], [600, 860], [540, 830], [480, 850], [455, 780], [370, 690], [320, 600]], LAV, { gap: 3.8, wash: 0.25 });
    stroke([[455, 500], [500, 620], [560, 740], [640, 850]], { w: 8, col: SAGE });
    // the near leaf arm: in battle it waves
    c.part('feuille', { pivot: [340, 565], motion: 'swing', amp: 9, period: 2.2 }, () => {
      shape([[345, 568], [255, 545], [185, 482], [162, 418], [232, 450], [300, 505]], SAGE, { angle: 50, over: 0 });
      stroke([[340, 562], [190, 440]], { w: 3 });
      stroke([[175, 430], [158, 405], [175, 395]], { w: 3.5 });
    });
    // the head: a pale face under a faded bell of petals; in battle it bows
    c.part('tete', { pivot: [430, 505], motion: 'nod', amp: 8, period: 3.6 }, () => {
      paper(potato(398, 452, 122, 96, 10, 0.04));
      shape([[218, 385], [248, 252], [338, 170], [462, 158], [562, 222], [602, 332], [592, 425], [542, 402], [500, 445], [452, 410], [402, 452], [342, 418],
        [282, 444], [232, 432]], PINK, { angle: 70, over: 0.4, press: 0.9 });
      // its petals, folded down into a bell, and the green cup on top
      for (const [x0, y0, x1, y1] of [[342, 418], [452, 410], [542, 402]].map(([x, y]) => [x, y, x + (430 - x) * 0.25, 190])) {
        stroke([[x0, y0], [x0 + (x1 - x0) * 0.4 - 18, y0 + (y1 - y0) * 0.55], [x1, y1]], { w: 3 });
      }
      shape([[370, 185], [395, 120], [430, 165], [462, 105], [482, 168], [530, 128], [515, 195], [440, 210]], SAGE, { angle: 80, over: 0 }, {}, false);
      // dark hollow ghost eyes, the far one smaller, a little round mouth
      dot(338, 470, 20, 28);
      dot(430, 462, 26, 34);
      dot(331, 460, 6, 7, '#ffffff');
      dot(421, 450, 7, 8, '#ffffff');
      paper(potato(382, 528, 16, 13, 7, 0.06), { w: 3.5 });
    });
    // only in battle: petals drift round it
    c.part('petales', { pivot: [500, 500], motion: 'flicker', period: 2.8, extra: true }, () => {
      for (const [x, y, col, a] of [[820, 300, PINK, 30], [880, 520, LAV, -20], [170, 250, LAV, 60], [790, 760, PINK, -40]] as const) {
        const r = (a * Math.PI) / 180, dx = Math.cos(r) * 34, dy = Math.sin(r) * 34;
        shape([[x - dx, y - dy], [x - dy * 0.5, y + dx * 0.5], [x + dx, y + dy], [x + dy * 0.5, y - dx * 0.5]], col, { over: 0 }, { w: 3.5 });
      }
    });
  },
} satisfies Redraw;
