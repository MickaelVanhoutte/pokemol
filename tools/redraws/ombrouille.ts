import type { Redraw } from './crayon.ts';

/** A purple ghost leaning to the left: a huge toothy grin, red eyes, spiky head, a clawed arm thrown forward. */
export default {
  id: '011', slug: 'ombrouille', seed: 112, size: [1000, 1000], tilt: -4,
  draw(c) {
    const { shape, paper, stroke, band, potato } = c;
    const PURPLE = '#8a4ed6', RED = '#f04a40';
    // the far leg and far arm, behind on the right
    shape(band([[600, 640], [650, 790], [690, 910]], 64, 56), PURPLE, { angle: 100 });
    c.part('bras-loin', { pivot: [720, 470], motion: 'swing', amp: 8, period: 1.9, behind: true }, () => {
      shape(band([[720, 470], [820, 380], [880, 260]], 50, 44), PURPLE, { angle: 120 });
      shape([[850, 275], [860, 165], [900, 252], [955, 180], [935, 275], [1000, 290], [905, 302]], PURPLE, { angle: 120, press: 1.1 }, {}, false);
    });
    // the head-body: big pointed ears, three spikes on top, face on the left
    shape([[230, 420], [200, 150], [330, 300], [390, 210], [430, 290], [470, 180], [515, 290], [570, 205], [610, 300], [760, 120], [770, 420],
      [730, 580], [610, 660], [420, 670], [290, 600]], PURPLE, { angle: 80, over: 0.7, press: 1.1 }, {}, false);
    // the near leg kicking forward
    shape(band([[400, 640], [310, 770], [230, 890]], 70, 60), PURPLE, { angle: 60 });
    // angry red eyes, the far one narrower
    shape([[270, 390], [350, 400], [345, 450], [310, 465], [280, 440]], RED, { angle: 90, over: 0 }, {}, false);
    shape([[460, 400], [580, 385], [575, 440], [525, 470], [475, 455]], RED, { angle: 90, over: 0 }, {}, false);
    stroke([[255, 375], [360, 392]], { w: 5 });
    stroke([[450, 393], [600, 372]], { w: 5 });
    // the grin, shifted left
    paper(potato(420, 545, 170, 68, 12, 0.04));
    for (const x of [310, 360, 415, 470, 525]) stroke([[x, 490 + Math.abs(x - 420) * 0.15], [x + 5, 605 - Math.abs(x - 420) * 0.2]], { w: 3.4 });
    stroke([[260, 540], [580, 545]], { w: 3.4 });
    // the near arm thrown forward, three claws
    c.part('bras', { pivot: [300, 500], motion: 'swing', amp: 8, period: 1.5 }, () => {
      shape(band([[300, 500], [190, 470], [90, 450]], 54, 46), PURPLE, { angle: 20 });
      shape([[100, 415], [15, 360], [70, 440], [5, 465], [75, 478], [30, 540], [115, 490]], PURPLE, { angle: 20, press: 1.1 }, {}, false);
    });
  },
} satisfies Redraw;
