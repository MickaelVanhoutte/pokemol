import type { Redraw } from './crayon.ts';

/**
 * Lumiver grown into a firefly, hovering three-quarters to the left: a plum head and body, lightning-bolt
 * antennae, a big glowing light-bulb belly, two pairs of see-through wings buzzing.
 */
export default {
  id: '092', slug: 'lampyrette', seed: 9201, size: [1000, 1000], tilt: -6,
  draw(c) {
    const { shape, paper, stroke, dot, band, tint, potato } = c;
    const PLUM = '#5d3f92', PLUM2 = '#7556b0', LAMP = '#ffe45a', FIL = '#f29a2a', SKY = '#d6eafc', YEL = '#ffd23a';
    const buzz = { motion: 'flap', amp: 16, period: 0.2 } as const;
    // the far wings, behind
    c.part('ailes-loin', { pivot: [520, 400], ...buzz, behind: true, phase: 0.5 }, () => {
      paper([[520, 400], [560, 250], [650, 150], [750, 130], [770, 200], [700, 310], [570, 420]]);
      tint([[545, 395], [580, 260], [660, 170], [745, 155], [750, 200], [690, 300], [575, 405]], SKY, { gap: 3.6 });
    });
    // the light-bulb belly, glowing, a zig-zag filament
    shape(potato(660, 660, 178, 150, 12, 0.04), LAMP, { angle: 50, over: 0.3, press: 0.95 });
    stroke([[560, 660], [595, 620], [625, 680], [660, 620], [695, 680], [728, 625], [760, 670]], { w: 5, col: FIL });
    paper(potato(720, 575, 34, 18, 8, 0.06));
    // its screw base: plum rings joining the body
    shape([[470, 500], [565, 455], [625, 520], [570, 595], [490, 585]], PLUM, { angle: 100, over: 0.4 });
    stroke([[520, 478], [598, 560]], { w: 4 });
    stroke([[495, 515], [570, 590]], { w: 4 });
    // the body and the head
    shape(potato(455, 455, 98, 92, 10, 0.05), PLUM, { angle: 80, over: 0.5 });
    // the legs, tucked up under it
    shape(band([[420, 535], [370, 590], [395, 645]], 24, 18), PLUM, { angle: 60, over: 0 });
    shape(band([[480, 545], [455, 610], [490, 660]], 24, 18), PLUM, { angle: 60, over: 0 });
    // lightning-bolt antennae
    c.part('antennes', { pivot: [310, 285], motion: 'swing', amp: 9, period: 1.3, behind: true }, () => {
      stroke([[300, 290], [262, 215], [300, 195], [250, 110]], { w: 5, felt: false }, false);
      shape([[250, 110], [225, 70], [262, 88], [255, 50], [285, 100]], YEL, { over: 0 }, { w: 3.5 }, false);
      stroke([[345, 285], [352, 210], [390, 196], [380, 115]], { w: 5 }, false);
      shape([[380, 115], [370, 72], [400, 95], [405, 55], [420, 108]], YEL, { over: 0 }, { w: 3.5 }, false);
    });
    shape(potato(325, 365, 108, 98, 10, 0.04), PLUM2, { angle: 70, over: 0.5 });
    // big round eyes, the far one smaller, a little smile
    paper(potato(272, 350, 28, 38, 8, 0.04));
    paper(potato(360, 343, 36, 46, 8, 0.04));
    dot(268, 358, 14, 21);
    dot(355, 351, 18, 25);
    dot(262, 345, 5, 6, '#ffffff');
    dot(347, 337, 6, 7, '#ffffff');
    tint(potato(398, 405, 22, 13, 7, 0.1), '#f29ac8', { gap: 3 });
    stroke([[282, 418], [312, 432], [345, 422]], { w: 5, col: '#f1e6ee' });
    // the near wings, big: in battle they buzz
    c.part('ailes', { pivot: [470, 385], ...buzz }, () => {
      paper([[470, 385], [515, 220], [610, 100], [730, 60], [785, 115], [720, 245], [595, 375], [500, 420]]);
      tint([[495, 380], [535, 230], [620, 125], [725, 85], [760, 120], [705, 235], [590, 360], [510, 400]], SKY, { gap: 3.6 });
      paper([[505, 425], [640, 380], [790, 360], [845, 420], [770, 478], [630, 475]]);
      tint([[530, 425], [645, 395], [780, 380], [820, 420], [760, 460], [635, 460]], SKY, { gap: 3.6 });
      for (const [x, y] of [[650, 110], [730, 140], [800, 420]] as const) stroke([[500, 400], [x, y]], { w: 3 });
    });
    // in battle little sparks crackle round its lamp
    c.part('etincelles', { pivot: [660, 660], motion: 'flicker', period: 1.9, extra: true }, () => {
      for (const [x, y, s] of [[880, 560, 1], [865, 790, -1], [520, 820, 1], [900, 680, -1]] as const) {
        shape([[x, y - 40], [x + 22 * s, y - 6], [x + 4 * s, y - 2], [x + 18 * s, y + 38], [x - 12 * s, y + 2], [x + 6 * s, y - 4]], YEL, { over: 0 }, { w: 3.5 }, false);
      }
    });
  },
} satisfies Redraw;
