import type { Redraw } from './crayon.ts';

/** A purple ghost with a huge toothy grin and red eyes, spiky head, clawed stick arms thrown out. */
export default {
  id: '011', slug: 'ombrouille', seed: 111, size: [1000, 1000], tilt: -4,
  draw(c) {
    const { shape, paper, stroke, band, potato } = c;
    const PURPLE = '#8a4ed6', RED = '#f04a40';
    // stick legs, one kicked out
    shape(band([[420, 640], [330, 780], [250, 900]], 70, 60), PURPLE, { angle: 60 }, {});
    shape(band([[580, 640], [610, 790], [640, 910]], 70, 60), PURPLE, { angle: 100 }, {});
    // arms thrown out, three claws each
    shape(band([[300, 520], [190, 470], [90, 450]], 52, 46), PURPLE, { angle: 20 });
    shape([[100, 415], [15, 360], [70, 440], [5, 465], [75, 478], [30, 540], [115, 490]], PURPLE, { angle: 20, press: 1.1 }, {}, false);
    shape(band([[700, 500], [810, 390], [880, 270]], 52, 46), PURPLE, { angle: 120 });
    shape([[850, 285], [860, 175], [900, 262], [955, 190], [935, 285], [1000, 300], [905, 312]], PURPLE, { angle: 120, press: 1.1 }, {}, false);
    // the head-body: big pointed ears, three spikes on top
    shape([[250, 420], [230, 150], [360, 300], [420, 210], [460, 290], [500, 180], [545, 290], [600, 205], [640, 300], [770, 110], [760, 420],
      [720, 580], [600, 660], [420, 670], [300, 600]], PURPLE, { angle: 80, over: 0.7, press: 1.1 }, {}, false);
    // angry red eyes
    shape([[330, 390], [440, 400], [430, 455], [380, 470], [340, 440]], RED, { angle: 90, over: 0 }, {}, false);
    shape([[560, 400], [670, 385], [665, 440], [620, 470], [575, 455]], RED, { angle: 90, over: 0 }, {}, false);
    stroke([[310, 375], [445, 392]], { w: 5 });
    stroke([[555, 393], [690, 372]], { w: 5 });
    // the grin: white teeth
    paper(potato(500, 545, 175, 70, 12, 0.04));
    for (const x of [390, 440, 495, 550, 605]) stroke([[x, 488 + Math.abs(x - 500) * 0.15], [x + 5, 605 - Math.abs(x - 500) * 0.2]], { w: 3.4 });
    stroke([[335, 540], [665, 545]], { w: 3.4 });
  },
} satisfies Redraw;
